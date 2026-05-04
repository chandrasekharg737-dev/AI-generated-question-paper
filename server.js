const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint for Question Generation
app.post('/api/generate', async (req, res) => {
    try {
        const { subject, topic, difficulty, numQuestions, questionType } = req.body;

        if (!subject || !topic || !difficulty || !numQuestions || !questionType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an expert educator. Generate a high-quality question paper for the following:
            Subject: ${subject}
            Topic: ${topic}
            Difficulty: ${difficulty}
            Number of Questions: ${numQuestions}
            Question Type: ${questionType}

            Return the response ONLY as a JSON object with the following structure:
            {
                "metadata": {
                    "subject": "${subject}",
                    "topic": "${topic}",
                    "difficulty": "${difficulty}",
                    "numQuestions": ${numQuestions},
                    "questionType": "${questionType}"
                },
                "questions": [
                    {
                        "id": 1,
                        "text": "Question text here",
                        "answer": "Detailed answer key/rubric here",
                        "marks": 5,
                        "type": "MCQ/Short/Long/TF"
                    }
                ]
            }

            Rules:
            1. For "Mixed" question type, provide a good variety of MCQs, Short, and Long answers.
            2. Assign appropriate marks based on difficulty and question type (e.g., MCQ: 1-2, Short: 3-5, Long: 10-15).
            3. Ensure the content is academically rigorous and relevant to the topic.
            4. Do not include any text before or after the JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from the response (sometimes AI wraps it in markdown blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const questionPaper = JSON.parse(jsonMatch[0]);
        res.json(questionPaper);

    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate question paper. Please try again.' });
    }
});

// Fallback to index.html for SPA behavior if needed (though not strictly necessary here)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Using App Name: ${process.env.APP_NAME || 'AI Question Generator'}`);
});

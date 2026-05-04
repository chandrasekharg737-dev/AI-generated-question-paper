document.addEventListener('DOMContentLoaded', () => {
    const APP_NAME = 'AI Question Paper Generator';

    // DOM Elements
    const homeSection = document.getElementById('home-section');
    const generatorSection = document.getElementById('generator-section');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    
    const startBtn = document.getElementById('start-btn');
    const backToHomeBtn = document.getElementById('back-to-home');
    const generatorForm = document.getElementById('generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const startOverBtn = document.getElementById('start-over-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const copyBtn = document.getElementById('copy-btn');
    
    const questionsContainer = document.getElementById('questions-container');
    const paperMetadata = document.getElementById('paper-metadata');
    
    const navLinks = document.querySelectorAll('.nav-link');
    const navOutputLink = document.getElementById('nav-output-link');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    const assistantBubble = document.getElementById('assistant-bubble');
    const assistantText = document.getElementById('assistant-text');
    const assistantRobot = document.querySelector('.assistant-robot');
    const robotFace = document.querySelector('.robot-face');

    const mainRobot = document.getElementById('main-robot');
    const robotBase = document.getElementById('robot-base');

    // State
    let currentPaper = null;
    let paperHistory = JSON.parse(localStorage.getItem('paperHistory')) || [];

    // Navigation Functions
    function showSection(sectionId) {
        document.body.classList.remove('theme-home', 'theme-generator', 'theme-output', 'theme-history');
        if (sectionId === 'home-section') document.body.classList.add('theme-home');
        else if (sectionId === 'generator-section' || sectionId === 'loading-section') document.body.classList.add('theme-generator');
        else if (sectionId === 'results-section') document.body.classList.add('theme-output');
        else if (sectionId === 'history-section') document.body.classList.add('theme-history');

        mainRobot.className = 'robot-img'; 
        robotBase.className = 'hologram-base';
        
        if (sectionId === 'home-section') {
            mainRobot.classList.add('robot-home');
            robotBase.classList.add('base-home');
        } else if (sectionId === 'generator-section' || sectionId === 'loading-section') {
            mainRobot.classList.add('robot-generator');
            robotBase.classList.add('base-generator');
        } else if (sectionId === 'results-section') {
            mainRobot.classList.add('robot-output');
            robotBase.classList.add('base-output');
        } else if (sectionId === 'history-section') {
            mainRobot.classList.add('robot-output');
            robotBase.classList.add('base-output');
            renderHistory();
        }

        triggerWave();
        if (sectionId === 'generator-section') speak("Please fill all the details to continue.");
        else if (sectionId === 'loading-section') speak("Hang tight! I'm crunching the numbers...");
        else if (sectionId === 'results-section') speak("Great! Your question paper is ready.");
        else if (sectionId === 'history-section') speak("Here are your past creations.");

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });

        [homeSection, generatorSection, loadingSection, resultsSection].forEach(section => {
            section.classList.remove('active');
            setTimeout(() => { if(!section.classList.contains('active')) section.classList.add('hidden'); }, 300);
        });

        setTimeout(() => {
            const target = document.getElementById(sectionId);
            target.classList.remove('hidden');
            setTimeout(() => { target.classList.add('active'); }, 10);
        }, 300);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (link.hasAttribute('disabled')) return;
            showSection(link.getAttribute('data-section'));
        });
    });

    startBtn.addEventListener('click', () => showSection('generator-section'));
    backToHomeBtn.addEventListener('click', () => showSection('home-section'));
    startOverBtn.addEventListener('click', () => { generatorForm.reset(); showSection('generator-section'); });

    regenerateBtn.addEventListener('click', () => {
        if (!currentPaper || !currentPaper.metadata) return;
        showSection('loading-section');
        setExpression('thinking', 0);
        regenerateBtn.disabled = true;
        
        setTimeout(() => {
            currentPaper = generateQuestions(currentPaper.metadata);
            renderResults(currentPaper.metadata);
            showSection('results-section');
            regenerateBtn.disabled = false;
        }, 1500);
    });

    generatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            subject: document.getElementById('subject').value.trim(),
            topic: document.getElementById('topic').value.trim(),
            difficulty: document.getElementById('difficulty').value,
            numQuestions: parseInt(document.getElementById('num-questions').value),
            questionType: document.getElementById('question-type').value
        };

        if (!formData.subject || !formData.topic || !formData.difficulty || !formData.numQuestions || !formData.questionType) {
            speak("Whoops! Please fill all the details to continue.");
            return;
        }

        showSection('loading-section');
        setExpression('thinking', 0);
        generateBtn.disabled = true;

        setTimeout(() => {
            currentPaper = generateQuestions(formData);
            renderResults(formData);
            speak("Great! Your question paper is ready.", 4000);
            
            const historyItem = { id: Date.now(), timestamp: new Date().toLocaleString(), metadata: formData, paper: currentPaper };
            paperHistory.unshift(historyItem);
            localStorage.setItem('paperHistory', JSON.stringify(paperHistory));
            
            navOutputLink.removeAttribute('disabled');
            setExpression('happy', 4000);
            showSection('results-section');
            generateBtn.disabled = false;
        }, 2000);
    });

    // Standalone Generation Logic (Moved from Server to Frontend)
    function generateQuestions(data) {
        const { subject, topic, difficulty, numQuestions, questionType } = data;
        const questions = [];
        const templates = {
            'MCQ': [`Role of ${topic} in ${subject}?`, `Key component of ${topic}?`, `Management of ${topic}?`, `Optimization of ${topic}?`, `Variable affecting ${topic}?`],
            'Short': [`Principles of ${topic} in ${subject}?`, `Approaches to ${topic}?`, `Lifecycle of ${topic}?`, `Success factors for ${topic}?`, `Impact of ${topic} on ${subject}?`],
            'Long': [`Evaluation of ${topic} in ${subject}`, `Strategy for ${topic}`, `Impact analysis of ${topic}`, `Proof of ${topic} efficiency`, `Future of ${topic}`],
            'TF': [`${topic} is the standard in ${subject}`, `${topic} reduces overhead`, `${topic} is modern`, `${topic} needs hardware`, `${topic} is secure`]
        };

        for (let i = 0; i < numQuestions; i++) {
            let type = questionType === 'Mixed' ? ['MCQ', 'Short', 'Long', 'TF'][i % 4] : 
                       ({ 'Multiple Choice (MCQ)': 'MCQ', 'Short Answer': 'Short', 'Long Essay': 'Long', 'True / False': 'TF' }[questionType] || 'Short');
            
            let rawText = templates[type][i % 5];
            let baseMarks = type === 'MCQ' || type === 'TF' ? 1 : (type === 'Short' ? 3 : 10);
            questions.push({
                id: i + 1,
                text: `${difficulty} Level: ${rawText}`,
                answer: `Model answer for ${topic} at ${difficulty} level.`,
                marks: difficulty === 'Hard' ? Math.ceil(baseMarks * 1.5) : (difficulty === 'Easy' ? Math.max(1, Math.floor(baseMarks * 0.8)) : baseMarks),
                type: type
            });
        }
        return { metadata: data, questions };
    }

    function renderResults(data) {
        let totalMarks = 0;
        currentPaper.questions.forEach(q => totalMarks += q.marks);
        paperMetadata.className = 'exam-header';
        paperMetadata.innerHTML = `
            <div class="exam-row"><span><strong>Subject:</strong> ${data.subject}</span><span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span></div>
            <div class="exam-row"><span><strong>Topic:</strong> ${data.topic}</span><span><strong>Difficulty:</strong> ${data.difficulty}</span></div>
            <div class="exam-row"><span><strong>Total Marks:</strong> ${totalMarks}</span></div>
        `;

        questionsContainer.innerHTML = `<div class="instructions-section"><h4>General Instructions:</h4><ul><li>All questions are compulsory.</li><li>Read carefully.</li></ul></div>`;
        currentPaper.questions.forEach((q, index) => {
            const qElement = document.createElement('div');
            qElement.className = 'question-item';
            qElement.style.animationDelay = `${index * 0.05}s`;
            qElement.innerHTML = `<div class="question-header"><span>Question ${q.id}</span><span>[${q.marks} Marks]</span></div><div class="q-text">${q.text}</div><div class="q-answer"><strong>Key:</strong> ${q.answer}</div>`;
            questionsContainer.appendChild(qElement);
        });
    }

    copyBtn.addEventListener('click', () => {
        if (!currentPaper) return;
        let text = `${currentPaper.metadata.subject}: ${currentPaper.metadata.topic}\n\n`;
        currentPaper.questions.forEach(q => text += `Q${q.id}. [${q.marks}M] ${q.text}\n`);
        navigator.clipboard.writeText(text).then(() => {
            const old = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅';
            setTimeout(() => copyBtn.innerHTML = old, 2000);
        });
    });

    document.getElementById('download-btn').addEventListener('click', () => window.print());

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = paperHistory.length ? '' : '<div class="empty-history">No papers generated yet.</div>';
        paperHistory.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'history-item glass-card';
            card.innerHTML = `<div class="history-info"><h3>${item.metadata.subject}</h3><p>${item.metadata.topic}</p></div>
                <div class="history-btn-group">
                    <button class="view-past-btn small-btn primary-btn" data-index="${index}">View</button>
                    <button class="delete-past-btn small-btn secondary-btn" data-index="${index}">Delete</button>
                </div>`;
            historyList.appendChild(card);
        });

        document.querySelectorAll('.view-past-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = paperHistory[btn.getAttribute('data-index')];
                currentPaper = item.paper;
                renderResults(item.metadata);
                navOutputLink.removeAttribute('disabled');
                showSection('results-section');
            });
        });

        document.querySelectorAll('.delete-past-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                paperHistory.splice(btn.getAttribute('data-index'), 1);
                localStorage.setItem('paperHistory', JSON.stringify(paperHistory));
                renderHistory();
            });
        });
    }

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Clear all history?')) { paperHistory = []; localStorage.setItem('paperHistory', JSON.stringify(paperHistory)); renderHistory(); }
    });

    function speak(text, duration = 5000) {
        if (!assistantText || !assistantBubble) return;
        assistantBubble.classList.remove('show');
        setTimeout(() => {
            assistantText.textContent = text;
            assistantBubble.classList.add('show');
            setTimeout(() => assistantBubble.classList.remove('show'), duration);
        }, 100);
    }

    function triggerWave() { assistantRobot.classList.add('waving'); setTimeout(() => assistantRobot.classList.remove('waving'), 3000); }
    assistantRobot.addEventListener('click', triggerWave);

    function setExpression(exp, dur = 3000) {
        robotFace.className = 'robot-face ' + exp;
        if (dur > 0) setTimeout(() => robotFace.className = 'robot-face', dur);
    }

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        document.querySelectorAll('.glow-orb, .bg-robot').forEach(el => el.style.transform = `translate(${x}px, ${y}px)`);
    });
});

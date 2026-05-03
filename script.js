document.addEventListener('DOMContentLoaded', () => {
    // Environment Configuration (Mocking .env behavior)
    const CONFIG = {
        AI_API_KEY: 'your_api_key_here', // Placeholder for .env value
        APP_NAME: 'AI Question Paper Generator'
    };

    // DOM Elements
    const homeSection = document.getElementById('home-section');
    const generatorSection = document.getElementById('generator-section');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    
    const startBtn = document.getElementById('start-btn');
    const backToHomeBtn = document.getElementById('back-to-home');
    const generatorForm = document.getElementById('generator-form');
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

    // Robot visual elements
    const mainRobot = document.getElementById('main-robot');
    const robotBase = document.getElementById('robot-base');

    // State
    let currentPaper = null;
    let paperHistory = JSON.parse(localStorage.getItem('paperHistory')) || [];

    // Navigation Functions
    function showSection(sectionId) {
        // Update theme classes
        document.body.classList.remove('theme-home', 'theme-generator', 'theme-output', 'theme-history');
        if (sectionId === 'home-section') document.body.classList.add('theme-home');
        else if (sectionId === 'generator-section' || sectionId === 'loading-section') document.body.classList.add('theme-generator');
        else if (sectionId === 'results-section') document.body.classList.add('theme-output');
        else if (sectionId === 'history-section') document.body.classList.add('theme-history');

        // Update robot visual state based on section
        mainRobot.className = 'robot-img'; // reset
        robotBase.className = 'hologram-base'; // reset
        
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
            mainRobot.classList.add('robot-output'); // Teaching pose for history
            robotBase.classList.add('base-output');
            renderHistory();
        }

        // Assistant Speech & Animation Context
        triggerWave();
        if (sectionId === 'generator-section') {
            speak("Please fill all the details to continue. Click generate to create your questions!");
        } else if (sectionId === 'loading-section') {
            speak("Hang tight! I'm crunching the numbers...");
        } else if (sectionId === 'results-section') {
            speak("Great! Your question paper is ready.");
        } else if (sectionId === 'history-section') {
            speak("Looking for something specific? Here are your past creations.");
        }

        // Update nav links active state
        navLinks.forEach(link => {
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Hide all sections
        [homeSection, generatorSection, loadingSection, resultsSection].forEach(section => {
            section.classList.remove('active');
            setTimeout(() => {
                if(!section.classList.contains('active')) {
                    section.classList.add('hidden');
                }
            }, 300); // Wait for fade out animation
        });

        // Show target section
        setTimeout(() => {
            const target = document.getElementById(sectionId);
            target.classList.remove('hidden');
            // Small delay to allow display block to apply before adding active class for animation
            setTimeout(() => {
                target.classList.add('active');
            }, 10);
        }, 300);
    }

    // Navigation Click Handlers
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (link.hasAttribute('disabled')) return;
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Event Listeners
    startBtn.addEventListener('click', () => {
        showSection('generator-section');
    });

    backToHomeBtn.addEventListener('click', () => {
        showSection('home-section');
    });

    startOverBtn.addEventListener('click', () => {
        generatorForm.reset();
        showSection('generator-section');
    });

    regenerateBtn.addEventListener('click', () => {
        if (!currentPaper || !currentPaper.metadata) return;
        
        showSection('loading-section');
        setExpression('thinking', 0);
        setTimeout(() => {
            generateQuestions(currentPaper.metadata);
            renderResults(currentPaper.metadata);
            showSection('results-section');
        }, 2000);
    });

    // Form Submission
    generatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Custom Validation
        const subject = document.getElementById('subject').value.trim();
        const topic = document.getElementById('topic').value.trim();
        const difficulty = document.getElementById('difficulty').value;
        const numQs = document.getElementById('num-questions').value;
        const qType = document.getElementById('question-type').value;

        const errorBox = document.getElementById('form-error');
        if (!subject || !topic || !difficulty || !numQs || !qType) {
            speak("Whoops! Please fill all the details to continue.");
            errorBox.textContent = "⚠️ Please fill in all required fields before generating.";
            errorBox.classList.remove('hidden');
            errorBox.classList.add('shake');
            setTimeout(() => errorBox.classList.remove('shake'), 500);
            return;
        }
        
        errorBox.classList.add('hidden');

        // Get form data
        const formData = {
            subject: document.getElementById('subject').value,
            topic: document.getElementById('topic').value,
            difficulty: document.getElementById('difficulty').value,
            numQuestions: parseInt(document.getElementById('num-questions').value),
            questionType: document.getElementById('question-type').value
        };

        // Show loading state
        showSection('loading-section');
        setExpression('thinking', 0);

        // Simulate AI generation process (delay)
        setTimeout(() => {
            generateQuestions(formData);
            renderResults(formData);
            
            // Save to history
            const historyItem = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                metadata: formData,
                paper: currentPaper
            };
            paperHistory.unshift(historyItem);
            localStorage.setItem('paperHistory', JSON.stringify(paperHistory));
            
            navOutputLink.removeAttribute('disabled');
            setExpression('happy', 4000);
            showSection('results-section');
        }, 2500);
    });

    // Mock Data Generator
    function generateQuestions(data) {
        const { subject, topic, difficulty, numQuestions, questionType } = data;
        const questions = [];
        
        // Use the API Key (In a real implementation, this would be an API call)
        console.log(`System: ${CONFIG.APP_NAME} | Authenticating with API Key: ${CONFIG.AI_API_KEY ? 'Present' : 'Missing'}`);
        
        // Templates
        const mcqTemplates = [
            `Which of the following best describes the primary role of ${topic} within the field of ${subject}? \n\nA) It acts as a secondary mechanism for optimization.\nB) It provides the foundational structure for core operations.\nC) It is rarely used in modern applications.\nD) It depends entirely on external variables.`,
            `In ${subject}, when dealing with ${topic}, what is the most common constraint encountered during implementation? \n\nA) Memory overhead\nB) Algorithmic complexity\nC) Hardware limitations\nD) Network latency`,
            `Which component is NOT typically associated with ${topic} in advanced ${subject} systems? \n\nA) Dynamic scaling\nB) Static rendering\nC) Heuristic analysis\nD) Predictive modeling`,
            `Consider the following scenario: A system utilizing ${topic} fails unexpectedly. According to standard ${subject} principles, what is the most likely cause? \n\nA) Type mismatch\nB) Resource starvation\nC) Syntax error\nD) Unauthorized access`,
            `What is the theoretical upper bound for efficiency when applying ${topic} to standard ${subject} paradigms? \n\nA) O(1)\nB) O(log n)\nC) O(n)\nD) O(n^2)`,
            `Which of these is a direct consequence of integrating ${topic} into a legacy ${subject} architecture? \n\nA) Immediate performance degradation\nB) Improved modularity and abstraction\nC) Loss of data integrity\nD) Increased coupling`,
            `When comparing ${topic} to older methodologies in ${subject}, which advantage is most frequently cited by researchers? \n\nA) Lower initial setup cost\nB) Greater flexibility in edge cases\nC) Absolute deterministic behavior\nD) Reduction in necessary documentation`,
            `Identify the core principle that governs the behavior of ${topic} in a typical ${subject} environment. \n\nA) Principle of Least Privilege\nB) Single Responsibility Principle\nC) Conservation of Mass\nD) The Uncertainty Principle`,
            `If a developer modifies the core parameters of ${topic}, which part of the ${subject} lifecycle is most heavily impacted? \n\nA) Deployment Phase\nB) Testing and Validation\nC) Requirements Gathering\nD) UI/UX Design`,
            `Which mathematical or logical model best represents the standard operation of ${topic}? \n\nA) Linear Regression\nB) Boolean Algebra\nC) Directed Acyclic Graphs\nD) Differential Equations`,
            `What is the primary trade-off when maximizing the utility of ${topic} in ${subject}? \n\nA) Speed vs. Accuracy\nB) Cost vs. Quality\nC) Security vs. Usability\nD) Scalability vs. Maintainability`,
            `Which industry standard directly addresses the implementation of ${topic} within ${subject}? \n\nA) ISO 9001\nB) IEEE Standard Protocols\nC) W3C Guidelines\nD) RFC Documentation`,
            `In a distributed ${subject} environment, how does ${topic} typically handle synchronization? \n\nA) Polling\nB) Event-driven callbacks\nC) Shared memory locks\nD) Token passing`,
            `What is the most effective debugging technique when troubleshooting ${topic} failures? \n\nA) Print statement debugging\nB) Automated unit testing\nC) Remote telemetry analysis\nD) Profiling and tracing`,
            `Which metric is most relevant for evaluating the success of ${topic} in a production ${subject} setting? \n\nA) Throughput\nB) Lines of Code (LOC)\nC) Compilation Time\nD) Cyclomatic Complexity`
        ];

        const shortTemplates = [
            `Define the core principles of ${topic} and provide one specific scenario where it is applied in ${subject}.`,
            `Briefly contrast two different approaches to implementing ${topic}. Which one is preferred in modern ${subject} and why?`,
            `Explain the significance of ${topic} in the broader context of ${subject}. What problem does it fundamentally solve?`,
            `List three critical factors to consider when designing a system based on ${topic}.`,
            `How does the integration of ${topic} improve the overall stability of a ${subject} framework?`,
            `Summarize the historical evolution of ${topic} within the discipline of ${subject}.`,
            `Identify and briefly explain two major limitations or drawbacks of using ${topic}.`,
            `Describe the typical lifecycle of ${topic} from conceptualization to deployment in ${subject}.`,
            `What role does ${topic} play in ensuring scalability within a growing ${subject} project?`,
            `Explain how ${topic} interacts with other foundational concepts in ${subject}. Give a concrete example.`,
            `Outline the standard testing procedure used to validate ${topic} implementations.`,
            `How has the advent of cloud computing altered the way ${topic} is utilized in ${subject}?`,
            `Differentiate between the theoretical model of ${topic} and its practical application.`,
            `What are the security implications associated with ${topic}?`,
            `Provide a real-world analogy that accurately explains the mechanism of ${topic} in ${subject}.`
        ];

        const longTemplates = [
            `Provide a comprehensive analysis of ${topic}. Your answer should cover its historical development in ${subject}, its theoretical foundations, and its modern applications in industry.`,
            `Critically evaluate the role of ${topic} in solving complex problems within ${subject}. Formulate a detailed case study where its absence would lead to systemic failure.`,
            `Discuss the future trends and potential advancements of ${topic}. How might emerging technologies within ${subject} disrupt current methodologies?`,
            `Design a high-level architecture that heavily relies on ${topic}. Justify your design decisions based on core ${subject} principles and address potential bottlenecks.`,
            `Compare and contrast ${topic} with its primary alternative in the field of ${subject}. Under what specific conditions would you choose one over the other? Evaluate both technical and business factors.`,
            `Analyze the impact of ${topic} on performance optimization in ${subject}. Construct a theoretical experiment to measure its efficiency gains.`,
            `Explore the ethical and societal implications of widespread ${topic} adoption within ${subject}. Are there potential negative consequences that practitioners must mitigate?`,
            `Trace the lifecycle of a complex project in ${subject} where ${topic} is the central technology. Detail the challenges faced at each stage (planning, execution, maintenance) and how they are overcome.`,
            `In the context of enterprise-scale ${subject}, how does ${topic} facilitate integration between disparate legacy systems? Provide a detailed mechanism of action.`,
            `Imagine a scenario where the standard rules governing ${topic} are suddenly inverted or deprecated. Reconstruct the foundational theories of ${subject} to adapt to this paradigm shift.`,
            `Write an in-depth review of the mathematical or logical proofs that establish the validity of ${topic} in ${subject}.`,
            `How does ${topic} contribute to resilience and fault tolerance? Map out a disaster recovery plan that heavily leverages this concept.`,
            `Evaluate the learning curve and resource investment required to master ${topic} for a professional in ${subject}. Is the ROI justified by the performance gains?`,
            `Synthesize a new framework that combines ${topic} with machine learning techniques to automate complex ${subject} workflows. Detail the structural components.`,
            `Critique the current academic literature surrounding ${topic}. What are the major gaps in research, and what directions should future ${subject} studies take?`
        ];

        const tfTemplates = [
            `True or False: In the context of ${subject}, ${topic} always guarantees optimal performance regardless of scale. Explain your reasoning briefly.`,
            `True or False: The fundamental laws of ${subject} dictate that ${topic} cannot exist without a pre-defined schema.`,
            `True or False: Historically, ${topic} was considered deprecated before recent advancements in ${subject} revived its utility.`,
            `True or False: Implementing ${topic} requires a complete overhaul of existing ${subject} architectures.`,
            `True or False: The primary metric for evaluating ${topic} is solely based on execution speed.`,
            `True or False: ${topic} is universally compatible with all modern ${subject} frameworks without modification.`,
            `True or False: The theoretical basis of ${topic} was established prior to the widespread adoption of the internet.`,
            `True or False: Utilizing ${topic} inherently reduces the security footprint of a ${subject} application.`
        ];

        // Shuffle helper
        const shuffle = (array) => {
            let currentIndex = array.length, randomIndex;
            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }
            return array;
        };

        const modifyForDifficulty = (text, diff) => {
            if (diff === 'Easy') {
                return text.replace(/Critically evaluate/g, "Briefly describe")
                           .replace(/Provide a comprehensive analysis/g, "Give a basic overview")
                           .replace(/Discuss the future trends/g, "List some common uses")
                           .replace(/Design a high-level architecture/g, "Draw a simple diagram")
                           .replace(/Compare and contrast/g, "What is the difference between")
                           .replace(/Analyze the impact/g, "How does")
                           .replace(/Explore the ethical and societal implications/g, "What are some basic rules")
                           .replace(/Trace the lifecycle/g, "List the steps")
                           .replace(/In the context of enterprise-scale/g, "In a small project")
                           .replace(/advanced/g, "basic")
                           .replace(/complex/g, "simple")
                           .replace(/theoretical upper bound/g, "general idea")
                           .replace(/primary role/g, "main job");
            } else if (diff === 'Medium') {
                return text.replace(/Critically evaluate/g, "Evaluate")
                           .replace(/Provide a comprehensive analysis/g, "Analyze")
                           .replace(/enterprise-scale/g, "standard")
                           .replace(/theoretical upper bound/g, "expected efficiency");
            }
            return text; // Hard
        };

        // Determine question mix
        let typesToGenerate = [];
        if (questionType === 'Mixed') {
            const mcqCount = Math.floor(numQuestions * 0.4);
            const shortCount = Math.floor(numQuestions * 0.4);
            const longCount = numQuestions - mcqCount - shortCount; // remaining
            
            for(let i=0; i<mcqCount; i++) typesToGenerate.push('MCQ');
            for(let i=0; i<shortCount; i++) typesToGenerate.push('Short');
            for(let i=0; i<longCount; i++) typesToGenerate.push('Long');
        } else {
            let mappedType = 'MCQ';
            if (questionType === 'Short Answer') mappedType = 'Short';
            if (questionType === 'Long Essay') mappedType = 'Long';
            if (questionType === 'True / False') mappedType = 'TF';
            for(let i=0; i<numQuestions; i++) typesToGenerate.push(mappedType);
        }

        let pool = {
            'MCQ': shuffle([...mcqTemplates, ...mcqTemplates, ...mcqTemplates]), // We have 15 unique, multiply lightly just in case they request 50 MCQs
            'Short': shuffle([...shortTemplates, ...shortTemplates, ...shortTemplates]),
            'Long': shuffle([...longTemplates, ...longTemplates, ...longTemplates]),
            'TF': shuffle([...tfTemplates, ...tfTemplates, ...tfTemplates])
        };

        let currentSection = "";
        const sectionTitles = {
            'MCQ': 'Section A: MCQs (1 Mark Each)',
            'Short': 'Section B: Short Answer (3 Marks Each)',
            'Long': 'Section C: Long Answer (5 Marks Each)',
            'TF': 'Section D: True / False (1 Mark Each)'
        };

        // For Mixed, group by type and sort logically
        const typeOrder = { 'MCQ': 1, 'Short': 2, 'Long': 3, 'TF': 4 };
        if (questionType === 'Mixed') {
            typesToGenerate.sort((a, b) => typeOrder[a] - typeOrder[b]);
        }

        let qNum = 1;
        for (let i = 0; i < typesToGenerate.length; i++) {
            const type = typesToGenerate[i];
            
            // Add section header if type changes (useful for Mixed)
            if (questionType === 'Mixed' && currentSection !== type) {
                currentSection = type;
                questions.push({
                    isSectionHeader: true,
                    text: sectionTitles[type]
                });
            }

            let rawText = pool[type].pop() || `Explain the core concept of ${topic} in relation to ${subject}.`; // Fallback
            let qText = modifyForDifficulty(rawText, difficulty);
            
            const generateMockAnswer = (qType) => {
                if (qType === 'MCQ') {
                    const options = ['A', 'B', 'C', 'D'];
                    const correct = options[Math.floor(Math.random() * options.length)];
                    return `Correct Option: ${correct} - This aligns directly with standard principles of ${topic} in ${subject}.`;
                } else if (qType === 'Short') {
                    return `Expected Output: Students should identify that ${topic} provides critical optimization. A valid real-world example in ${subject} must be provided to receive full marks.`;
                } else if (qType === 'Long') {
                    return `Marking Rubric:<br>- 30%: Historical context and theoretical foundation of ${topic}.<br>- 40%: Detailed analysis of its application within ${subject}.<br>- 30%: Critical evaluation of bottlenecks and future trends.<br>(Examiner note: Look for structured arguments and correct terminology.)`;
                } else if (qType === 'TF') {
                    const isTrue = Math.random() > 0.5;
                    return `Answer: ${isTrue ? 'True' : 'False'}. The statement ${isTrue ? 'accurately reflects' : 'misrepresents'} the fundamental constraints of ${topic}.`;
                }
                return "Answer key not available.";
            };
            let ansText = generateMockAnswer(type);

            
            let marks = 1;
            if (type === 'Short') marks = 3;
            if (type === 'Long') marks = 5;
            if (type === 'TF') marks = 1;

            if (difficulty === 'Hard') {
                marks = Math.ceil(marks * 1.5);
            } else if (difficulty === 'Medium') {
                marks = Math.ceil(marks * 1.2);
            }

            questions.push({
                isSectionHeader: false,
                id: qNum++,
                text: qText,
                answer: ansText,
                marks: marks,
                type: type
            });
        }

        currentPaper = {
            metadata: data,
            questions: questions
        };
    }

    // Render Results to UI
    function renderResults(data) {
        // Calculate total marks and duration
        let totalMarks = 0;
        let totalMinutes = 0;
        currentPaper.questions.forEach(q => {
            if (q.marks) totalMarks += q.marks;
            if (q.type === 'MCQ' || q.type === 'TF') totalMinutes += 2;
            else if (q.type === 'Short') totalMinutes += 8;
            else if (q.type === 'Long') totalMinutes += 20;
        });

        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Render Exam Header
        paperMetadata.className = 'exam-header';
        paperMetadata.innerHTML = `
            <div class="exam-row">
                <span><strong>Subject:</strong> ${data.subject}</span>
                <span><strong>Date:</strong> ${today}</span>
            </div>
            <div class="exam-row">
                <span><strong>Topic:</strong> ${data.topic}</span>
                <span><strong>Duration:</strong> ${durationStr}</span>
            </div>
            <div class="exam-row">
                <span><strong>Total Marks:</strong> ${totalMarks}</span>
                <span><strong>Difficulty:</strong> ${data.difficulty}</span>
            </div>
        `;

        // Render Questions
        questionsContainer.innerHTML = `
            <div class="instructions-section">
                <h4>General Instructions:</h4>
                <ul>
                    <li>All questions are compulsory.</li>
                    <li>Read each question carefully before attempting.</li>
                    <li>Marks for each question/section are indicated in the margin.</li>
                    <li>Use of unfair means will lead to immediate disqualification.</li>
                </ul>
            </div>
        `;
        
        currentPaper.questions.forEach((q, index) => {
            const delay = index * 0.05; // Staggered animation
            
            if (q.isSectionHeader) {
                const secElement = document.createElement('div');
                secElement.className = 'section-header';
                secElement.style.animationDelay = `${delay}s`;
                secElement.innerHTML = `<h3>${q.text}</h3>`;
                questionsContainer.appendChild(secElement);
                return;
            }

            const formattedText = q.text.replace(/\n/g, '<br>');
            
            const qElement = document.createElement('div');
            qElement.className = 'question-item';
            qElement.style.animationDelay = `${delay}s`;
            qElement.innerHTML = `
                <div class="question-header">
                    <span class="q-number">Question ${q.id}</span>
                    <span class="q-marks">[${q.marks} Marks]</span>
                </div>
                <div class="q-text">${formattedText}</div>
                <div class="q-answer"><strong>Answer Key:</strong> <br> ${q.answer}</div>
            `;
            questionsContainer.appendChild(qElement);
        });

        // Set random motivational message
        const motivations = [
            "✨ Keep learning and believe in yourself. Every small step today builds your success tomorrow. Stay curious and keep growing.",
            "🌟 Success is not final, failure is not fatal: it is the courage to continue that counts. Keep pushing forward!",
            "💡 Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
            "🚀 Your potential is limitless. Embrace the challenges, for they are the stepping stones to mastery.",
            "🧠 The beautiful thing about learning is that no one can take it away from you. Keep expanding your mind!"
        ];
        const randomMsg = motivations[Math.floor(Math.random() * motivations.length)];
        const motEl = document.getElementById('motivational-text');
        if (motEl) motEl.innerHTML = randomMsg;
    }

    // Copy to clipboard functionality
    copyBtn.addEventListener('click', () => {
        if (!currentPaper) return;
        
        let textContent = `--- ${currentPaper.metadata.subject}: ${currentPaper.metadata.topic} ---\n`;
        textContent += `Difficulty: ${currentPaper.metadata.difficulty} | Type: ${currentPaper.metadata.questionType}\n\n`;
        
        currentPaper.questions.forEach(q => {
            textContent += `Q${q.id}. [${q.marks} Marks]\n${q.text}\n\n`;
        });

        navigator.clipboard.writeText(textContent).then(() => {
            // Visual feedback
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard');
        });
    });

    // Mock PDF Download functionality
    document.getElementById('download-btn').addEventListener('click', () => {
        alert('This would trigger a PDF download in a full implementation. (e.g. using html2pdf.js or jsPDF)');
    });

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        if (paperHistory.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No papers generated yet. Start creating!</div>';
            return;
        }

        paperHistory.forEach((item, index) => {
            const historyCard = document.createElement('div');
            historyCard.className = 'history-item glass-card';
            historyCard.innerHTML = `
                <div class="history-info">
                    <h3>${item.metadata.subject}</h3>
                    <p><strong>Topic:</strong> ${item.metadata.topic}</p>
                    <p class="history-date">${item.timestamp}</p>
                </div>
                <div class="history-btn-group">
                    <button class="view-past-btn small-btn primary-btn" data-index="${index}">View</button>
                    <button class="delete-past-btn small-btn secondary-btn" data-index="${index}">Delete</button>
                </div>
            `;
            historyList.appendChild(historyCard);
        });

        // Add listeners
        document.querySelectorAll('.view-past-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.getAttribute('data-index');
                currentPaper = paperHistory[idx].paper;
                renderResults(paperHistory[idx].metadata);
                navOutputLink.removeAttribute('disabled');
                showSection('results-section');
            });
        });

        document.querySelectorAll('.delete-past-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.getAttribute('data-index');
                paperHistory.splice(idx, 1);
                localStorage.setItem('paperHistory', JSON.stringify(paperHistory));
                renderHistory();
            });
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all history?')) {
                paperHistory = [];
                localStorage.setItem('paperHistory', JSON.stringify(paperHistory));
                renderHistory();
            }
        });
    }

    // Floating Assistant Logic
    function speak(text, duration = 5000) {
        if (!assistantText || !assistantBubble) return;
        
        // Reset state
        if (assistantBubble.speakTimeout) clearTimeout(assistantBubble.speakTimeout);
        assistantBubble.classList.remove('show');
        
        // Slight delay for animation reset
        setTimeout(() => {
            assistantText.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
            assistantBubble.classList.add('show');
            
            // Show actual text after typing delay
            assistantBubble.speakTimeout = setTimeout(() => {
                assistantText.textContent = text;
                // Auto-hide after duration
                assistantBubble.speakTimeout = setTimeout(() => {
                    assistantBubble.classList.remove('show');
                }, duration);
            }, 1000);
        }, 100);
    }

    // Initial greeting
    setTimeout(() => {
        speak("Hi! I'm here to help you generate your question paper.");
        triggerWave();
    }, 2000);
    
    function triggerWave() {
        if (!assistantRobot) return;
        assistantRobot.classList.add('waving');
        setTimeout(() => {
            assistantRobot.classList.remove('waving');
        }, 3000);
    }

    assistantRobot.addEventListener('click', () => {
        triggerWave();
        setExpression('surprised');
        const phrases = [
            "I'm here to help you build the best exams!",
            "Did you know? I can generate any subject in seconds!",
            "Need more variety? Try the 'Mixed' question type!",
            "I'm feeling very efficient today!",
            "Education is the future, and I'm your digital tutor!",
            "Need to print? I've already formatted everything for you!",
            "I can calculate the total marks automatically!"
        ];
        speak(phrases[Math.floor(Math.random() * phrases.length)]);
    });

    function setExpression(expression, duration = 3000) {
        if (!robotFace) return;
        robotFace.className = 'robot-face ' + expression;
        if (duration > 0) {
            setTimeout(() => {
                robotFace.className = 'robot-face';
            }, duration);
        }
    }

    // Mouse Parallax Effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        // Move orbs
        document.querySelectorAll('.glow-orb').forEach((orb, index) => {
            const depth = (index + 1) * 20;
            const moveX = (mouseX - 0.5) * depth;
            const moveY = (mouseY - 0.5) * depth;
            // Note: Some orbs already have floating animations, so we combine them
            orb.style.setProperty('--parallax-x', `${moveX}px`);
            orb.style.setProperty('--parallax-y', `${moveY}px`);
            orb.style.transform = `translate(var(--parallax-x), var(--parallax-y))`;
        });

        // Move background robots
        document.querySelectorAll('.bg-robot').forEach((robot, index) => {
            const depth = (index + 1) * 10;
            const moveX = (mouseX - 0.5) * depth;
            const moveY = (mouseY - 0.5) * depth;
            robot.style.setProperty('--parallax-x', `${moveX}px`);
            robot.style.setProperty('--parallax-y', `${moveY}px`);
            robot.style.transform = `translate(var(--parallax-x), var(--parallax-y))`;
        });
    });
});

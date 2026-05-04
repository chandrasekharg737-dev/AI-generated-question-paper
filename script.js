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
    const errorBox = document.getElementById('form-error');

    const assistantBubble = document.getElementById('assistant-bubble');
    const assistantText = document.getElementById('assistant-text');
    const assistantRobot = document.querySelector('.assistant-robot');
    const robotFace = document.querySelector('.robot-face');

    const mainRobot = document.getElementById('main-robot');
    const robotBase = document.getElementById('robot-base');

    // State
    let currentPaper = null;
    let paperHistory = JSON.parse(localStorage.getItem('paperHistory')) || [];
    let isProcessing = false;

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
        if (!currentPaper || !currentPaper.metadata || isProcessing) return;
        
        isProcessing = true;
        showSection('loading-section');
        setExpression('thinking', 0);
        regenerateBtn.disabled = true;
        
        setTimeout(() => {
            currentPaper = generateQuestions(currentPaper.metadata);
            renderResults(currentPaper.metadata);
            showSection('results-section');
            regenerateBtn.disabled = false;
            isProcessing = false;
        }, 1500);
    });

    generatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            subject: document.getElementById('subject').value.trim() || "General Knowledge",
            topic: document.getElementById('topic').value.trim() || "Academic Fundamentals",
            difficulty: document.getElementById('difficulty').value || "Medium",
            numQuestions: parseInt(document.getElementById('num-questions').value) || 10,
            questionType: document.getElementById('question-type').value || "Mixed"
        };

        errorBox.classList.add('hidden');
        showSection('loading-section');
        setExpression('thinking', 0);
        
        // Immediate execution after UI update
        requestAnimationFrame(() => {
            currentPaper = generateQuestions(formData);
            showSection('results-section');
            renderResults(formData);
            speak("Great! Your question paper is ready.", 4000);
            
            const historyItem = { id: Date.now(), timestamp: new Date().toLocaleString(), metadata: formData, paper: currentPaper };
            paperHistory.unshift(historyItem);
            localStorage.setItem('paperHistory', JSON.stringify(paperHistory));
            
            navOutputLink.removeAttribute('disabled');
            setExpression('happy', 4000);
        });
    });

    // Standalone Generation Logic (Offline-ready template engine)
    function generateQuestions(data) {
        const { subject, topic, difficulty, numQuestions, questionType } = data;
        const questions = [];
        
        const pools = {
            'MCQ': [
                "Which of the following best describes the core function of {topic} in the context of {subject}?",
                "Identify the primary advantage of utilizing {topic} over traditional methods in {subject}.",
                "When implementing {topic}, which of the following variables is considered most critical?",
                "According to standard {subject} protocols, what is the first step in {topic} optimization?",
                "Which theoretical model best supports the use of {topic} for {subject} efficiency?",
                "Identify the common pitfall when integrating {topic} into a {subject} workflow.",
                "Which component of {topic} is responsible for its most significant impact on {subject}?"
            ],
            'Short': [
                "Explain the fundamental principles that govern {topic} within {subject}.",
                "Compare and contrast two major approaches to {topic} as discussed in {subject} literature.",
                "Describe the lifecycle of {topic} and identify its most complex phase.",
                "What are the three key performance indicators (KPIs) for {topic} in {subject}?",
                "Briefly outline how {topic} has evolved with the recent advancements in {subject}.",
                "Discuss the ethical implications of using {topic} within a {subject} environment.",
                "How does the difficulty of {topic} implementation change across different {subject} scales?"
            ],
            'Long': [
                "Provide a comprehensive critical analysis of {topic}. Discuss its historical roots in {subject}, current state-of-the-art applications, and potential future trajectories.",
                "Design a detailed framework for a project that utilizes {topic} to solve a chronic problem in {subject}. Justify your choices with academic evidence.",
                "Synthesize a new model that combines {topic} with emerging technologies in {subject}. Evaluate the potential risks and rewards of this synthesis.",
                "Critically evaluate the statement: '{topic} is the most significant development in {subject} in the last decade.' Use examples to support your argument.",
                "Draft a technical report on the efficiency of {topic} in large-scale {subject} systems, focusing on resource allocation and bottleneck management."
            ],
            'TF': [
                "True or False: {topic} is universally considered a prerequisite for advanced {subject} mastery.",
                "True or False: The implementation of {topic} in {subject} always leads to a linear increase in performance.",
                "True or False: Historical data suggests that {topic} was first applied to {subject} by accident.",
                "True or False: Modern {subject} standards require {topic} to be audited at least once per fiscal year.",
                "True or False: {topic} and its related sub-systems are entirely independent of {subject} environmental factors."
            ]
        };

        const prefixes = {
            'Easy': ["Recall", "State", "Identify", "List", "Summarize"],
            'Medium': ["Analyze", "Explain", "Compare", "Illustrate", "Demonstrate"],
            'Hard': ["Critically evaluate", "Synthesize", "Defend", "Formulate a proof for", "Deconstruct"]
        };

        for (let i = 0; i < numQuestions; i++) {
            let type;
            if (questionType === 'Mixed') {
                const types = ['MCQ', 'Short', 'Long', 'TF'];
                type = types[i % 4];
            } else {
                const map = { 'Multiple Choice (MCQ)': 'MCQ', 'Short Answer': 'Short', 'Long Essay': 'Long', 'True / False': 'TF' };
                type = map[questionType] || 'Short';
            }
            
            const pool = pools[type];
            let rawText = pool[i % pool.length];
            let text = rawText.replace(/{topic}/g, topic).replace(/{subject}/g, subject);
            
            // Add difficulty-based flavor
            const prefix = prefixes[difficulty][i % prefixes[difficulty].length];
            if (type !== 'TF' && type !== 'MCQ') {
                text = `${prefix}: ${text}`;
            }

            const baseMarks = type === 'MCQ' || type === 'TF' ? 1 : (type === 'Short' ? 5 : 15);
            const markMultiplier = difficulty === 'Hard' ? 1.5 : (difficulty === 'Easy' ? 0.8 : 1);
            
            questions.push({
                id: i + 1,
                text: text,
                answer: `[Model Answer for ${topic}] A detailed response should address the specific nuances of ${topic} within ${subject}, focusing on ${difficulty}-level accuracy.`,
                marks: Math.ceil(baseMarks * markMultiplier),
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
        
        // Clear existing timeouts to prevent animation overlap
        if (assistantBubble.speakTimeout) clearTimeout(assistantBubble.speakTimeout);
        if (assistantBubble.hideTimeout) clearTimeout(assistantBubble.hideTimeout);
        
        assistantBubble.classList.remove('show');
        
        assistantBubble.speakTimeout = setTimeout(() => {
            assistantText.textContent = text;
            assistantBubble.classList.add('show');
            
            assistantBubble.hideTimeout = setTimeout(() => {
                assistantBubble.classList.remove('show');
            }, duration);
        }, 100);
    }

    function triggerWave() { assistantRobot.classList.add('waving'); setTimeout(() => assistantRobot.classList.remove('waving'), 3000); }
    assistantRobot.addEventListener('click', triggerWave);

    function setExpression(exp, dur = 3000) {
        robotFace.className = 'robot-face ' + exp;
        if (dur > 0) setTimeout(() => robotFace.className = 'robot-face', dur);
    }

    // Mouse Parallax Effect (Disabled on touch devices for stability)
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            document.querySelectorAll('.glow-orb, .bg-robot').forEach(el => el.style.transform = `translate(${x}px, ${y}px)`);
        });
    }
});

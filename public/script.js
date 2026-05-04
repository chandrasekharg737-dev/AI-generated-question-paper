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
        
        fetchQuestions(currentPaper.metadata)
            .then(paper => {
                currentPaper = paper;
                renderResults(currentPaper.metadata);
                showSection('results-section');
            })
            .catch(error => {
                console.error(error);
                showSection('results-section');
                speak("Regeneration failed. Keeping the current paper.");
            });
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

        // Call backend API
        fetchQuestions(formData)
            .then(paper => {
                currentPaper = paper;
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
            })
            .catch(error => {
                console.error(error);
                showSection('generator-section');
                const errorBox = document.getElementById('form-error');
                errorBox.textContent = "❌ Failed to generate. Check your internet or API key.";
                errorBox.classList.remove('hidden');
                speak("I'm sorry, I encountered an error. Please try again later.");
            });
    });

    async function fetchQuestions(data) {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to fetch from server');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Legacy Mock Data Generator (Replaced by Backend API)
    // function generateQuestions(data) { ... }

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

    // PDF Download / Print functionality
    document.getElementById('download-btn').addEventListener('click', () => {
        window.print();
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
            "I can calculate the total marks automatically!",
            "Try generating a 'Hard' difficulty paper for a real challenge!",
            "I've optimized the layout for mobile devices too!",
            "Remember to save your paper to History if you like it!",
            "I use the latest Gemini 1.5 model for maximum accuracy!"
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

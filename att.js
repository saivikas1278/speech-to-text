
        document.addEventListener('DOMContentLoaded', function() {
            const startBtn = document.getElementById('startBtn');
            const stopBtn = document.getElementById('stopBtn');
            const copyBtn = document.getElementById('copyBtn');
            const clearBtn = document.getElementById('clearBtn');
            const result = document.getElementById('result');
            const status = document.getElementById('status');
            const container = document.querySelector('.container');
            const micIcon = document.querySelector('.mic-icon');
            
            let recognition;
            let isListening = false;
            
            // Check for browser support
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                status.textContent = 'Speech recognition is not supported in your browser. Try Chrome or Edge.';
                startBtn.disabled = true;
                container.style.backgroundColor = 'rgba(255, 235, 235, 0.95)';
                return;
            }
            
            // Create speech recognition object
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            
            // Configure recognition
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            // Event handlers
            recognition.onstart = function() {
                isListening = true;
                status.textContent = 'Listening... Speak now.';
                status.classList.add('pulse');
                startBtn.disabled = true;
                stopBtn.disabled = false;
                container.classList.add('listening');
                
                // Animate container
                container.style.animation = 'none';
                void container.offsetWidth; // Trigger reflow
                container.style.animation = 'pulse 2s infinite';
            };
            
            recognition.onend = function() {
                if (isListening) {
                    recognition.start(); // Restart if still listening
                } else {
                    status.textContent = 'Press "Start Listening" to begin';
                    status.classList.remove('pulse');
                    startBtn.disabled = false;
                    stopBtn.disabled = true;
                    container.classList.remove('listening');
                    container.style.animation = 'none';
                }
            };
            
            recognition.onerror = function(event) {
                console.error('Speech recognition error', event.error);
                status.textContent = 'Error occurred: ' + event.error;
                status.style.color = 'var(--danger)';
                isListening = false;
                recognition.stop();
                
                // Shake animation for error
                container.style.animation = 'none';
                void container.offsetWidth;
                container.style.animation = 'shake 0.5s';
                
                setTimeout(() => {
                    status.style.color = '#6c757d';
                    container.style.animation = 'none';
                }, 3000);
            };
            
            recognition.onresult = function(event) {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                result.value = finalTranscript + interimTranscript;
                
                // Auto-scroll to bottom
                result.scrollTop = result.scrollHeight;
            };
            
            // Button click handlers
            startBtn.addEventListener('click', function() {
                try {
                    // Ripple effect
                    const ripple = document.createElement('span');
                    ripple.classList.add('ripple');
                    this.appendChild(ripple);
                    
                    const x = event.clientX - event.target.getBoundingClientRect().left;
                    const y = event.clientY - event.target.getBoundingClientRect().top;
                    
                    ripple.style.left = `${x}px`;
                    ripple.style.top = `${y}px`;
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 1000);
                    
                    recognition.start();
                } catch (error) {
                    status.textContent = 'Error starting recognition: ' + error.message;
                    status.style.color = 'var(--danger)';
                }
            });
            
            stopBtn.addEventListener('click', function() {
                isListening = false;
                recognition.stop();
                status.textContent = 'Stopped listening. Ready to start again.';
            });
            
            copyBtn.addEventListener('click', function() {
                if (result.value) {
                    result.select();
                    document.execCommand('copy');
                    
                    // Visual feedback
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    copyBtn.style.backgroundColor = '#2ecc71';
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.style.backgroundColor = 'var(--success)';
                    }, 2000);
                    
                    // Confetti effect
                    createConfetti();
                }
            });
            
            clearBtn.addEventListener('click', function() {
                result.value = '';
                
                // Shake animation
                result.style.animation = 'none';
                void result.offsetWidth;
                result.style.animation = 'shake 0.3s';
            });
            
            // Helper function for confetti effect
            function createConfetti() {
                const confettiCount = 50;
                const containerRect = container.getBoundingClientRect();
                
                for (let i = 0; i < confettiCount; i++) {
                    const confetti = document.createElement('div');
                    confetti.classList.add('confetti');
                    confetti.style.left = Math.random() * containerRect.width + 'px';
                    confetti.style.top = -10 + 'px';
                    confetti.style.backgroundColor = getRandomColor();
                    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                    confetti.style.animation = `confettiFall ${Math.random() * 2 + 1}s linear forwards`;
                    container.appendChild(confetti);
                    
                    setTimeout(() => {
                        confetti.remove();
                    }, 2000);
                }
            }
            
            function getRandomColor() {
                const colors = ['#4361ee', '#3a0ca3', '#f72585', '#4cc9f0', '#4895ef'];
                return colors[Math.floor(Math.random() * colors.length)];
            }
            
            // Add shake animation dynamically
            const style = document.createElement('style');
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-5px); }
                    40%, 80% { transform: translateX(5px); }
                }
                
                .ripple {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                    width: 20px;
                    height: 20px;
                }
                
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                
                @keyframes confettiFall {
                    to {
                        transform: translateY(${window.innerHeight}px) rotate(360deg);
                        opacity: 0;
                    }
                }
                
                .confetti {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    opacity: 0.8;
                    z-index: 1000;
                }
            `;
            document.head.appendChild(style);
        });
    
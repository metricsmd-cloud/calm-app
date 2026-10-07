document.addEventListener('DOMContentLoaded', () => {
    // --- THEME MANAGEMENT ---
    const themeBtn = document.getElementById('theme-btn');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('calm_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('ph-moon', 'ph-sun');
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('calm_theme', 'light');
            themeIcon.classList.replace('ph-sun', 'ph-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('calm_theme', 'dark');
            themeIcon.classList.replace('ph-moon', 'ph-sun');
        }
    });

    // --- TAB NAVIGATION ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // --- SOUND MANAGEMENT ---
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');

    soundBtn.addEventListener('click', () => {
        const isPlaying = window.toggleAmbient();
        if (isPlaying) {
            soundIcon.classList.replace('ph-speaker-slash', 'ph-speaker-high');
            soundBtn.style.color = 'var(--primary-color)';
        } else {
            soundIcon.classList.replace('ph-speaker-high', 'ph-speaker-slash');
            soundBtn.style.color = 'var(--text-main)';
        }
    });

    // --- BREATHE MODULE ---
    const startBreatheBtn = document.getElementById('start-breathe');
    const stopBreatheBtn = document.getElementById('stop-breathe');
    const breatheCircle = document.getElementById('breathe-circle');
    const breatheInstructions = document.getElementById('breathe-instructions');
    const techniqueSelect = document.getElementById('technique-select');
    
    let breatheInterval;
    let isBreathing = false;
    let cycleTimeout1, cycleTimeout2, cycleTimeout3;

    function updateCircle(scale, time, instruction, colorAlpha) {
        if(!isBreathing) return;
        breatheInstructions.textContent = instruction;
        breatheCircle.style.transition = `transform ${time}s ease-in-out, background-color ${time}s ease`;
        breatheCircle.style.transform = `scale(${scale})`;
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const rgb = isDark ? '129, 140, 248' : '92, 141, 246';
        breatheCircle.style.backgroundColor = `rgba(${rgb}, ${colorAlpha})`;
    }

    function runCycle() {
        if(!isBreathing) return;
        const technique = techniqueSelect.value;
        
        if (technique === 'coherent') {
            // 5s in, 5s out
            updateCircle(2.2, 5, "Inhala...", 1);
            if(window.playTibetanBowl) window.playTibetanBowl(144); // Bell for inhale
            
            cycleTimeout1 = setTimeout(() => {
                updateCircle(1, 5, "Exhala...", 0.6);
                if(window.playTibetanBowl) window.playTibetanBowl(108); // Lower bell for exhale
            }, 5000);
            
        } else if (technique === 'box') {
            // 4s in, 4s hold, 4s out, 4s hold
            updateCircle(2.2, 4, "Inhala...", 1);
            if(window.playTibetanBowl) window.playTibetanBowl(144);
            
            cycleTimeout1 = setTimeout(() => {
                updateCircle(2.2, 4, "Sostén el aire...", 0.8);
                cycleTimeout2 = setTimeout(() => {
                    updateCircle(1, 4, "Exhala...", 0.6);
                    if(window.playTibetanBowl) window.playTibetanBowl(108);
                    
                    cycleTimeout3 = setTimeout(() => {
                        updateCircle(1, 4, "Espera...", 0.4);
                    }, 4000);
                }, 4000);
            }, 4000);
            
        } else if (technique === '478') {
            // 4s in, 7s hold, 8s out
            updateCircle(2.2, 4, "Inhala...", 1);
            if(window.playTibetanBowl) window.playTibetanBowl(144);
            
            cycleTimeout1 = setTimeout(() => {
                updateCircle(2.2, 7, "Sostén...", 0.8);
                cycleTimeout2 = setTimeout(() => {
                    updateCircle(1, 8, "Exhala...", 0.6);
                    if(window.playTibetanBowl) window.playTibetanBowl(108);
                }, 7000);
            }, 4000);
        }
    }

    function getCycleDuration() {
        const technique = techniqueSelect.value;
        if (technique === 'coherent') return 10000;
        if (technique === 'box') return 16000;
        return 19000; // 478
    }

    startBreatheBtn.addEventListener('click', () => {
        isBreathing = true;
        startBreatheBtn.classList.add('hidden');
        stopBreatheBtn.classList.remove('hidden');
        techniqueSelect.disabled = true; // Disable change while breathing
        
        runCycle();
        breatheInterval = setInterval(runCycle, getCycleDuration());
    });

    stopBreatheBtn.addEventListener('click', () => {
        isBreathing = false;
        clearInterval(breatheInterval);
        clearTimeout(cycleTimeout1);
        clearTimeout(cycleTimeout2);
        clearTimeout(cycleTimeout3);
        
        startBreatheBtn.classList.remove('hidden');
        stopBreatheBtn.classList.add('hidden');
        techniqueSelect.disabled = false;
        
        breatheInstructions.textContent = "¿Listo/a para empezar?";
        breatheCircle.style.transition = "transform 0.5s ease";
        breatheCircle.style.transform = "scale(1)";
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const rgb = isDark ? '129, 140, 248' : '92, 141, 246';
        breatheCircle.style.backgroundColor = `rgba(${rgb}, 0.6)`;
    });

    // --- GROUNDING MODULE ---
    const resetGroundingBtn = document.getElementById('reset-grounding');
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');

    resetGroundingBtn.addEventListener('click', () => {
        checkboxes.forEach(cb => {
            cb.checked = false;
            const li = cb.closest('li');
            li.style.transform = 'translateX(5px)';
            setTimeout(() => li.style.transform = 'translateX(-5px)', 100);
            setTimeout(() => li.style.transform = 'translateX(0)', 200);
        });
    });

    // --- DISTRACTION MODULE (EMERGENCY) ---
    const newChallengeBtn = document.getElementById('new-challenge');
    const challengeText = document.getElementById('challenge-text');
    
    const challenges = [
        "Cuenta hacia atrás desde 100, restando de 7 en 7. (Ej: 100, 93, 86...)",
        "Nombra 5 ciudades que empiecen con la letra 'M'.",
        "Busca a tu alrededor y nombra 3 cosas que sean de color AZUL.",
        "Deletrea tu nombre completo y tus apellidos al revés.",
        "Piensa en 4 películas donde aparezca un perro.",
        "Suma mentalmente: 15 + 18 + 22.",
        "Nombra 5 animales que vivan en el agua.",
        "Levántate y ve a lavarte la cara con agua muy fría (¡el choque térmico ayuda!).",
        "Muerde un limón o chupa un cubo de hielo por 30 segundos.",
        "Enumera los meses del año en orden alfabético."
    ];

    newChallengeBtn.addEventListener('click', () => {
        // Simple shake animation
        challengeText.style.opacity = '0';
        challengeText.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * challenges.length);
            challengeText.textContent = challenges[randomIndex];
            challengeText.style.transition = 'all 0.3s ease';
            challengeText.style.opacity = '1';
            challengeText.style.transform = 'translateY(0)';
        }, 200);
    });

    // --- TCC MODULE ---
    const saveTccBtn = document.getElementById('save-tcc');
    const tccThought = document.getElementById('tcc-thought');
    const tccFor = document.getElementById('tcc-evidence-for');
    const tccAgainst = document.getElementById('tcc-evidence-against');
    const tccBalanced = document.getElementById('tcc-balanced');

    saveTccBtn.addEventListener('click', () => {
        if (!tccThought.value.trim() || !tccBalanced.value.trim()) {
            tccThought.style.borderColor = 'var(--danger-color)';
            setTimeout(() => tccThought.style.borderColor = 'var(--border-color)', 500);
            return;
        }

        // Save as a special Journal entry
        const formattedText = `🧠 TCC: \nPensamiento: ${tccThought.value}\nVerdad Lógica: ${tccBalanced.value}`;
        
        const entries = JSON.parse(localStorage.getItem('calm_entries') || '[]');
        entries.unshift({
            text: formattedText,
            mood: '🧠',
            timestamp: new Date().getTime()
        });
        
        localStorage.setItem('calm_entries', JSON.stringify(entries));
        
        // Button feedback
        const originalText = saveTccBtn.innerHTML;
        saveTccBtn.innerHTML = '<i class="ph ph-check"></i> Guardado';
        saveTccBtn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            tccThought.value = '';
            tccFor.value = '';
            tccAgainst.value = '';
            tccBalanced.value = '';
            saveTccBtn.innerHTML = originalText;
            saveTccBtn.style.backgroundColor = '';
            loadEntries();
            // Automatically switch to Journal tab to see it
            document.querySelector('.tab-btn[data-target="journal"]').click();
        }, 1200);
    });

    // --- JOURNAL MODULE ---
    const saveJournalBtn = document.getElementById('save-journal');
    const journalText = document.getElementById('journal-text');
    const entriesList = document.getElementById('entries-list');
    const moodBtns = document.querySelectorAll('.mood-btn');
    let currentMood = '😐'; // default

    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentMood = btn.getAttribute('data-mood');
        });
    });

    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('calm_entries') || '[]');
        entriesList.innerHTML = '';
        
        if (entries.length === 0) {
            entriesList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 20px;">No hay registros aún. Escribe cómo te sientes hoy.</p>';
            return;
        }

        entries.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'entry';
            
            const header = document.createElement('div');
            header.className = 'entry-header';
            
            const moodSpan = document.createElement('span');
            moodSpan.className = 'entry-mood';
            moodSpan.textContent = entry.mood || '😐';
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'entry-date';
            
            // Format date nicely
            const date = new Date(entry.timestamp);
            const today = new Date();
            let dateStr = '';
            
            if (date.toDateString() === today.toDateString()) {
                dateStr = 'Hoy, ' + date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            } else {
                dateStr = date.toLocaleDateString('es-ES', {month: 'short', day: 'numeric'}) + ', ' + date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
            }
            
            dateSpan.textContent = dateStr;
            
            const textP = document.createElement('p');
            textP.className = 'entry-text';
            textP.textContent = entry.text;
            
            header.appendChild(moodSpan);
            header.appendChild(dateSpan);
            div.appendChild(header);
            div.appendChild(textP);
            entriesList.appendChild(div);
        });
    }

    saveJournalBtn.addEventListener('click', () => {
        const text = journalText.value.trim();
        if (text) {
            // Button animation
            const originalText = saveJournalBtn.innerHTML;
            saveJournalBtn.innerHTML = '<i class="ph ph-check-circle"></i> Guardado';
            saveJournalBtn.style.backgroundColor = '#10b981'; // Green
            
            const entries = JSON.parse(localStorage.getItem('calm_entries') || '[]');
            entries.unshift({
                text: text,
                mood: currentMood,
                timestamp: new Date().getTime()
            });
            
            if (entries.length > 20) entries.pop(); // Keep 20
            
            localStorage.setItem('calm_entries', JSON.stringify(entries));
            
            setTimeout(() => {
                journalText.value = '';
                moodBtns.forEach(b => b.classList.remove('selected'));
                document.querySelector('[data-mood="😐"]').classList.add('selected');
                currentMood = '😐';
                
                saveJournalBtn.innerHTML = originalText;
                saveJournalBtn.style.backgroundColor = '';
                loadEntries();
            }, 1000);
        } else {
            // Shake if empty
            journalText.style.borderColor = 'var(--danger-color)';
            setTimeout(() => journalText.style.borderColor = 'var(--border-color)', 500);
        }
    });

    // Initialize
    document.querySelector('[data-mood="😐"]').classList.add('selected');
    loadEntries();

    // --- PWA / OFFLINE SUPPORT ---
    if ('serviceWorker' in navigator) {
        // NUKING SERVICE WORKER AND CACHE TO FORCE UPDATE
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
            }
        });
        
        caches.keys().then(function(names) {
            for (let name of names) {
                caches.delete(name);
            }
        });
    }
});

// --- NUEVAS FUNCIONALIDADES (PMR, Tarjetas, Stats) ---
document.addEventListener('DOMContentLoaded', () => {

    // 1. Lógica de Sub-Pestañas (Segmented Controls)
    const segBtns = document.querySelectorAll('.seg-btn');
    segBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const parentSection = btn.closest('.tab-content');
            
            // Quitar activo a los botones hermanos
            parentSection.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Ocultar vistas hermanas
            parentSection.querySelectorAll('.sub-view').forEach(v => v.classList.remove('active'));
            
            // Mostrar la vista seleccionada
            const targetId = btn.getAttribute('data-sub');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 2. Lógica del Escáner Corporal (PMR)
    const resetPmrBtn = document.getElementById('reset-pmr');
    if (resetPmrBtn) {
        resetPmrBtn.addEventListener('click', () => {
            document.querySelectorAll('#pmr-list input[type="checkbox"]').forEach(cb => cb.checked = false);
        });
    }

    // 3. Lógica de Tarjetas de Afrontamiento
    const flashcards = [
        "Esto es muy incómodo, pero no es peligroso. Mi cuerpo está reaccionando a una falsa alarma.",
        "He sobrevivido al 100% de mis ataques de ansiedad. Este también pasará.",
        "Mi corazón está latiendo rápido porque está bombeando adrenalina para protegerme. Está sano.",
        "No intentes detener el pánico. Deja que la ola pase sobre ti, pronto bajará la marea.",
        "Estás a salvo. El miedo es una emoción, no una premonición.",
        "Concéntrate en tu respiración. Es el ancla que le dice a tu cerebro que todo está bien."
    ];
    let currentCardIndex = 0;
    const flashcardEl = document.getElementById('flashcard');
    const flashcardTextEl = flashcardEl ? flashcardEl.querySelector('.flashcard-text') : null;
    
    if (flashcardEl && flashcardTextEl) {
        flashcardEl.addEventListener('click', () => {
            currentCardIndex = (currentCardIndex + 1) % flashcards.length;
            
            // Efecto visual de volteo rápido
            flashcardEl.style.opacity = 0;
            flashcardEl.style.transform = "scale(0.95)";
            
            setTimeout(() => {
                flashcardTextEl.textContent = `"${flashcards[currentCardIndex]}"`;
                flashcardEl.style.opacity = 1;
                flashcardEl.style.transform = "scale(1)";
            }, 150);
        });
    }

    // 4. Estadísticas y Exportación
    function updateStats() {
        const entries = JSON.parse(localStorage.getItem('calm_entries')) || [];
        const statTotal = document.getElementById('stat-total');
        if(statTotal) statTotal.textContent = entries.length;
    }
    
    // Sobrescribir (Monkey patch) loadEntries para que actualice las estadísticas cada vez que se cargan
    const originalLoadEntries = window.loadEntries;
    window.loadEntries = function() {
        if(typeof originalLoadEntries === 'function') originalLoadEntries();
        updateStats();
    };
    
    // Llamar inmediatamente para la carga inicial
    updateStats();

    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const entries = localStorage.getItem('calm_entries');
            if (!entries || entries === '[]') {
                alert("Tu diario está vacío.");
                return;
            }
            
            // Crear el archivo
            const parsedEntries = JSON.parse(entries);
            let textData = "=== MI DIARIO DE CALMA ===\n\n";
            parsedEntries.forEach(e => {
                textData += `Fecha: ${e.date}\n`;
                if(e.type === 'journal') {
                    textData += `Estado: ${e.mood}\n`;
                    textData += `Reflexión: ${e.text}\n`;
                } else if(e.type === 'tcc') {
                    textData += `TCC - Pensamiento Ansioso: ${e.thought}\n`;
                    textData += `TCC - Pensamiento Lógico: ${e.balanced}\n`;
                }
                textData += `--------------------------\n\n`;
            });

            const blob = new Blob([textData], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Calm_Diario_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    const clearBtn = document.getElementById('clear-data');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm("¿Estás seguro de que quieres borrar todos tus registros? Esta acción no se puede deshacer.")) {
                localStorage.removeItem('calm_entries');
                const list = document.getElementById('entries-list');
                if(list) list.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 20px;">Sin registros aún.</p>';
                updateStats();
            }
        });
    }
});

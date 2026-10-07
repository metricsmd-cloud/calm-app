let audioCtx;
let isPlaying = false;
let droneOscillators = [];
let droneGain;
let masterGain;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.4;
        masterGain.connect(audioCtx.destination);
    }
}

function startAmbientDrone() {
    if (!audioCtx) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    if (isPlaying) {
        stopAmbientDrone();
        return;
    }

    droneGain = audioCtx.createGain();
    droneGain.gain.value = 0; 
    droneGain.connect(masterGain);

    // Frecuencias relajantes (Acorde de Do Mayor extendido con frecuencias de sanación)
    // 130.81 (C3), 196.00 (G3), 261.63 (C4), 329.63 (E4)
    const frequencies = [130.81, 196.00, 261.63, 329.63]; 
    
    frequencies.forEach((freq, index) => {
        let osc = audioCtx.createOscillator();
        // Usamos ondas seno puras para que suene como cuencos tibetanos o un sintetizador muy suave
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        let oscGain = audioCtx.createGain();
        // Las frecuencias más graves tienen más volumen, las agudas menos
        oscGain.gain.value = 0.25 - (index * 0.05); 
        
        // LFO (Oscilador de baja frecuencia) para crear el efecto de "respiración" o "olas"
        let lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.05 + (Math.random() * 0.05); // Modulación muy, muy lenta
        
        let lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 0.15; // Qué tan profundo es el efecto de ola
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        
        osc.connect(oscGain);
        oscGain.connect(droneGain);
        
        osc.start();
        lfo.start();
        
        droneOscillators.push({ osc, lfo });
    });

    // Fade in súper suave de 4 segundos
    droneGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 4);
    isPlaying = true;
}

function stopAmbientDrone() {
    if (!isPlaying) return;
    
    // Fade out súper suave de 3 segundos
    droneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);
    
    setTimeout(() => {
        droneOscillators.forEach(d => {
            d.osc.stop();
            d.lfo.stop();
        });
        droneOscillators = [];
        droneGain.disconnect();
        isPlaying = false;
    }, 3100);
}

// Sonido de Campana (Chime)
function playChime() {
    if (!audioCtx) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine';
    // Frecuencia 432 Hz (considerada terapéutica)
    osc.frequency.setValueAtTime(432, audioCtx.currentTime); 
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 5);

    osc.connect(gainNode);
    gainNode.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 5);
}

// Escuchar el botón de sonido en el HTML
document.addEventListener('DOMContentLoaded', () => {
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        // Remover eventos anteriores si los hay (para evitar bugs de PWA)
        const newSoundBtn = soundBtn.cloneNode(true);
        soundBtn.parentNode.replaceChild(newSoundBtn, soundBtn);
        
        newSoundBtn.addEventListener('click', () => {
            if (isPlaying) {
                stopAmbientDrone();
                newSoundBtn.innerHTML = '<i class="ph ph-speaker-slash"></i>';
                newSoundBtn.style.color = "var(--text-muted)";
            } else {
                startAmbientDrone();
                newSoundBtn.innerHTML = '<i class="ph ph-speaker-high"></i>';
                newSoundBtn.style.color = "var(--primary-color)";
            }
        });
    }
});

// Web Audio API Synthesis - No external files needed, works offline!
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let ambientNode = null;
window.isSoundEnabled = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Campana suave / Singing bowl
window.playChime = function(frequency = 432, type = 'sine') { 
    if (!window.isSoundEnabled || !audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    // Attack and decay para un sonido suave
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.3); // Suave
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 3.1);
};

// Generador de Ruido Marrón / Lluvia sintética
function createBrownNoise() {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Filtro para hacerlo "Brownian"
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; 
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    // Filtro para que suene a lluvia lejana o mar
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350; // Sonido profundo y amortiguado
    
    const gain = audioCtx.createGain();
    gain.gain.value = 0.2; // Volumen muy bajo de fondo
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    return { source: noise, gain: gain };
}

window.toggleAmbient = function() {
    initAudio();
    window.isSoundEnabled = !window.isSoundEnabled;
    
    if (window.isSoundEnabled) {
        ambientNode = createBrownNoise();
        ambientNode.source.start();
        return true;
    } else {
        if (ambientNode) {
            ambientNode.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
            setTimeout(() => {
                ambientNode.source.stop();
                ambientNode = null;
            }, 1000);
        }
        return false;
    }
};

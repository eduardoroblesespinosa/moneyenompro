// --- DOM Elements ---
const egregoreSymbol = document.getElementById('egregore-symbol');
const worthinessSlider = document.getElementById('worthiness');
const flowSlider = document.getElementById('flow');
const purposeSlider = document.getElementById('purpose');
const soundToggleButton = document.getElementById('sound-toggle');

// --- Web Audio API Setup ---
let audioContext;
let oscillator;
let gainNode;
let isAudioActive = false;

function setupAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.gain.value = 0; // Start silent
        gainNode.connect(audioContext.destination);

        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        oscillator.start();
    }
}

function toggleSound() {
    if (!isAudioActive) {
        setupAudio();
        // Fade in
        gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.5);
        isAudioActive = true;
        soundToggleButton.textContent = 'Deactivate Resonance';
        soundToggleButton.classList.remove('btn-outline-light');
        soundToggleButton.classList.add('btn-light');
    } else {
        // Fade out
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
        isAudioActive = false;
        soundToggleButton.textContent = 'Activate Resonance';
        soundToggleButton.classList.add('btn-outline-light');
        soundToggleButton.classList.remove('btn-light');
    }
}

// --- Update Logic ---
function updateResonance() {
    const worthiness = parseFloat(worthinessSlider.value); // 1-100
    const flow = parseFloat(flowSlider.value);           // 1-100
    const purpose = parseFloat(purposeSlider.value);       // 1-100

    const averageValue = (worthiness + flow + purpose) / 3;

    // --- Visual Update ---
    // Pulsation speed (faster is higher value)
    const pulseDuration = 3 - (averageValue / 100) * 2.5; // Range from 3s down to 0.5s
    egregoreSymbol.style.animationDuration = `${pulseDuration}s`;

    // Brightness and Scale (bigger and brighter is higher value)
    const scale = 1 + (averageValue / 100) * 0.2; // Range from 1 to 1.2
    const brightness = 100 + (averageValue / 100) * 50; // Range from 100% to 150%
    egregoreSymbol.style.transform = `scale(${scale})`;
    egregoreSymbol.style.filter = `brightness(${brightness}%)`;

    // --- Audio Update ---
    if (isAudioActive && oscillator) {
        // Frequency based on purpose (the "mission")
        const baseFreq = 80; // A low C#
        const frequency = baseFreq + (purpose / 100) * 80; // Range 80hz to 160hz
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Volume (gain) based on worthiness
        const volume = 0.1 + (worthiness / 100) * 0.3; // Range 0.1 to 0.4
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        
        // Let's add a tremolo effect based on Flow
        // We do this by modulating the gain with another oscillator (LFO)
        if (!oscillator.lfo) {
            oscillator.lfo = audioContext.createOscillator();
            oscillator.lfo.type = 'sine';
            oscillator.lfoGain = audioContext.createGain();
            oscillator.lfo.connect(oscillator.lfoGain);
            oscillator.lfoGain.connect(gainNode.gain);
            oscillator.lfo.start();
        }
        
        const tremoloSpeed = (flow / 100) * 8; // Tremolo speed from 0 to 8 Hz
        const tremoloDepth = (flow / 100) * 0.1; // Small depth
        oscillator.lfo.frequency.setValueAtTime(tremoloSpeed, audioContext.currentTime);
        oscillator.lfoGain.gain.setValueAtTime(tremoloDepth, audioContext.currentTime);
    }
}

// --- Event Listeners ---
soundToggleButton.addEventListener('click', toggleSound);
worthinessSlider.addEventListener('input', updateResonance);
flowSlider.addEventListener('input', updateResonance);
purposeSlider.addEventListener('input', updateResonance);

// --- Initial State ---
document.addEventListener('DOMContentLoaded', updateResonance);


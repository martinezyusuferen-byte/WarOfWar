// Simple synth audio manager using Web Audio API
// No external assets required

let audioCtx: AudioContext | null = null;
let musicNodes: AudioNode[] = [];

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const stopMusic = () => {
    if (audioCtx) {
        musicNodes.forEach(n => n.disconnect());
        musicNodes = [];
    }
};

export const playIntroMusic = () => {
    const ctx = initAudio();
    stopMusic(); // Clear previous

    const now = ctx.currentTime;

    // 1. Deep Drone (War Atmosphere)
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    const droneFilter = ctx.createBiquadFilter();

    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(50, now); // Low freq
    droneOsc.frequency.linearRampToValueAtTime(40, now + 10); // Pitch drop

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(200, now);
    droneFilter.frequency.linearRampToValueAtTime(100, now + 5);

    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.3, now + 2);
    droneGain.gain.linearRampToValueAtTime(0, now + 10); // Fade out eventually

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(ctx.destination);
    
    droneOsc.start(now);
    droneOsc.stop(now + 10);
    musicNodes.push(droneGain);

    // 2. Tension Rhythm (Heartbeat/Drums)
    const rhythmGain = ctx.createGain();
    rhythmGain.gain.value = 0.1;
    rhythmGain.connect(ctx.destination);
    musicNodes.push(rhythmGain);

    for(let i=0; i<8; i++) {
        const beatTime = now + 1 + (i * 0.8);
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = 100;
        osc.type = 'square';
        
        g.gain.setValueAtTime(0, beatTime);
        g.gain.linearRampToValueAtTime(0.2, beatTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.01, beatTime + 0.3);

        osc.connect(g);
        g.connect(rhythmGain);
        osc.start(beatTime);
        osc.stop(beatTime + 0.3);
    }
};

export const playSound = (type: 'shoot' | 'hit' | 'gem' | 'super' | 'win' | 'die') => {
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'shoot':
      // Pew pew
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;

    case 'hit':
      // Thud
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;

    case 'gem':
      // Sparkle high pitch
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    
    case 'die':
        // Sad slide
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

    case 'super':
      // Power up
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.5);
      // LFO effect simulated manually
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 1.0);
      osc.start(now);
      osc.stop(now + 1.0);
      break;
      
    case 'win':
      // Chord arpeggio simplified
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.1); // C#
      osc.frequency.setValueAtTime(659, now + 0.2); // E
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
      break;
  }
};

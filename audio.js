// CORSAIRDASH: Sovereign Seas — Web Audio Sea Shanty & Naval Combat Synthesizer
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.shantyPlaying = false;
    this.windNode = null;
    this.windFilter = null;
    this.windGain = null;
    this.shantyInterval = null;
    this.currentTrack = 0;
    this.trackNames = [
      "🪗 Shanty I: Drunken Sailor's Reel",
      "🪗 Shanty II: Wellerman's Doubloon Jig",
      "🪗 Shanty III: Leave Her, Johnny",
      "🪗 Shanty IV: Spanish Ladies Hornpipe"
    ];
    this.currentLyricLine = "⚓ Crew ready to sing! Press [R] for Sea Shanties!";
  }

  get radioPlaying() {
    return this.shantyPlaying;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.startWindAndSurfAudio();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Continuous ocean surf & wind-in-sails ambient soundscape
  startWindAndSurfAudio() {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.windNode = this.ctx.createBufferSource();
      this.windNode.buffer = noiseBuffer;
      this.windNode.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.025, this.ctx.currentTime);

      this.windNode.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);

      this.windNode.start();
    } catch (e) {
      console.warn("Ocean wind audio init error:", e);
    }
  }

  updateSailingAudio(speed, maxSpeed, windBonus) {
    if (!this.ctx || !this.windFilter || !this.windGain || this.isMuted) return;
    const ratio = Math.min(1.2, Math.abs(speed) / Math.max(1, maxSpeed));
    const targetFreq = 180 + ratio * 380 + (windBonus > 0 ? windBonus * 140 : 0);
    const targetGain = 0.018 + ratio * 0.045;

    const t = this.ctx.currentTime;
    this.windFilter.frequency.setTargetAtTime(targetFreq, t, 0.12);
    this.windGain.gain.setTargetAtTime(this.isMuted ? 0 : targetGain, t, 0.12);
  }

  // Backwards-compatible alias
  updateEngine(speed, maxSpeed, isAccel) {
    this.updateSailingAudio(speed, maxSpeed, isAccel ? 0.2 : 0);
  }

  // Thundering Broadside Cannon Volley
  playCannonBroadside(cannonCount = 2) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const shots = Math.min(4, Math.max(1, Math.ceil(cannonCount / 2)));

    for (let s = 0; s < shots; s++) {
      const offset = s * 0.045;
      // Low sub-bass cannon punch
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(135, t + offset);
      osc.frequency.exponentialRampToValueAtTime(28, t + offset + 0.32);

      oscGain.gain.setValueAtTime(0.28, t + offset);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.35);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.35);

      // Black powder noise crack
      const bufLen = Math.floor(this.ctx.sampleRate * 0.28);
      const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.35));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t + offset);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.22, t + offset);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.28);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start(t + offset);
    }
  }

  // Light Swivel Culverin Auto-Shot
  playSwivelShot() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.14);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Wood Hull Splinter Impact
  playHitWood() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.18);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  playCrash() {
    this.playHitWood();
  }

  // Water Splash / Wake Drift
  playSplash() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, t);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  playSkid() {
    this.playSplash();
  }

  // Massive Powder Keg / Ship Sinking Explosion
  playExplosion() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(18, t + 0.55);
    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.58);
  }

  // Quarterdeck Brass Foghorn / Speaking Trumpet [H]
  playFoghorn() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(146.83, t); // D3 deep ship horn
    osc2.frequency.setValueAtTime(220.00, t); // A3 fifth harmony

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.65);
    osc2.stop(t + 0.65);
  }

  playHorn() {
    this.playFoghorn();
  }

  // Ship's Brass Eight-Bells Chime (New Cargo Charter Dispatch!)
  playContractBell() {
    if (!this.ctx || this.isMuted) return;
    const notes = [1046.50, 1318.51, 1567.98]; // C6, E6, G6 brass bell harmonics
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.11;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.20, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  playOfferChime() {
    this.playContractBell();
  }

  // Gold Doubloon Chest Ka-Ching & Fanfare
  playDoubloonChime() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const fanfare = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    fanfare.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + i * 0.065;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, st);
      gain.gain.setValueAtTime(0.20, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.35);
    });
  }

  playKaChing() {
    this.playDoubloonChime();
  }

  // Ominous Deep Leviathan / Kraken Boss Warning Horn
  playBossRoar() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(92.5, t);
    osc1.frequency.linearRampToValueAtTime(65.4, t + 1.1);
    osc2.frequency.setValueAtTime(98.0, t); // Dissonant minor second growl
    osc2.frequency.linearRampToValueAtTime(69.3, t + 1.1);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, t);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.2);
    osc2.stop(t + 1.2);
  }

  playRefuel() {
    this.playDoubloonChime();
  }

  // Sea Shanty Concertina & Crew Choir Engine
  toggleShanty() {
    this.shantyPlaying = !this.shantyPlaying;
    if (this.shantyPlaying) {
      this.playShantyTrack();
    } else {
      if (this.shantyInterval) clearInterval(this.shantyInterval);
      this.currentLyricLine = "🪗 Shanty Choir resting. Press [R] to sing!";
    }
    return { playing: this.shantyPlaying, trackName: this.trackNames[this.currentTrack] };
  }

  toggleRadio() {
    return this.toggleShanty();
  }

  nextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.trackNames.length;
    if (this.shantyPlaying) {
      if (this.shantyInterval) clearInterval(this.shantyInterval);
      this.playShantyTrack();
    }
    return this.trackNames[this.currentTrack];
  }

  prevTrack() {
    this.currentTrack = (this.currentTrack - 1 + this.trackNames.length) % this.trackNames.length;
    if (this.shantyPlaying) {
      if (this.shantyInterval) clearInterval(this.shantyInterval);
      this.playShantyTrack();
    }
    return this.trackNames[this.currentTrack];
  }

  playShantyTrack() {
    if (!this.ctx) return;
    if (this.shantyInterval) clearInterval(this.shantyInterval);

    // 4 Authentic Folk Sea Shanty Melodies & Lyrics!
    const shanties = [
      {
        // Track 0: Drunken Sailor's Reel (Dorian D minor / C major folk reel)
        tempoMs: 210,
        melody: [
          440, 440, 440, 293.66, 440, 440, 440, 349.23,
          392, 392, 392, 261.63, 392, 392, 392, 329.63,
          440, 440, 440, 493.88, 523.25, 493.88, 440, 392,
          349.23, 329.63, 293.66, 293.66, 293.66, 0, 293.66, 0
        ],
        bass: [146.83, 146.83, 130.81, 130.81, 146.83, 146.83, 110.00, 146.83],
        lyrics: [
          "🎶 What shall we do with a drunken sailor, early in the morning?",
          "🎶 Way hay and up she rises! Hoist the topsails through the squall!",
          "🎶 Put him in the longboat till he's sober, early in the morning!",
          "🎶 Load the hold with spice and bullion, run the pirate gauntlet!"
        ]
      },
      {
        // Track 1: Wellerman's Doubloon Jig (A minor sea ballad)
        tempoMs: 230,
        melody: [
          220, 293.66, 293.66, 293.66, 329.63, 349.23, 293.66, 220,
          329.63, 329.63, 329.63, 392.00, 349.23, 329.63, 293.66, 0,
          440, 440, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66,
          329.63, 293.66, 246.94, 220.00, 220.00, 0, 220.00, 0
        ],
        bass: [110, 146.83, 164.81, 146.83, 174.61, 130.81, 164.81, 110],
        lyrics: [
          "🎶 Soon may the Wellerman come, to bring us sugar and tea and rum!",
          "🎶 One day when the tonguing is done, we'll take our leave and go!",
          "🎶 Broadsides loaded, port and starboard, Kraken rising from the deep!",
          "🎶Twelve slots full of silk and cannons, sailing for the high score!"
        ]
      },
      {
        // Track 2: Leave Her, Johnny, Leave Her (G major capstan shanty)
        tempoMs: 250,
        melody: [
          293.66, 392.00, 392.00, 440.00, 493.88, 440.00, 392.00, 329.63,
          293.66, 329.63, 392.00, 392.00, 329.63, 293.66, 246.94, 0,
          493.88, 587.33, 587.33, 523.25, 493.88, 440.00, 392.00, 440.00,
          392.00, 329.63, 293.66, 246.94, 196.00, 0, 196.00, 0
        ],
        bass: [98.00, 130.81, 98.00, 146.83, 98.00, 130.81, 146.83, 98.00],
        lyrics: [
          "🎶 Oh the times were hard and the wages low, leave her, Johnny, leave her!",
          "🎶 Now once more ashore we'll go, and it's time for us to leave her!",
          "🎶 From Port Royal's pier to Tortuga's cove, we hauled the King's doubloons!",
          "🎶 Drop the anchor by the tavern wharf, repair the oak-ribbed hull!"
        ]
      },
      {
        // Track 3: Spanish Ladies Hornpipe (E minor / G major lively jig)
        tempoMs: 195,
        melody: [
          329.63, 392.00, 493.88, 493.88, 440.00, 392.00, 369.99, 329.63,
          392.00, 440.00, 493.88, 587.33, 493.88, 440.00, 392.00, 0,
          587.33, 523.25, 493.88, 440.00, 392.00, 369.99, 329.63, 392.00,
          440.00, 369.99, 329.63, 293.66, 329.63, 0, 329.63, 0
        ],
        bass: [164.81, 196.00, 146.83, 164.81, 196.00, 146.83, 123.47, 164.81],
        lyrics: [
          "🎶 Farewell and adieu to you, Spanish Ladies! Farewell and adieu to you, ladies of Spain!",
          "🎶 We'll rant and we'll roar across the salt seas, until we strike soundings in the Channel again!",
          "🎶 Let every good fellow now fill up his bumper, and toast to the captains of Sovereign Seas!",
          "🎶 Full canvas aloft as the tradewinds are blowing, outrunning the Dutchman by thirty-five leagues!"
        ]
      }
    ];

    const song = shanties[this.currentTrack % shanties.length];
    let step = 0;

    this.shantyInterval = setInterval(() => {
      if (!this.shantyPlaying || this.isMuted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const noteIdx = step % song.melody.length;
      const freq = song.melody[noteIdx];
      const bassFreq = song.bass[Math.floor(noteIdx / 4) % song.bass.length];

      // Update rotating shanty lyrics every 8 beats
      if (step % 8 === 0) {
        this.currentLyricLine = song.lyrics[Math.floor(step / 8) % song.lyrics.length];
      }

      // Deck-stomp foot percussion on beats 0 and 2
      if (step % 2 === 0) {
        const stompOsc = this.ctx.createOscillator();
        const stompGain = this.ctx.createGain();
        stompOsc.type = 'sine';
        stompOsc.frequency.setValueAtTime(step % 4 === 0 ? 90 : 130, t);
        stompOsc.frequency.exponentialRampToValueAtTime(35, t + 0.09);
        stompGain.gain.setValueAtTime(0.08, t);
        stompGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        stompOsc.connect(stompGain);
        stompGain.connect(this.ctx.destination);
        stompOsc.start(t);
        stompOsc.stop(t + 0.09);

        // Hurdy-gurdy / tuba bass drone
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bassFreq, t);
        bGain.gain.setValueAtTime(0.06, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start(t);
        bOsc.stop(t + 0.28);
      }

      // Concertina / Accordion dual-reed melody
      if (freq > 0) {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(freq, t);
        osc2.frequency.setValueAtTime(freq * 1.004, t); // Slight musette detune for authentic accordion warmth!

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, t);

        lGain.gain.setValueAtTime(0.038, t);
        lGain.gain.exponentialRampToValueAtTime(0.001, t + (song.tempoMs * 0.0009));

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(lGain);
        lGain.connect(this.ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + (song.tempoMs * 0.00095));
        osc2.stop(t + (song.tempoMs * 0.00095));
      }

      step++;
    }, song.tempoMs);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.windGain && this.ctx) {
      this.windGain.gain.setValueAtTime(this.isMuted ? 0 : 0.025, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

window.audioManager = new AudioManager();

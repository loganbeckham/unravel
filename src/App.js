import './App.css';
import * as Tone from 'tone'
import { Chord, Note, Scale } from "tonal";
import { LowpassCombFilter, Player, Sampler, Time } from 'tone';
import { major7th, minor7th, dominant7th, invert, minor} from '@generative-music/utilities'

import C2 from './sounds/piano/UR1_C2_mf_RR1.wav'
import A2 from './sounds/harp/KSHarp_A2_mf.wav'
import D2 from './sounds/harp/KSHarp_D2_mf.wav'
import F2 from './sounds/harp/KSHarp_F2_mf.wav'
import C3 from './sounds/harp/KSHarp_C3_mf.wav'
import G3 from './sounds/harp/KSHarp_G3_mf.wav'
import A4 from './sounds/harp/KSHarp_A4_mf.wav'
import D4 from './sounds/harp/KSHarp_D4_mf.wav'
import F4 from './sounds/harp/KSHarp_F4_mf.wav'
import C5 from './sounds/harp/KSHarp_C5_mf.wav'
import G5 from './sounds/harp/KSHarp_G5_mf.wav'
import D6 from './sounds/harp/KSHarp_D6_mf.wav'
import airportReverb from './sounds/convolutionreverb/AirportTerminal.wav'
import bloom2 from './sounds/convolutionreverb/Midiverb_II-49-Bloom2 7sec.wav'
import reverse from './sounds/convolutionreverb/Midiverb_II-44-Reverse 150msec.wav'
// import { LinearEncoding } from 'three';




function App() {

  // RANDOMIZERS

  function getRandomUpTo(max){
    return Math.random() * max;
  }

  function getRandomFromArray(arr) {
    return arr[Math.floor(getRandomUpTo(arr.length))]
  }

  function getRandomBetween(min, max) {
    return min + getRandomUpTo(max - min);
  }

  function probability(p) {
    return Math.random() < p;
  }

  function gaussian() {
    return (Math.random() + Math.random()) / 2
  }


  const sampler = new Tone.Sampler({
    urls: {
      A2: A2,
      D2: D2,
      F2: F2,
      C3: C3,
      G3: G3,
      A4: A4,
      D4: D4,
      F4: F4,
      C5: C5,
      G5: G5,
      D6: D6
    }
  })

  let notes = [
    'Ab',
    'Eb',
    'F',
    'C',
    'Db',
    'G',
    'Bb'
  ]

  const noteLengths = [
    '4n',
    '8n',
    '2n',
    '16n'
  ]

  const makeScheduleChord = synth => {
    const scheduleChord = () => {
      const note = getRandomFromArray(notes)
      const octave = getRandomFromArray(['2', '3', '4', '5'])
      const tonic = `${note}${octave}`
      const inversion = Math.floor(getRandomBetween(0,5))
      let chordNotes = []
      if (note == 'C' || note == 'F' || note == 'G' || note == 'Bb') {
        chordNotes = invert(minor7th(tonic), inversion)
      } else if (note == 'Db' || note == 'Ab' ) {
        chordNotes = invert(major7th(tonic), inversion)
      } else {
        chordNotes = invert(dominant7th(tonic), inversion)
      }
      console.log(chordNotes)
      chordNotes.forEach(note => {
        synth.triggerAttackRelease(note, '2n', `+${getRandomBetween(0, 5)}`, getRandomBetween(0, .8))

        console.log(note)
      })
      Tone.Transport.scheduleOnce(() => {
        scheduleChord();
      }, `+${getRandomBetween(5, 8)}`)
    }
    scheduleChord()
  }

  const makeScheduleHarp = sampler => {
    const scheduleHarp = () => {
      const note = getRandomFromArray(notes)
      const octave = getRandomFromArray(['0', '1', '2'])
      const tonic = `${note}${octave}`
      sampler.triggerAttackRelease(tonic, '4n', `+${getRandomBetween(0, 5)}`, getRandomBetween(.3, .7))
      console.log(tonic)
      Tone.Transport.scheduleOnce(() => {
        scheduleHarp();
      }, `+${getRandomBetween(5, 8)}`)
    }
    scheduleHarp()
  }


  let osc = new Tone.OmniOscillator()
  

  let synth = new Tone.PolySynth({
      harmonicity: 1,
      volume: -20,
      voice0: {
          oscillator: { type: 'sawtooth' },
          envelope: {
            attack: 0.1,
            release: 1,
            releaseCurve: 'linear'
          },
          filterEnvelope: {
            baseFrequency: 200,
            octaves: 2,
            attack: 0.1,
            decay: 0,
            release: 1000
          }
      },
      voice1: {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.1,
            release: 1,
            releaseCurve: 'linear'
          },
          filterEnvelope: {
            baseFrequency: 200,
            octaves: 2,
            attack: 0.1,
            decay: 0,
            release: 1000
          }
      },
      vibratoRate: 0.5,
      vibratoAmount: 0.1
    });


  let filter = new Tone.Filter(1200, "lowpass");
  let lfo = new Tone.LFO(1, 200, 1200);
  lfo.connect(filter.frequency)
  lfo.start()

  let filter2 = new Tone.Filter(200, "highpass")
  

  const reverb = new Tone.Convolver(airportReverb)
  const bloom = new Tone.Convolver(bloom2)
  const echo = new Tone.FeedbackDelay('16n', 0.2)

  sampler.connect(filter2)
  filter2.connect(bloom)
  bloom.connect(filter)

  synth.connect(filter)
  filter.connect(echo)

  echo.connect(reverb)
  reverb.toDestination()


  Tone.Transport.bpm.value = 140;

  const startApp = async () => {
    await Tone.start()
    Tone.Transport.start()
    osc.start()
    makeScheduleChord(synth)
    makeScheduleHarp(sampler)
    // synth.triggerAttackRelease('A3', .1)
    console.log('generating...')
  }



  return (
    <>
      <button onClick={startApp}>generate</button>
    </>
  )
}

export default App;

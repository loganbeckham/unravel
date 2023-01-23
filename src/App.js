import './App.css';
import React, {useEffect, useState} from 'react';
import * as Tone from 'tone'
import { invert } from '@generative-music/utilities';
import { Scale, Key, Chord } from "tonal";
import p5 from 'p5'

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



class App extends React.Component {
  
    constructor() {
        super()
        this.myRef = React.createRef()
    }


    Sketch = (p5) => {

        /////////////////////
        //// randomizers ////
        /////////////////////

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


        /////////////////////
        /////// p5js ////////
        /////////////////////

        let dimension, canvas, pixels

        class AveragedPixel {

            constructor(x, y, l, isSource) {

                this.x = x
                this.y = y
                this.l = l

                this.hue = p5.random(360)
                this.color = p5.color(this.hue, 255, 255)
                this.isSource = isSource

                if (isSource) {
                    // sourcePixels.push(this)
                    // console.log(sourcePixels)
                }

            }

            draw() {
                p5.fill(this.color)
                p5.noStroke()
                p5.square(this.x, this.y, this.l+.5, 0)
            }
        }

        class Pixel {

            constructor() {

                this.pixels = []
                this.numPixels = 40
                this.SPACING = 0

                let length = p5.width / this.numPixels
                let height = p5.height / this.numPixels


                for (let i = 0; i < this.numPixels; i++) {

                    let curRow = []
                    let x = i * length + this.SPACING * i * this.SPACING / 2

                    for (let j = 0; j < this.numPixels; j++) {
                        // let isSource = p5.random(this.numPixels*this.numPixels) < 20
                        let isSource = false

                        let y = j * height + this.SPACING * j * this.SPACING / 2

                        curRow.push(new AveragedPixel(x, y, length, isSource))

                    }

                    
                    this.pixels.push(curRow)
                }
            }

            draw() {

                for (let i = 0; i < this.pixels.length; i++){

                    for (let j = 0; j < this.pixels[i].length; j++) {
                        this.pixels[i][j].draw()
                    }

                }
            }

            update() {

                for (let i = 0; i < this.pixels.length; i++) {

                    for (let j = 0; j < this.pixels[i].length; j++) {

                        let curSquare = this.pixels[i][j]

                        if (curSquare.isSource) {
                            curSquare.hue = (curSquare.hue + .6) % 1000
                            


                        } else {

                            let targetHueX = 0
                            let targetHueY = 0
                            let neighborHue

                            neighborHue = this.getHue(i-1,j)
                            if (neighborHue != -1) {
                                targetHueY += p5.sin(neighborHue-180)
                                targetHueX += p5.cos(neighborHue-180)
                            }

                            neighborHue = this.getHue(i-1,j-1)
                            if (neighborHue != -1) {
                                targetHueY += p5.sin(neighborHue-180)
                                targetHueX += p5.cos(neighborHue-180)
                            }

                            neighborHue = this.getHue(i-1,j+1)
                            if (neighborHue != -1) {
                                targetHueY += p5.sin(neighborHue-180)
                                targetHueX += p5.cos(neighborHue-180)
                            }

                            neighborHue = this.getHue(i,j-1)
                            if (neighborHue != -1) {
                                targetHueY += p5.sin(neighborHue-180)
                                targetHueX += p5.cos(neighborHue-180)
                            }

                            neighborHue = this.getHue(i,j+1)
                            if (neighborHue != -1) {
                                targetHueY += p5.sin(neighborHue-180)
                                targetHueX += p5.cos(neighborHue-180)
                            }

                            neighborHue = this.getHue(i+1,j)
                            if (neighborHue != -1) {
                                targetHueY += p5.sin(neighborHue-180)
                                targetHueX += p5.cos(neighborHue-180)
                            }

                            neighborHue = this.getHue(i+1,j-1)
                            if (neighborHue != -1) {
                                targetHueY += p5.sin(neighborHue-180)
                                targetHueX += p5.cos(neighborHue-180)
                            }

                            neighborHue = this.getHue(i+1,j+1)
                            if (neighborHue != -1) {
                                targetHueY += p5.sin(neighborHue-180)
                                targetHueX += p5.cos(neighborHue-180)
                            }   

                            curSquare.hue = p5.atan2(targetHueY, targetHueX)+180
                        }

                        curSquare.color = p5.color(curSquare.hue, 20, 255)
                        // curSquare.color = p5.color(curSquare.hue, 20, 255)

                    }
                }
            }

            getHue(row,col) {

                if(row < 0 || col < 0 || row == this.numPixels || col == this.numPixels){
                    return -1
                }else{
                    return this.pixels[row][col].hue
                }

            }
        }


        p5.setup = (parent) => {

            p5.frameRate(60)
            p5.pixelDensity(2.0)
            p5.noStroke()
            p5.colorMode(p5.HSB, 360, 100, 100)
            p5.angleMode(p5.DEGREES)

            p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(parent)
            p5.filter(p5.GRAY)

            pixels = new Pixel()

        }


        p5.draw = () => {

            p5.background(10, 40, 50)
            p5.clear()
            pixels.update()
            pixels.draw()

            // let waveform = freq.getValue()
            // console.log(waveform)
            // for(let i = 0; i < waveform.length; i++){
            //   let x = p5.map(i, 0, waveform.length, 0, p5.width)
            //   let y = p5.map(waveform[i], -1, 1, p5.height, 0)
            //   p5.circle(x, y, 3)
            // }
        }

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
        } 






  /////////////////////
  ////// TONE.JS //////
  /////////////////////


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
        'A',
        'Bb',
        'B',
        'C',
        'Db',
        'D',
        'Eb',
        'E',
        'F',
        'Gb',
        'G',
        'Ab'
    ]


    const noteLengths = [
        '4n',
        '8n',
        '2n',
        '16n'
    ]

    const keyChords = []

    console.log(Scale.get("G Dorian").notes)

    const gdorian = [
        'Gm7',
        'Am7',
        'Bbmaj7',
        'Cmaj7',
        'Dm7',
        'Em7b5',
        'Fmaj7'
    ]



    const note = getRandomFromArray(notes)


    keyChords.push(Key.minorKey(note).natural.chords)


    let scaleChords = getRandomFromArray(keyChords)

    console.log(scaleChords)

    console.log(note)

    console.log(keyChords)




    p5.mouseClicked = () => {
        Tone.start()
        Tone.Transport.start()
        osc.start()
        makeScheduleChord(synth)
        // makeScheduleHarp(sampler)
        console.log('generating...')
    }



    const makeScheduleChord = () => {

        const scheduleChord = () => {

            const octave = getRandomFromArray(['3', '4', '5'])
            const bassOctave = getRandomFromArray(['1', '2'])



            let thisChord = `${getRandomFromArray(gdorian)}`
            console.log(thisChord)


            let chordNotes = Chord.get(thisChord).notes

            let thisChordNotes = []


            chordNotes.forEach(note => {
                note = note + octave
                thisChordNotes.push(note)
            })

            console.log(thisChordNotes)


            const inversion = Math.floor(getRandomBetween(0,5))

            thisChordNotes = invert(thisChordNotes, inversion)

            console.log(thisChordNotes)

            let root = thisChordNotes[0].slice(0, -1)
            root = root + bassOctave


      
            thisChordNotes.forEach(note => {

                console.log(note)
                let pause = getRandomBetween(0, 5)
                synth.triggerAttackRelease(note, '2n', `+${pause}`, getRandomBetween(0, .8))
                let thisPixel = pixels.pixels[Math.floor(p5.random(40))][Math.floor(p5.random(40))]
        
                setTimeout(() => {
                    thisPixel.hue = p5.random(360)
                    thisPixel.color = p5.color(thisPixel.hue, 255, 255)
                    thisPixel.isSource = true
                }, pause * 1000)
        
                setTimeout(() => {
                    thisPixel.isSource = false
                }, 45000)
      
            })

            console.log(root)

            sampler.triggerAttackRelease(root, '4n', `+${getRandomBetween(0, 5)}`, getRandomBetween(.2, .6))



            Tone.Transport.scheduleOnce(() => {
              scheduleChord();
            }, `+${getRandomBetween(8, 12)}`)
        }

        scheduleChord()

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
  const freq = new Tone.Waveform()

  sampler.connect(filter2)
  filter2.connect(bloom)
  bloom.connect(filter)

  synth.connect(filter)
  filter.connect(echo)

  echo.connect(reverb)
  reverb.connect(freq)
  freq.toDestination()
}

componentDidMount() {
  this.myP5 = new p5(this.Sketch, this.myRef.current)
}



render() {
  return (
    <>
        <div className='navbar'>
            <div>
                <h1 id='site-name'>unravel</h1>
            </div>
            
        </div>
      <div id='p5sketch' ref={this.myRef}/>
    </>
  )
}
}

export default App;

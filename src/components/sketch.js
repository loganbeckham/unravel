import React from "react";
import Sketch from "react-p5";


let x = 50
let y = 50

const canvas = (props) => {

    const setup = (p5, canvasParentRef) => {
        p5.createCanvas(500, 500).parent(canvasParentRef)
    }

    const draw = p5 => {
        p5.background(0)
        p5.ellipse(100, 100, 100)
        p5.ellipse(300, 100, 100)
    }

    return <Sketch setup={setup} draw={draw} />

}

export default canvas


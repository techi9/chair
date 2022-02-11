
import React from "react";
import "../styles/Button.css";
import map from "../utility/map"


class RotationControl extends React.Component {

    constructor(props){
        super(props)

        this.primaryMouseButtonDown = false;
//83.29588014981273 79.4156706507304
        this.x1 =  83.29588014981273
        this.y1 =  79.4156706507304

        this.state = {angle: 0}

    }

    componentWillMount = () => {
        document.addEventListener('mouseup', this.setPrimaryButtonStateUp, false);  // assuming that you already did .bind(this) in constructor
    }

    componentWillUnmount = () => {
        document.removeEventListener('mouseup', this.setPrimaryButtonStateUp, false);  // assuming that you already did .bind(this) in constructor
    }

    mouseMove = (e) =>{

        if(this.primaryMouseButtonDown){
            this.x2 = e.clientX
            this.y2 = e.clientY
            this.x2 = map(e.clientX, 0, window.innerWidth, 0, 100)
            this.y2 = map(e.clientY, 0, window.innerHeight, 0, 100)
        }


        let angle = Math.atan((this.y2 - this.y1) / (this.x2 - this.x1)) * 180 / Math.PI;
            if ((this.x2 - this.x1) < 0)
                angle += 180;
            else if ((this.y2 - this.y1) < 0)
                angle +=360;

        this.setState({angle: angle})
        console.log(angle) //
        console.log(this.x2, this.y2)


    }

    setPrimaryButtonStateDown = (e) => {
        this.primaryMouseButtonDown = true
        window.addEventListener("mousemove", this.mouseMove)
        console.log('pressed')
        // this.x1 = e.clientX
        // this.y1 = e.clientY
        //
        // this.x1 = map(e.clientX, 0, window.innerWidth, 0, 100)
        // this.y1 = map(e.clientY, 0, window.innerHeight, 0, 100)


    }


    setPrimaryButtonStateUp = (e) => {
        if (this.primaryMouseButtonDown){
            window.removeEventListener("mousemove", this.mouseMove)
            this.primaryMouseButtonDown = false
            this.mouseMove(e)
            console.log('released')
        }

    }

    render() {

        let css = {
            transform : 'rotate(' + this.state.angle + 'deg)'
        }

        return (
            <div>
                <input className="rotationButton" src={'./wheel.png'} type='button' style = {css} onMouseDown={this.setPrimaryButtonStateDown}/>
            </div>
        )
    }


}

export default RotationControl
import React, { Component } from "react";
import "../styles/Button.css"

class Controller extends Component{


    drop = () => {
        this.props.onDrop()
    }

    dropAndShow = () => {
        this.props.onDropAndShow()
    }

    leftButton = () => {
        this.props.onLeftMoveButton()
    }

    rightButton = () => {
        this.props.onRightMoveButton()
    }

    backButton = () => {
        this.props.onBackMoveButton()
    }

    forwardButton = () => {
        this.props.onForwardMoveButton()
    }

    RestartButton = () =>{
        this.props.onRestartButton()
    }

    render() {
        return(
            <div>
                <input className="DropButton" type='button' onClick={this.drop} value="DROP IT!!"/>
                <input className="DropAndShowButton" type='button' onClick={this.dropAndShow} value="DROP AND SHOW"/>
                <input className="LeftMoveButton" type='button' onClick={this.leftButton} value="←"/>
                <input className="RightMoveButton" type='button' onClick={this.rightButton} value="→"/>
                <input className="BackMoveButton" type='button' onClick={this.backButton} value="↑"/>
                <input className="ForwardMoveButton" type='button' onClick={this.forwardButton} value="↓"/>
                <input className="RestartButton" type='button' onClick={this.RestartButton} value="Restart"/>
            </div>
        )
    }
}

export default Controller
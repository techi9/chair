import React, { Component } from "react";
import "../styles/Button.css"

class Controller extends Component{
    constructor(props) {
        super(props);
    }

    drop = () => {
        this.props.onDrop()
    }

    render() {
        return(
            <div>
                <input className="DropButton" type='button' onClick={this.drop} value="DROP IT!!"/>
            </div>
        )
    }
}

export default Controller
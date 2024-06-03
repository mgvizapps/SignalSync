import React from "react";
import {Renderer} from "neutrine/lib/components";
import {Range} from "neutrine/lib/components";

import style from "./style.scss";

export class Thresholds extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "deletion": this.props.defaultDeletion.toFixed(2),
            "amplification": this.props.defaultAmplification.toFixed(2)
        };
        //Referenced elements
        this.ref = {
            "deletion": React.createRef(),
            "amplification": React.createRef()
        };
        this.timer = null; //Timer
        //Bind methods
        this.handleChange = this.handleChange.bind(this);
    }
    //Handle threshold change --> set timer
    handleChange() {
        let self = this;
        //Chekc for timeout active --> clear timeout
        if (this.timer !== null) {
            clearTimeout(this.timer); //Clear timeout
        }
        //Register a new timeput listener
        this.timer = setTimeout(function () {
            let amplification = Number(self.ref.amplification.current.value);
            let deletion = Number(self.ref.deletion.current.value);
            //Send onchange
            return self.props.onChange(deletion, amplification);
        }, this.props.delay);
        //Update the thresholds values
        return this.setState({
            "amplification": Number(this.ref.amplification.current.value),
            "deletion": Number(this.ref.deletion.current.value)
        });
    }
    //Render the thresholds wrapper component
    render() {
        let self = this;
        return (
            <div className="siimple--flex">
                <div style={{"flexGrow": "1"}}>
                    <Renderer render={function () {
                        return React.createElement(Range, {
                            "ref": self.ref.deletion,
                            "className": style.deletion,
                            "defaultValue": self.props.defaultDeletion,
                            "onChange": self.handleChange,
                            "step": self.props.step,
                            "min": self.props.minDeletion,
                            "max": self.props.maxDeletion
                        });
                    }} />
                    {/* Dsiplay deletion value */}
                    <div align="center" className="siimple--text-muted">
                        <div className="siimple--text-bold siimple--text-small">{this.state.deletion}</div>
                        <span style={{"fontSize":"10px"}}>Deletion threshold</span>
                    </div>
                </div>
                <div style={{"flexGrow": "1"}}>
                    <Renderer render={function () {
                        return React.createElement(Range, {
                            "ref": self.ref.amplification,
                            "className": style.amplification,
                            "defaultValue": self.props.defaultAmplification,
                            "onChange": self.handleChange,
                            "step": self.props.step,
                            "min": self.props.minAmplification,
                            "max": self.props.maxAmplification
                        });
                    }} />
                    {/* Display amplification value */}
                    <div align="center" className="siimple--text-muted">
                        <div className="siimple--text-bold siimple--text-small">{this.state.amplification}</div>
                        <span style={{"fontSize":"10px"}}>Amplification threshold</span>
                    </div>
                </div>
            </div>
        );
    }
}

Thresholds.defaultProps = {
    "defaultDeletion": -0.5,
    "defaultAmplification": 0.5,
    "minDeletion": -1.5,
    "maxDeletion": 0,
    "minAmplification": 0,
    "maxAmplification": 1.5,
    "step": 0.01,
    "delay": 500,
    "onChange": null
};

import React from "react";
import {If} from "neutrine/lib/components";
import {Media, MediaStart, MediaContent} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";

//File name style
let filenameStyle = {
    "height": "40px",
    "lineHeight": "40px",
    "whiteSpace": "nowrap",
    "overflow": "hidden",
    "textOverflow": "ellipsis"
};

//Export file selector component
export class SelectFile extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "hasFile": false,
            "filename": "No file chosen"
        };
        //Referenced elements
        this.ref = {
            "input": React.createRef()
        };
        //Bind methods
        this.value = this.value.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    //Handle button click --> select a new file
    handleClick() {
        return this.ref.input.current.click();
    }
    //Handle input change --> update current file
    handleChange() {
        //console.log(this.ref.input.current.files);
        let files = this.ref.input.current.files; //Get current file
        let newState = {
            "hasFile": files.length === 1,
            "filename": (files.length === 1) ? files[0].name : "No file chosen"
        };
        //Update the state
        return this.setState(newState, function () {
            return this.props.onChange(newState.hasFile);
        });
    }
    //Get current file
    value() {
        return (this.state.hasFile) ? this.ref.input.current.files[0] : null;
    }
    //Render file input
    render() {
        let self = this;
        return (
            <Media className="siimple--mb-0 siimple--bg-light siimple--border-rounded siimple--p-3">
                <MediaStart>
                    <Btn color={this.props.color} onClick={this.handleClick}>
                        <strong>Select file</strong>
                    </Btn>
                </MediaStart>
                <MediaContent className="siimple--pr-1">
                    <input type="file" ref={this.ref.input} onChange={this.handleChange} style={{"display":"none"}} />
                    <div align="right" style={filenameStyle}>
                        <strong>{this.state.filename}</strong>
                    </div>
                </MediaContent>
            </Media>
        );
    }
}

//Select file props
SelectFile.defaultProps = {
    "color": "primary",
    "accepted": [],
    "onChange": null
};



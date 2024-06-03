import React from "react";
import {ForEach, Renderer} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";

//Get the default buttons list
let defaultButtons = {
    "bold": {
        "command": "bold",
        "title": "Bold"
    },
    "italic": {
        "command": "italic",
        "title": "Italic"
    },
    "underline": {
        "command": "underline",
        "title": "Underline"
    }
};

//Export WYSIWYG editor
export class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.ref = {
            "content": React.createRef()
        };
        //Bind methods
        this.value = this.value.bind(this);
        this.format = this.format.bind(this);
    }
    //Component did mount --> set initial content
    componentDidMount() {
        this.ref.content.current.innerHTML = this.props.defaultValue;
    }
    //Apply format
    format(command) {
        return document.execCommand(command, false, null);
    }
    //Set or get editor value
    value() {
        return this.ref.content.current.innerHTML;
    }
    //Render editor component
    render() {
        let self = this;
        return (
            <div className="siimple--mb-0">
                {/* Available format buttons */}
                <div className="siimple--mb-2">
                    <ForEach items={this.props.buttons} render={function (key) {
                        let button = defaultButtons[key]; //Get button info
                        let handleClick = function () {
                            return self.format(button.command);
                        };
                        return (
                            <Btn key={key} small color="light" onClick={handleClick} className="siimple--mr-1">
                                <Icon icon={key} size="20px" />
                            </Btn>
                        );
                    }}/>
                </div>
                {/* Editor content */}
                <Renderer render={function () {
                    return React.createElement("div", {
                        "ref": self.ref.content,
                        "className": "siimple--bg-light1 siimple--border-rounded",
                        "contentEditable": true,
                        "spellCheck": false,
                        "style": {
                            "minHeight": self.props.minHeight,
                            "maxHeight": self.props.maxHeight,
                            "width": "calc(100% - 20px)",
                            "padding": "10px",
                            "overflowY": "auto"
                        }
                    });
                }} />
            </div>
        );
    }
}

//Editor default props
Editor.defaultProps = {
    "buttons": Object.keys(defaultButtons),
    "defaultValue": "",
    "maxHeight": "300px",
    "minHeight": "300px"
};



import React from "react";
import {If} from "neutrine/lib/components";
import {Content} from "neutrine/lib/components";
import {Heading, Paragraph} from "neutrine/lib/components";

import {Presentation} from "common/src/components/Presentation/index.js";
import {CreateLocal} from "../components/CreateLocal/index.js";

//Export home view
export class HomeView extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "source": "local"
        };
        //Bind methods
        this.handleSourceChange = this.handleSourceChange.bind(this);
    }
    //Handle source hange
    handleSourceChange(newSource) {
        return this.setState({"source": newSource});
    }
    //Render home view
    render() {
        let self = this;
        let props = this.props;
        let links = []; //Presentation links
        //Check for sample data provided in config --> display link for downloading data
        if (typeof this.props.sampleData === "string") {
            links.push({
                "title": "Download example data",
                "href": self.props.sampleData
            });
        }
        //Display home screen
        return (
            <Presentation title={props.title} description={props.description} links={links}>
                <Heading type="h2">Welcome to {props.title}</Heading>
                {/* Local source --> load data from local file */}
                <If condition={this.state.source === "local"} render={function () {
                    return React.createElement(CreateLocal, {
                        "onSubmit": self.props.onSubmit
                    });
                }} />
            </Presentation>
        );
    }
}



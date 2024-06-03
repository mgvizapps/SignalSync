import React from "react";
import jviz from "jviz";

import schema from "./schema.json";
import {getMaxCoverageValues} from "../../utils/coverage.js";

//Export gene preview component
export class GenePreview extends React.Component {
    constructor(props) {
        super(props);
        //Referenced elements
        this.ref = {
            "parent": React.createRef()
        };
        //Viewer instance
        this.viewer = null;
    }
    //Component did mount
    componentDidMount() {
        let drawing = this.ref.parent.current.getBoundingClientRect();
        //Get coverages max values
        let maxValues = getMaxCoverageValues(this.props.coverage);
        this.viewer = jviz(schema, {
            "parent": this.ref.parent.current
        });
        //Update the plot width/height
        this.viewer.width(drawing.width);
        this.viewer.height(drawing.height);
        //Set the plot data
        this.viewer.data("coverages", this.props.coverage);
        this.viewer.data("regions", this.props.regions);
        this.viewer.data("background", this.props.background);
        //Set the plot initial state values
        this.viewer.state("max_germline_tumor", Math.max(maxValues.germline, maxValues.tumor));
        this.viewer.state("max_diff", maxValues.diff);
        //Render the drawing plot
        this.viewer.render();
        console.log(this.viewer);
    }
    //Unmount this component
    componentWillUnmount() {
        delete this.viewer;
    }
    //Render the explorer preview
    render() {
        return React.createElement("div", {
            "style": {
                "width": this.props.width,
                "height": this.props.height
            },
            "ref": this.ref.parent
        });
    }
}

GenePreview.defaultProps = {
    "width": "100%",
    "height": "250px",
    "region": null,
    "regions": [],
    "coverage": [],
    "background": []
};



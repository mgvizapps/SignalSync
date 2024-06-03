import React from "react";
import jviz from "jviz";
import {schema} from "./schema.js";

//Build viewer from props
let buildViewerFromProps = function (props, parent) {
   //Build the boxplot
    let viewer = jviz(schema, {
        "parent": parent
    });
    //Set initial state
    viewer.state("deletion", props.thresholds.deletion);
    viewer.state("amplification", props.thresholds.amplification);
    //this.viewer.state("boxplot_width", Math.floor((drawing.width - 40) / this.props.genes.length);
    //Set initial data
    viewer.data("genes", props.genes);
    //Return the viewer
    return viewer;
};

//Explot boxplot overview component
export class Boxplot extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        //this.state = {};
        //Referenced elements
        this.ref = {
            "parent": React.createRef()
        };
        //Viewer isntance
        this.viewer = null;
    }
    //Component did mount
    componentDidMount() {
        let self = this;
        let drawing = this.ref.parent.current.getBoundingClientRect();
        //Initialize the viewer
        this.viewer = buildViewerFromProps(this.props, this.ref.parent.current);
        //Set plot width and height
        this.viewer.width(drawing.width);
        this.viewer.height(drawing.height);
        //Register boxplot event listeners
        //TODO
        //Render the viewer
        return this.viewer.render().then(function () {
            //console.log(self.viewer);
            //console.log("Boxplot ready");
        });
    }
    //Component did update: update the threshold values
    componentDidUpdate() {
        this.viewer.state("deletion", this.props.thresholds.deletion);
        this.viewer.state("amplification", this.props.thresholds.amplification);
        this.viewer.data("genes", this.props.genes);
        //Update the plor
        this.viewer.render();
    }
    //Render the boxplot overview parent
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

Boxplot.defaultProps = {
    "width": "100%",
    "height": "100px",
    "genes": [],
    "thresholds": null,
    "onClick": null
};
//Generate an image of the boxplot
export function getBoxplotImage (options) {
    options = Object.assign({}, Boxplot.defaultProps, options);
    let viewer = buildViewerFromProps(options, null); //Initialize viewer
    viewer.width(options.width); //Set width value
    viewer.height(options.height); //Set height value
    //Render the viewer and generate the image in PNG format
    return viewer.render().then(function () {
        return viewer.toImageUrl("png", 1);
    });
}


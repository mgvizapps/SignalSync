import React from "react";
import jviz from "jviz";
import {schema} from "./schema.js";

//ScaleLegendTrack component
export class ScaleLegendTrack extends React.Component {
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
        let self = this;
        //let name = this.props.currentChromosome.replace("chr", ""); //Alias for the chromosome name
        let drawing = this.ref.parent.current.getBoundingClientRect();
        //Get the current chromosome data
        this.viewer = jviz(schema, {
            "parent": this.ref.parent.current
        });
        //Set plot width/height
        this.viewer.width(drawing.width);
        this.viewer.height(drawing.height);
        //Set initial state values
        this.viewer.state("start", this.props.start);
        this.viewer.state("end", this.props.end);
        this.viewer.state("length", this.props.length);
        this.viewer.state("strand", this.props.strand);
        this.viewer.data("grid", this.props.grid);
        this.viewer.data("regions", this.props.regions);
        //console.log(this.viewer);
        return this.viewer.render();
    }
    //Render the scalelegend
    render() {
        return React.createElement("div", {
            "style": {
                "width": this.props.width,
                "height": this.props.height,
            },
            "ref": this.ref.parent
        });
    }
}

ScaleLegendTrack.defaultProps = {
    "start": 0,
    "end": 0,
    "length": "0 bp",
    "strand": "forward",
    "width": "100%",
    "height": "40px",
    "grid": [],
    "regions": []
};




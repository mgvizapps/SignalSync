import React from "react";
import jviz from "jviz";
import {schema} from "./schema.js";
import {distributeFeaturesInRows} from "common/src/utils/tracks.js";

//FeaturesTrack component
export class FeaturesTrack extends React.Component {
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
        let drawing = this.ref.parent.current.getBoundingClientRect();
        let features = distributeFeaturesInRows(this.props.features); //Distribute features
        let rows = -1; //Number of rows
        if (features.length > 0) {
            rows = Math.max.apply(null, features.map(function (feature) {
                return feature["row"]
            }));
        }
        //Get the current chromosome data
        this.viewer = jviz(schema, {
            "parent": this.ref.parent.current
        });
        //Set plot width/height
        this.viewer.width(drawing.width);
        this.viewer.height((this.props.featureHeight * (rows + 1)) + this.props.titleHeight);
        //Set initial state values
        this.viewer.state("start", this.props.start);
        this.viewer.state("end", this.props.end);
        this.viewer.state("featureHeight", this.props.featureHeight);
        this.viewer.state("featureRectHeight", this.props.featureRectHeight);
        this.viewer.state("featureRectMargin", this.props.featureRectMargion);
        this.viewer.state("titleValue", this.props.title);
        this.viewer.state("titleHeight", this.props.titleHeight);
        //Set initial data values
        this.viewer.data("features", this.props.features);
        this.viewer.data("grid", this.props.grid);
        this.viewer.data("regions", this.props.regions);
        //console.log(this.viewer);
        return this.viewer.render();
    }
    //Component did update --> update regions
    componentDidUpdate() {
        return null;
    }
    //Render the scalelegend
    render() {
        return React.createElement("div", {
            "style": {
                "width": this.props.width
            },
            "ref": this.ref.parent
        });
    }
}

//Default props
FeaturesTrack.defaultProps = {
    "width": "100%",
    //"height": "40px",
    "start": 0,
    "end": 0,
    "features": [],
    "featureHeight": 24,
    "featureRectHeight": 8,
    "featureRectMargin": 4,
    "grid": [],
    "regions": [],
    "title": "::: Features track",
    "titleHeight": 15
};




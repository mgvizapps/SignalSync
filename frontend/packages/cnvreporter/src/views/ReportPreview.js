import React from "react";
import {If} from "neutrine/lib/components";
import {Spinner} from "neutrine/lib/components";

//Export Report preview page
export class ReportPreviewView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "loading": true
        };
        //Referenced elements
        this.ref = {
            "frame": React.createRef()
        };
    }
    //Component did mount --> generate and display report
    componentDidMount() {
        let self = this;
        //Generate the report
        return this.props.generateReport().then(function (word) {
            return self.setState({"loading": false}, function () {
                //let iframe = self.ref.frame.current;
                let iframe = self.ref.frame.current.contentWindow;
                //iframe = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
                //Write the report
                iframe.document.open();
                iframe.document.write(word.generate());
                iframe.document.close();
                //Set document style
                iframe.document.documentElement.style.setProperty("transform", "scale(0.95)");
                iframe.document.documentElement.style.setProperty("user-select", "none");
            });
        });
    }
    //Render the report preview
    render() {
        let self = this;
        return (
            <div className="siimple--bg-white siimple--p-3 siimple--mb-3 siimple--border-rounded">
                {/* Loading state --> render spinner element */}
                <If condition={this.state.loading}>
                    <div className="siimple--p-4" align="center">
                        <Spinner color="primary" />
                    </div>
                </If>
                {/* Not loading state --> render iframe */}
                <If condition={!this.state.loading} render={function () {
                    return React.createElement("iframe", {
                        "ref": self.ref.frame,
                        "style": {
                            "border": "0px solid var(--siimple-light2)"
                        },
                        "width": "100%",
                        "height": "600px"
                    });
                }} />
            </div>
        );
    }
}


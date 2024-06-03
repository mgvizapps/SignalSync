import React from "react";
import Rouct from "rouct";
import {ForEach} from "neutrine/lib/components";
import {Card, CardContent} from "neutrine/lib/components";
import {Heading, Paragraph, Lead} from "neutrine/lib/components";
import {Row, Column} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";

//Render home page
export function HomePage (props) {
    let paths = Object.keys(props.apps); //Get apps paths
    return (
        <React.Fragment>
            {/* Page presentation */}
            <div align="center" className="siimple--mb-8 siimple--mt-3">
                <Heading type="h1" className="siimple--text-normal siimple--mb-0">
                    Our <strong>Applications</strong>
                </Heading>
                <Lead className="siimple--mb-0">
                    <strong>MGvizApps provides free and open-source applications.</strong>
                </Lead>
            </div>
            {/* List with all available applications */}
            <Row className="siimple--mb-0">
                <ForEach items={paths} render={function (path, index) {
                    let app = props.apps[path]; //Get app config
                    let handleClick = function () {
                        return Rouct.redirect(path);
                    };
                    return (
                        <Column size="4" key={index}>
                            <Card className="siimple--mb-0">
                                {/* Image content */}
                                <CardContent>
                                    <div className="siimple--border-rounded siimple--bg-light siimple--p-4" align="center">
                                        <Icon icon="dna" size="34px" className="siimple--text-dark" />
                                    </div>
                                </CardContent>
                                {/* Application description */}
                                <CardContent style={{"minHeight":"120px"}}>
                                    <Heading type="h4">{app.title}</Heading>
                                    <Paragraph className="siimple--mb-0">{app.shortDescription}</Paragraph>
                                </CardContent>
                                {/* Application link */}
                                <CardContent>
                                    <Btn color="primary" fluid onClick={handleClick}>
                                        <strong>Get started</strong>
                                    </Btn>
                                </CardContent>
                            </Card>
                        </Column>
                    );
                }} />
            </Row>
        </React.Fragment>
    );
}


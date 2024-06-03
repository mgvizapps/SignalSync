import React from "react";
import {ForEach} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Content} from "neutrine/lib/components";
import {Heading, Paragraph} from "neutrine/lib/components";
import style from "./style.scss";

import {openInNewTab} from "common/src/utils/dom.js";

//Export presentation wrapper component for apps
export function Presentation (props) {
    return (
        <div className="siimple--flex">
            {/* Presentation banner */}
            <div className={style.banner}>
                <div className={style.bannerContent}>
                    <Heading type="h1" className="siimple--mb-1">{props.title}</Heading>
                    <Paragraph className="siimple--mb-5">{props.description}</Paragraph>
                    {/* Links */}
                    <ForEach items={props.links} render={function (link, index) {
                        let handleClick = function (event) {
                            //Check for onClick listener provided
                            if (typeof link.onClick === "function") {
                                return link.onClick.call(null);
                            }
                            //Check for external url provided --> open in a new tab
                            else if (typeof link.href === "string") {
                                return openInNewTab(link.href);
                            }
                        };
                        return (
                            <div className={style.bannerButton} onClick={handleClick} align="center" key={index}>
                                <strong>{link.title}</strong>
                            </div>
                        );
                    }} />
                </div>
            </div>
            {/* Presentation content */}
            <Content size="large" style={{"flexGrow":1}}>
                {props.children}
            </Content>
        </div>
    );
}

//Presentation default props
Presentation.defaultProps = {
    "title": "",
    "description": "",
    "links": []
};



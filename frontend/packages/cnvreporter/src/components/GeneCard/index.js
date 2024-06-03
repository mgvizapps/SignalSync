import React from "react";
import {classNames} from "neutrine/lib/utils";
import {If, Renderer} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";

import {getCNVStateColor} from "../../utils/cnv.js";
import style from "./style.scss";

//Gene card component
export function GeneCard (props) {
    let rootClassList = classNames({
        [style.root]: true,
        [style.active]: props.active
        //[style.grid]: props.grid
    });
    let titleColor = getCNVStateColor(props.state); //state color
    let titleClassList = classNames({
        [style.title]: true,
        "siimple--text-white": true
        //["siimple--bg-" + cnvColor]: props.state !== "none",
        //"siimple--text-white": props.state !== "none"
    });
    //let geneWarning = typeof props.status === "string" && props.status !== "";
    let pinnedClassList = classNames({
        [style.pinned]: true,
        [style.pinnedHover]: true,
        [style.pinnedActive]: props.pinned
    });
    let handlePinnedClick = function (event) {
        //if (props.mode === "selection") {
        //    return null; //Nothing to do
        //}
        event.stopPropagation(); //Stop event propagation
        return props.onPinnedClick();
    };
    //Return the gene card component
    return (
        <div className={rootClassList} onClick={props.onClick}>
            {/* Gene card head */}
            <div className={style.head}>
                {/* Title */}
                <div className={titleClassList} style={{"backgroundColor": titleColor}}>
                    <strong>{props.name}</strong>
                </div>
                <div align="right" style={{"display":"flex"}}>
                    {/* Warning icon 
                    <If condition={geneWarning}>
                        <div className="siimple--text-warning" style={{"height": "24px"}}>
                            <Icon icon="exclamation" size="20px" style={{"lineHeight": "24px"}} />
                        </div>
                    </If>
                    */}
                    {/* Pinned button */}
                    <div className={pinnedClassList} onClick={handlePinnedClick} data-role="pinned">
                        <Icon icon="thumbtack" size="20px" style={{"lineHeight": "24px"}} />
                    </div>
                </div>
            </div>
            {/* Gene card body content */}
            <div className={style.body}>
                <img className={style.image} src={props.image} />
            </div>
        </div>
    );
}

//Gene card default props
GeneCard.defaultProps = {
    "name": "Gene",
    "image": "",
    "mode": null,
    //"grid": false,
    "validation": null,
    "active": false,
    "pinned": false,
    "state": "neutral",
    "status": null,
    //"onStateChange": null,
    "onPinnedClick": null,
    "onClick": null,
    //"onEnter": null,
    "onSelect": null
};



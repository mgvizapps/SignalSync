import React from "react";
import ReactDOM from "react-dom";
import {global} from "common/src/global.js";
import {CNVReporterApp} from "cnvreporter/src/index.js";
//export {VismapperApp} from "vismapper/src/index.js";
//export {SeqmaskApp} from "seqmask/src/index.js";

//Import global styles
import "siimple/dist/siimple.css";
import "siimple-experiments/dist/siimple-experiments.css";
import "siimple-icons/dist/siimple-icons.css";
import "neutrine/lib/components.css";
import "neutrine/lib/datatable.css";

//Available apps
let apps = {
    "cnvreporter": CNVReporterApp
};

//Render the provided app to the provided parent element
export function render (parent, name, props) {
    if (typeof apps[name] === "undefined") {
        throw new Error(`Unknown app '${name}'`);
    }
    //Mount the specified app
    return ReactDOM.render(React.createElement(apps[name], props), parent);
}

//Set global variable for apps
export function setGlobal (key, value) {
    global[key] = value;
}

//Export available clients
export const clients = {};




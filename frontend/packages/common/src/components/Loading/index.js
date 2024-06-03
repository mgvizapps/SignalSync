import React from "react";
import {Spinner} from "neutrine/lib/components";

//Loading wrapper style
let loadingStyle = {
    "display": "flex",
    "width": "100%",
    "minHeight": "500px",
    //"height": "calc(100vh - 3rem)",
    "flexDirection": "column",
    "justifyContent": "center",
    "alignItems": "center"
};

//Export loading component
export function Loading (props) {
    return (
        <div align="center" style={loadingStyle}>
            <Spinner color="primary" />
        </div>
    );
}



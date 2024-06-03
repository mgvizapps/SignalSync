import React from "react";
import {ForEach} from "neutrine/lib/components";

import {GeneCard} from "../components/GeneCard/index.js";

//Export gallery list component
export function GalleryListView (props) {
    //let chromosome = props.request.params.chromosome; //Get chromosome name
    return (
        <div className="siimple--flex" style={{"flexWrap":"wrap"}}>
            <ForEach items={props.genes} render={function (gene, index) {
                return React.createElement(GeneCard, {
                    "key": index,
                    "name": gene.name,
                    "state": gene.annotation.state,
                    "pinned": gene.annotation.pinnedState,
                    "active": false,
                    "onClick": function (event) {
                        //TODO: parse event to validate click event
                        return props.onGeneClick(gene.name);
                    },
                    "onPinnedClick": function () {
                        return props.onGenePinnedChange(gene.name);
                    },
                    "image": props.images[index]
                });
            }} />
        </div>
    );
}



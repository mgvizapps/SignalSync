import React from "react";
import {Renderer} from "neutrine/lib/components";
import {Heading} from "neutrine/lib/components";
import {DataTable} from "neutrine/lib/datatable";
import {Content} from "neutrine/lib/components";

import {KaryotypeTrack} from "common/src/tracks/Karyotype/index.js";
import {Boxplot} from "../components/Boxplot/index.js";
import {CNVRegionsColumns} from "../utils/cnv.js";

//Export summary page
export function SummaryView (props) {
    return (
        <Content size="fluid" className="siimple--py-0">
            {/* Page title */}
            <Heading type="h1" className="siimple--mb-4">
                <strong>{props.title}</strong>
            </Heading>
            {/* Karyotype */}
            <div className="siimple--bg-white siimple--p-3 siimple--mb-3 siimple--border-rounded">
                <Renderer render={function () {
                    return React.createElement(KaryotypeTrack, {
                        "currentChromosome": null,
                        "chromosomes": props.chromosomes,
                        "cytobands": props.cytobands,
                        "regions": props.genes,
                        "onChromosomeClick": props.onChromosomeClick
                    });
                }} />
            </div>
            {/* Boxplot */}
            <div className="siimple--bg-white siimple--p-3 siimple--mb-3 siimple--border-rounded">
                <Renderer render={function () {
                    return React.createElement(Boxplot, {
                        "genes": props.genes,
                        "thresholds": props.thresholds
                    });
                }} />
            </div>
            {/* Regions table */}
            <Renderer render={function () {
                return React.createElement(DataTable, {
                    "data": props.regions,
                    "columns": CNVRegionsColumns,
                    "hover": true,
                    "border": false,
                    "striped": false
                });
            }} />
        </Content>
    );
}

//Summary view default props
SummaryView.defaultProps = {
    "title": "Summary"
};


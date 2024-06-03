import kofi from "kofi";
import {toReadableSize} from "common/src/utils/tracks.js";
import {defaultColors} from "common/src/colors.js";

//List with all available cnv state values
export const CNVState = {
    "neutral": {
        "label": "N",
        "name": "Neutral",
        "color": "#7F7F7F"
    },
    "amplification": {
        "label": "A",
        "name": "Amplification",
        "color": defaultColors.green
    },
    "deletion": {
        "label": "D",
        "name": "Deletion",
        "color": defaultColors.red
    }
};

//Calculate the cnv state automatically
export function getAutomaticCNVState (gene, thresholds) {
    let value = gene.stats.log2ratio.q50;
    //Check for amplification
    if (value > thresholds.amplification) {
        return "amplification";
    }
    //Check for deletion
    else if (value < thresholds.deletion) {
        return "deletion";
    }
    //Default value
    return "neutral";
}

//Get cnv state name
export function getCNVStateName (name) {
    return CNVState[name].name;
}

//Get cnv state color
export function getCNVStateColor (name) {
    return CNVState[name].color;
}

//Get CNV state label
export function getCNVStateLabel (name) {
    return CNVState[name].label;
}

//Get cnv state style
export function getCNVStateStyle (name) {
    return null;
}

//Generate displayed genes text
let getRegionDisplayGenes = function (genes) {
    //Only one gene --> display the gene name
    if (genes.length === 1) {
        return `${genes[0]} (1)`;
    }
    //Two genes --> display both genes
    else if (genes.length === 2) {
        return `${genes[0]},${genes[1]} (2)`;
    }
    //Other value --> display only the first and last gene names
    return `${genes[0]}...${genes[genes.length - 1]} (${genes.length})`;
};

//Get display region size
let getRegionDisplaySize = function (start, end) {
    let length = Math.abs(end - start) + 1;
    return `${(length / (1000 * 1000)).toFixed(1)} Mb`;
};

//Get region cytobands position
let getRegionDisplayCytobands = function (chromosome, cytobands) {
    //let chromosome = region.chromosome;
    //Check for only one gene in the region --> display only this cytoband
    if (cytobands.length === 1) {
        return `${chromosome}:${cytobands[0]}`;
    }
    //More than one genes --> display only the first and the last
    return `${chromosome}:${cytobands[0]}...${cytobands[cytobands.length - 1]}`;
};

//Build CNV regions from genes list
export function getCNVRegions (genes) {
    let groups = []; //Empty grouped genes list
    let last = null; //Last group
    //Group genes
    genes.forEach(function (gene, index) {
        let state = gene.annotation.state; //Get gene state
        if (groups.length === 0 || last.chromosome !== gene.chromosome || last.state !== state) {
            groups.push({
                "genes": [],
                "cytobands": [],
                "chromosome": gene.chromosome,
                "start": gene.start,
                "end": gene.end,
                "state": state
            });
            //Get last added group
            last = groups[groups.length - 1];
        }
        //Update last group
        last["start"] = Math.min(last["start"], gene.start);
        last["end"] = Math.max(last["end"], gene.end);
        last["genes"].push(gene.name); //Save gene name
        last["cytobands"].push(gene.cytoband); //Save gene cytoband
        //last["startIndex"] = Math.min(last["startIndex"], index);
        //last["endIndex"] = Math.max(last["endIndex"], index);
    });
    //Return groups items
    return groups.map(function (group, index) {
        return Object.assign(group, {
            "index": index,
            "slice": `${group.chromosome}:${group.start}-${group.end}`,
            "displayColor": getCNVStateColor(group.state),
            "displayTooltip": `${getCNVStateName(group.state)} (${group.start}-${group.end})`,
            "displayGenes": getRegionDisplayGenes(group.genes),
            "displaySize": getRegionDisplaySize(group.start, group.end),
            "displayCytobands": getRegionDisplayCytobands(group.chromosome, group.cytobands)
        });
    });
}

//CNV Regions columns
export const CNVRegionsColumns = kofi.values({
    "geneName": {
        "title": "Genes",
        "render": function (row, index) {
            return row.displayGenes;
        }
    },
    "chromosome": {
        "title": "Chr",
        "key": "chromosome"
    },
    "start": {
        "title": "Start",
        "render": function (row) {
            return toReadableSize(row.start)
        }
    },
    "end": {
        "title": "End",
        "render": function (row) {
            return toReadableSize(row.end)
        }
    },
    "type": {
        "title": "Type",
        "render": function (row, index) {
            return getCNVStateName(row.state);
        }
    }
});




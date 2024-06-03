import jviz from "jviz";

//Convert a size to friendly size
let friendlySizes = ["bp", "Kb", "Mb", "Gb"];
export function toFriendlySize (value) {
    let index = 0;
    while (index < friendlySizes.length - 1 && value >= 1000) {
        value = value / 1000;
        index = index + 1;
    }
    //Return the value
    return `${value.toFixed(2)} ${friendlySizes[index]}`;
}

//Convert a size to human readable size
export function toReadableSize (value) {
    return String(value).replace(/(.)(?=(\d{3})+$)/g, "$1,");
}

//Generate grid intervals
export function generateGrid (start, end, n) {
    let ticks = jviz.math.ticks(start, end, n, true); //Generate ticks
    let grid = [];
    for (let i = 0; i < ticks.length - 1; i++) {
        grid.push({
            "start": ticks[i],
            "end": ticks[i + 1],
            "label": toFriendlySize(ticks[i])
        });
    }
    //Return grid intervals
    return grid;
}

//Distribute features by rows
export function distributeFeaturesInRows (features) {
    let rows = [jviz.math.binarySearchTree()]; //Initialize the first row
    return features.map(function (feature, index) {
        let row = 0; //Row counter --> we will try to insert this region in this row
        let node = {"start": feature.start, "end": feature.end}; //Create node from region
        while (!rows[row].add(node)) {
            row = row + 1; //Increment row index
            if (rows.length <= row) {
                rows.push(jviz.math.binarySearchTree());
            }
        }
        //Update this region with the row index
        return Object.assign(feature, {"row": row});
    });
}

//Allowed strand values
let forwardStrandValues = ["+1", "+", "forward", "f"];
let reverseStrandValues = ["-1", "-", "reverse", "r"];

//Parse strand values --> unified for trakcs display
export function parseStrand (value) {
    return (forwardStrandValues.indexOf(("" + value).toLowerCase()) > -1) ? "+" : "-";
}

//Get human readable strand
export function toFriendlyStrand (value) {
    return (parseStrand(value) === "+") ? "Forward" : "Reverse";
};





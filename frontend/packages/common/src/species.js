import kofi from "kofi";
import {global} from "./global.js";

//Get file
let getFile = function (base, id, assembly, type) {
    base = global["path.resources"]; //Get base resources path (TODO: get from arguments)
    return kofi.request({"url": `${base}/${id}-${assembly}-${type}.json`, "json": true}).then(function (response) {
        return response.body;
    });
};

//To store species data
let speciesData = null;
let speciesNames = {}; //Species names

//Get species list
export function getSpecies () {
    let base = global["path.resources"]; //Get base resources path (TODO: get from arguments)
    //Check if species data is in memory --> do not import again the data
    if (speciesData !== null) {
        return Promise.resolve(speciesData);
    }
    //Import data fro server
    return kofi.request({"url": `${base}/species.json`, "json": true}).then(function (response) {
        speciesData = Object.keys(response.body).map(function (key) {
            speciesNames[key] = response.body[key].name; //Save specie name
            return response.body[key];
        });
        //Return species data object
        return speciesData;
    });
}

//Get specie name
export function getSpecieName (specie, assembly) {
    return getSpecies("").then(function () {
        return speciesNames[specie + "_" + assembly];
    });
}

//Get chromosomes for the specified specie
export function getChromosomes (id, assembly) {
    return getFile("", id, assembly, "chromosomes");
}

//Get cytobands for the specified specie
export function getCytobands (id, assembly) {
    return getFile("", id, assembly, "cytobands");
}


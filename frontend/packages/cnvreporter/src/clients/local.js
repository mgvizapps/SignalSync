import {TarballReader} from "common/src/utils/tarball.js";
import {readFileAsDataURL} from "common/src/utils/file.js";

//Export local client
export class LocalClient {
    constructor(options) {
        this.options = options;
        this.reader = new TarballReader(this.options.file); //Tarball reader
    }
    //Initialize client
    init() {
        //Initialize tarball reader
        return this.reader.read().then(function (files) {
            //console.log(files); //Only for test
            return true; //Reader ready
        });
    }
    //Read json file
    readJSONFileFromTarball(file) {
        return this.reader.readTextFile(file).then(function (data) {
            return JSON.parse(data);
        });
    }
    //Read image file from tarball
    readImageFileFromTarball(file, type) {
        return this.reader.readBlobFile(file, type).then(function (data) {
            return readFileAsDataURL(data, 0, data.size);
        });
    }
    //Get project metadata
    getMetadata() {
        return Promise.resolve({
            "name": this.options.file.name,
            "description": "",
            "specie": this.options.specie
        });
    }
    //Get genes list
    getGenes() {
        return this.readJSONFileFromTarball("genes.json");
    }
    //Get gene stats
    getStats() {
        return this.readJSONFileFromTarball("stats.json");
    }
    //Get coverage thumbnail of gene
    getCoverageThumbnail(name) {
        return this.readImageFileFromTarball(`images/${name}.png`, "png");
    }
    //Get coverage data
    getCoverageData(name) {
        return this.readJSONFileFromTarball(`coverages/${name}.json`);
    }
    //Get background data
    getBackgroundData(name) {
        return this.readJSONFileFromTarball(`background/${name}.json`);
    }
    //Get rois from the provided gene
    getRois(name) {
        return this.readJSONFileFromTarball(`rois/${name}.json`);
    }
}



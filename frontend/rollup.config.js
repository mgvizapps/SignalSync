let fs = require("fs");
let path = require("path");
//let {terser} = require("rollup-plugin-terser");
//let cleanup = require("rollup-plugin-cleanup");
//let {babel} = require("@rollup/plugin-babel");
let alias = require("@rollup/plugin-alias");
let {nodeResolve} = require("@rollup/plugin-node-resolve");

//Get workers files
let getWorkersFiles = function () {
    let packagesFolder = path.join(__dirname, "packages");
    return fs.readdirSync(packagesFolder, "utf8").reduce(function (files, name) {
        let folder = path.join(packagesFolder, name);
        //First check if this is a folder
        if (fs.lstatSync(folder).isDirectory() === false) {
            return files; //Nothing to do
        }
        //Check if the workers folder exists
        let workersFolder = path.join(folder, "workers");
        if (fs.existsSync(workersFolder) === false || fs.lstatSync(folder).isDirectory() === false) {
            return files; //Nothing to do
        }
        //Read all files
        fs.readdirSync(workersFolder, "utf8").forEach(function (file) {
            if (path.extname(file) === ".js") {
                files.push(path.join(workersFolder, file));
            }
        });
        //Continue
        return files;
    }, []);
};

//Create the lib configuration
module.exports = getWorkersFiles().map(function (inputFile) {
    //Initialize the configuration object
    let config = {
        "input": inputFile,
        "output": {
            "format": "umd",
            "file": path.join("public", "workers", path.basename(inputFile)),
        },
        "plugins": [
            alias({
                "entries": {
                    "common": path.join(__dirname, "packages", "common")
                }
            }),
            nodeResolve()
            //babel({"exclude": "node_modules/**"})
        ]
    };
    //Return the configutation
    return config;
});


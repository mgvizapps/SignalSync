import {readFileAsArrayBuffer} from "./file.js";

//Read file name from buffer
let readFileNameFromBuffer = function (buffer, offset) {
    let items = new Uint8Array(buffer, offset + 0, 100);
    let i = 0, str = "";
    //Read the array while the item is not an 0
    while (i < items.length && items[i] !== 0) {
        str = str + String.fromCharCode(items[i]);
        i = i + 1;
    }
    return str;
};

//Read file type from buffer
let readFileTypeFromBuffer = function (buffer, offset) {
    let items = new Uint8Array(buffer, offset + 156, 1);
    let type = String.fromCharCode(items[0]); //Get type code
    return (type === "0") ? "file" : ((type === "5") ? "directory" : type);
};

//Read the file size from buffer
let readFileSizeFromBuffer = function (buffer, offset) {
    let items = new Uint8Array(buffer, offset + 124, 12);
    let str = ""; //Output size
    for (let i = 0; i < 11; i++) {
        str = str + String.fromCharCode(items[i]);
    }
    //Return parsed size
    return parseInt(str, 8);
};

//Export tallbar reader
export class TarballReader {
    constructor(file) {
        this.file = file; //Save tarball reference file
        this.info = {}; //List of files of the tarball
    }
    //Read tarball --> generate list of available files
    read() {
        let self = this;
        let file = this.file; //Get file reference
        //let totalSite = this.file.size; //Get total file size
        return new Promise(function (resolve, reject) {
            let readFileInfo = function (offset) {
                //Check for end of file
                if (offset >= file.size - 512) {
                    return resolve(self.info);
                }
                //Read chunk file
                return readFileAsArrayBuffer(file, offset, 512).then(function (buffer) {
                    //let buffer = event.target.result; //Get buffer
                    let filename = readFileNameFromBuffer(buffer, 0); //Read filename
                    //Check for empty filename --> no empty buffer
                    if (filename.length === 0) {
                        return resolve(self.info);
                    }
                    //Register the file info
                    let filesize = readFileSizeFromBuffer(buffer, 0);
                    self.info[filename] = {
                        "name": filename,
                        "size": filesize,
                        "type": readFileTypeFromBuffer(buffer, 0),
                        "offset": offset
                    };
                    //Continue with the next file
                    offset = offset + (512 + 512 * Math.trunc(filesize / 512));
                    if (filesize % 512) {
                        offset = offset + 512;
                    }
                    //Continue with the next file
                    return readFileInfo(offset);
                });
            };
            //Start reading file
            readFileInfo(0);
        });
    }
    //Check if the provided file path is available
    exists(name) {
        return typeof this.info[name] !== "undefined";
    }
    //Check if the provided path is a file
    isFile(name) {
        return this.exists(name) && this.info[name].type === "file";
    }
    //Check if the provided path is a directory
    isDirectory(name) {
        return this.exists(name) && this.info[name].type === "directory";
    }
    //Read text file
    readTextFile(name) {
        let file = this.file;
        let info = this.info[name]; //Get file info
        //Check for no file with this path --> reject
        //if (self.exists(name) === false) {
        //    return reject(new Error(`File '${name}' not in tar`));
        //}
        //Read the file content
        return readFileAsArrayBuffer(file, info.offset + 512, info.size).then(function (buffer) {
            let items = new Uint8Array(buffer); //Get Uint8Array from buffer
            let data = ""; //Output string
            for(let i = 0; i < info.size; i++) {
                data = data + String.fromCharCode(items[i]);
            }
            //Resolve with the file content
            return data;
        });
    }
    //Read file as blob
    readBlobFile(name, type) {
        let file = this.file; //Get file
        let info = this.info[name]; //Get file info
        return readFileAsArrayBuffer(file, info.offset + 512, info.size).then(function (buffer) {
            let items = new Uint8Array(buffer); //Get Uint8Array from buffer
            return new Blob([items], {"type": type});
        });
    }
}



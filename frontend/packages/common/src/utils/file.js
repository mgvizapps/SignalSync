let chunkSize = 1024 * 10; //Default chunksize
let delimiter = "\n"; //.charCodeAt(0); //Delimiter
//let linesPattern = /\r\n|\n|\r/;

//Read a text file line by line
//Inspired in https://stackoverflow.com/questions/24647563/reading-line-by-line-file-in-javascript-on-client-side
export function readTextFileByLine (file, offset, size, callback) {
    let total = Math.ceil(size / chunkSize); //Number of chunks
    let chunkContent = ""; //content not parsed
    let chunkStart = 0; //Chunk start position
    //let chunkEnd = 0; //Chunk end position
    return new Promise(function (resolve, reject) {
        let parseChunk = function (index) {
            //Check if all chunks has been processed
            if (index >= total) {
                //Check for chunk content not processed
                if (chunkContent.length > 0) {
                    callback(chunkContent, chunkStart, chunkStart + chunkContent.length);
                }
                return resolve();
            }
            //Get next chunk start position
            let start = offset + index * chunkSize;
            let end = Math.min(start + chunkSize, offset + size);
            //Read the chunk
            let chunkReader = new FileReader();
            chunkReader.addEventListener("load", function (event) {
                chunkContent = chunkContent + event.target.result; //Update chunk content
                //chunkEnd = chunkEnd + event.target.result.length; //Update chunk end position
                let delimiterIndex = chunkContent.indexOf(delimiter); //Get new line index
                while (delimiterIndex > -1) {
                    let line = chunkContent.slice(0, delimiterIndex); //Get line content
                    callback(line, chunkStart, chunkStart + line.length); //Process line
                    chunkContent = chunkContent.slice(delimiterIndex + 1); //Update chunk content
                    chunkStart = chunkStart + line.length + 1; //Update chunk start position
                    delimiterIndex = chunkContent.indexOf(delimiter); //New delimiter
                }
                //Continue with the next chunk
                return parseChunk(index + 1);
            });
            //Read the chunk
            return chunkReader.readAsText(file.slice(start, end), "utf8");
        };
        //Start parsing chunk
        return parseChunk(0);
    });
}

//Default file reader
let readFile = function (file, offset, size, method) {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader();
        //Register load listener
        reader.addEventListener("load", function (event) {
            return resolve(event.target.result);
        });
        //Register error listener
        reader.addEventListener("error", function () {
            return reject(new Error("Error reading file"));
        });
        //Read buffer
        return reader[method](file.slice(offset, offset + size));
    });
};

//Read text file
export function readFileAsText (file, offset, size) {
    return readFile(file, offset, size, "readAsText");
}

//Read file as data-url
export function readFileAsDataURL (file, offset, size) {
    return readFile(file, offset, size, "readAsDataURL");
}

//Read array buffer
export function readFileAsArrayBuffer (file, offset, size) {
    return readFile(file, offset, size, "readAsArrayBuffer");
}

//Download a file
export function downloadFile (name, content, type) {
    let url = `data:${type};charset=utf-8,${encodeURIComponent(content)}`;
    let link = document.createElement("a");
    link.setAttribute("download", name);
    link.setAttribute("href", url);
    return link.click();
}


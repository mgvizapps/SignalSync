import {downloadFile} from "./file.js";
import {createStrElement as h} from "./dom.js";

//Word namespaces
let wordXMLNamespaces = {
    "xmlns:o": "urn:schemas-microsoft-com:office:office",
    "xmlns:w": "urn:schemas-microsoft-com:office:word",
    "xmlns": "http://www.w3.org/TR/REC-html40"
};

//Word table attributes
let wordTableAttributes = {
    "border": "1",
    "width": "100%",
    "style": "border-collapse:collapse;"
};

//Generate a word file
export function generateWord (title, content) {
    //Build word header attributes
    let headerAttributes = Object.keys(wordXMLNamespaces).map(function (key) {
        return `${key}='${wordXMLNamespaces[key]}'`;
    });
    //Output word file content
    let file = [];
    file.push("<!DOCTYPE html>");
    file.push(`<html ${headerAttributes.join(" ")}>`);
    file.push("<head>");
    file.push("<meta charset='utf-8'>");
    file.push(`<title>${title}</title>`);
    file.push("</head>");
    file.push("<body>");
    file.push(content);
    file.push("</body>");
    file.push("</html>");
    return file.join("");
}

//Writable word class
export class WritableWord {
    constructor(options) {
        this.options = options;
        this.content = []; //Word content
    }
    //Generate the word
    generate() {
        return generateWord(this.options.title, this.content.join(""));
    }
    //Download the word file
    download(name) {
        return downloadFile(name, this.generate(), "application/vnd.ms-word");
    }
    //Add a heading to the word
    addHeading(type, content) {
        this.content.push(`<h${type}>${content}</h${type}>`);
    }
    //Add an image to the word
    addImage(src) {
        this.content.push(`<div align="center"><img src="${src}" /></div>`);
    }
    //Add a new table to the word
   	addTable(header, body) {
    	let table = []; //Table content
        table.push("<table border=\"1\" width=\"100%\" style=\"border-collapse:collapse;\">");
        //table.push("<table border=\"1\" width=\"100%\">");
        //Add table header
        if (header.length > 0) {
            table.push("<thead><tr><th>" + header.join("</th><th>") + "</th></tr></thead>");
        }
        table.push("<tbody>");
        body.forEach(function (row) {
            table.push("<tr><td>" + row.join("</td><td>") + "</td></tr>");
        });
        table.push("</tbody>");
        table.push("</table>");
        //Save the table
        this.content.push(table.join(""));
    }
    //Add image gallery
    addImagesGallery(maxColumns, imagesList) {
        let columns = Math.ceil(imagesList.length / maxColumns) * maxColumns; //Get number of columns
        let table = [];
        table.push("<table border=\"1\" width=\"100%\" style=\"border-collapse:collapse;\">");
        for (let i = 0; i < columns; i++) {
        	let columnIndex = i % maxColumns; //Get column index
        	if (columnIndex === 0) {
            	table.push("<tr>");
            }
            //Add the column and check for image
           	table.push("<td>");
            if (i < imagesList.length) {
                let img = imagesList[i]; //Get image
                table.push(`<strong>${img.title}</strong>`);
                table.push(`<div align="center"><img src="${img.src}" /></div>`);
                //table.push(`<div align="center"><img width="${(img.width || "")}" src="${img.src}" /></div>`);
            }
            table.push("</td>");
            if (columnIndex === maxColumns - 1) {
            	table.push("</tr>");
            }
        }
        table.push("</table>");
        //Save the gallery
        this.content.push(table.join(""));
    }
    //Add a new paragraph
    addParagraph(content) {
        return this.content.push(`<p>${content}</p>`);
    }
    //Insert a new line break
    addLineBreak() {
        return this.content.push("<br />");
    }
}

//Create a new writable word
export function createWritableWord (options) {
    return new WritableWord(options);
}



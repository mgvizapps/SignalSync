import kofi from "kofi";

//Biomart default options
let defaultOptions = {
    "dataset": "hsapiens_gene_ensembl",
    "host": "http://uswest.ensembl.org/biomart",
    "proxy": "https://cors-anywhere.herokuapp.com/"
};

//Biomart template urls
let templateUrls = {
    "default": "{{proxy}}{{host}}/martservice?query={{query}}"
};

//Build XML query object
let buildXMLQuery = function (options) {
    let lines = [];
    lines.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    lines.push("<!DOCTYPE Query>");
    lines.push("<Query virtualSchemaName=\"default\" formatter=\"CSV\" header=\"0\" uniqueRows=\"0\" count=\"\" datasetConfigVersion=\"0.6\">");
    lines.push(`<Dataset name="${options.dataset}" interface="default">`);
    Object.keys(options.filters).forEach(function (key) {
        lines.push(`<Filter name="${key}" value="${options.filters[key]}"/>`);
    });
    options.attributes.forEach(function (name) {
        lines.push(`<Attribute name="${name}" />`);
    });
    lines.push("</Dataset>");
    lines.push("</Query>");
    console.log(lines);
    return lines.join("");
};

//Parse response
let parseResponse = function (content, columns) {
    return content.replace(/\r/g, "").split("\n").filter(function (line) {
        return line.trim().length > 0; //Remove empty lines
    }).map(function (line) {
        let item = {}; //Output object with the mappings attribute-value
        line.trim().split(",").forEach(function (value, index) {
            item[columns[index]] = value; //Save value
        }); 
        return item;
    });
};

//Export biomart client
export class BiomartClient {
    constructor(options) {
        this.options = Object.assign({}, defaultOptions, options);
    }
    //Get data from biomart
    get(query) {
        let requestUrl = kofi.format(templateUrls.default, {
            "host": this.options.host,
            "proxy": this.options.proxy,
            "query": buildXMLQuery(query)
        });
        console.log(requestUrl);
        return kofi.request({
            "url": requestUrl,
            "headers": {
                "X-Requested-With": "XMLHttpRequest" 
            },
            "method": "get"
        }).then(function (response) {
            return parseResponse(response.body, query.attributes);
        });
    }
}


import kofi from "kofi";

//Default cellbase options
export const defaultCellBaseOptions = {
    "specie": "hsapiens",
    "assembly": "grch37",
    "version": "v4",
    //"host": "https://bioinfo.hpc.cam.ac.uk/cellbase"
    "host": "https://mgviz-gdbase.herokuapp.com/cellbase"
};

//Template urls
let cellBaseTemplateUrls = {
    "variantInfo": "{{host}}/webservices/rest/{{version}}/{{specie}}/feature/variation/{{query}}/info?assembly={{assembly}}",
    "variantsRegion": "{{host}}/webservices/rest/{{version}}/{{specie}}/genomic/region/{{query}}/variation?assembly={{assembly}}&exclude=annotation.consequenceTypes",
    "geneInfo": "",
    "genesRegion": "{{host}}/webservices/rest/{{version}}/{{specie}}/genomic/region/{{query}}/gene?assembly={{assembly}}",
    "sequence": "{{host}}/webservices/rest/{{version}}/{{specie}}/genomic/region/{{query}}/sequence?assembly={{assembly}}"
};

//Parse a variant result object
let parseVariantResult = function (data) {
    let newData = {
        "id": data.id,
        "chromosome": data.chromosome,
        "start": data.start,
        "end": data.end,
        "strand": data.strand,
        "reference": data.reference,
        "alternative": data.alternative,
        "frequency": 0 //data.annotation.minorAlleleFreq
    };
    //Check for no frequency field
    if (typeof data.annotation.minorAlleleFreq === "undefined") {
        let frequencies = data.annotation.populationFrequencies; //Get frequencies list
        if (frequencies !== null && Array.isArray(frequencies) === true) {
            frequencies.forEach(function (item) {
                if (item.study !== "1kG_phase3" || item.population !== "ALL") {
                    return null; //This is not the study to extract the frequency
                }
                if (typeof item.refAlleleFreq === "undefined") {
                    return null; //No value to process
                }
                //Save the parsed frequency
                newData.frequency = Number(item.refAlleleFreq);
            });
        }
    }
    else {
        //Save frequency value
        newData.frequency = Number(data.annotation.minorAlleleFreq);
    }
    //Return parsed data
    return newData;
};

//Parse a gene result object
let parseGeneResult = function (gene) {
    let outputList = [];
    //Parse all transcripts
    gene.transcripts.forEach(function (transcript) {
        transcript.exons.forEach(function (exon) {
            outputList.push({
                "id": `${gene.id}-${transcript.id}-${exon.exonNumber}-${exon.id}`,
                "chr": exon.chromosome,
                "start": exon.start,
                "end": exon.end,
                "strand": exon.strand,
                "codingStart": exon.genomicCodingStart,
                "codingEnd": exon.genomicCodingEnd
            });
        });
    });
    return null;
};

//Convert a value to array
let toArray = function (value) {
    return Array.isArray(value) ? value : [value];
};

//Export cellbase client
export class CellBaseClient {
    constructor(options) {
        this.options = Object.assign({}, defaultCellBaseOptions, options);
    }
    //Fetch data
    fetchData(type, query, parser) {
        //Generate the request template url
        let templateUrl = cellBaseTemplateUrls[type];
        let url = kofi.format(templateUrl, Object.assign({}, this.options, {
            "query": toArray(query).join(",")
        }));
        console.log(`Fetching data from '${url}'`);
        //Import data
        let options = {
            "url": url,
            "headers": {
                "X-Requested-With": "XMLHttpRequest" 
            },
            "method": "get",
            "json": true
        };
        return kofi.request(options).then(function (response) {
            //Parse the body response and call the callback function
            return parser(response.body);
        });
    }
    //Get sequence from a region
    getSequence(query) {
        return this.fetchData("sequence", query, function (body) {
            return body.response.map(function (response) {
                return response.result[0].sequence;
            });
        });
    }
    //Get a list of variants from a region
    getVariants(query) {
        return this.fetchData("variantsRegion", query, function (body) {
            return body.response.map(function (response) {
                return response.result.map(parseVariantResult);
            });
        });
    }
    //Get a list of genes from a region
    getGenes(query) {
         return this.fetchData("genesRegion", query, function (body) {
            return body.response.map(function (response) {
                return response.result.map(function (gene) {
                    delete gene["transcripts"];
                    delete gene["annotation"];
                    return gene;
                });
            });
        });
    }
    //Get a gene info
    getGeneInfo(query) {
        //TODO
        //return callback(null, {});
    }
    //Get a variant info
    getVariantInfo(query) {
        return this.fetchData("variantInfo", query, function (body) {
            return body.response.map(function (response) {
                return parseVariantResult(response.result[0]);
            });
        });
    }
}


import kofi from "kofi";

//Basic attributes of the query to get transcrip info
let basicAttributes = [
    "external_gene_name",
    "ensembl_gene_id",
    "ensembl_transcript_id",
    "chromosome_name",
    "start_position",
    "end_position",
    "strand",
    "ensembl_exon_id",
    "exon_chrom_start",
    "exon_chrom_end",
    "rank"
];

//External attributes of the query to get transcript extra info
let extraAttributes = [
    "ensembl_gene_id",
    "ensembl_transcript_id",
    "transcript_biotype",
    "transcript_gencode_basic",
    "refseq_mrna"
];

//Get transcripts data
export function getTranscripts (client, geneName) {
    let regions = []; //To store regions data
    let query = {
        "filters": {
            "external_gene_name": geneName
        },
        "dataset": "hsapiens_gene_ensembl"
    };
    return kofi.delay(0).then(function () {
        return client.get(Object.assign({}, query, {
            "attributes": basicAttributes
        }));
    }).then(function (data) {
        if (data.length === 0) {
            // No region sfound for this gene --> return error
            return Promise.reject({
                "error": new Error("Gene not found")
            });
        }
        //Parse regions
        regions = data.map(function (region) {
            return Object.assign(region, {
                "strand": (region["strand"] === "-1") ? "-1" : "+1",
                "start_position": parseInt(region["start_position"]),
                "end_position": parseInt(region["end_position"]),
                "exon_chrom_start": parseInt(region["exon_chrom_start"]),
                "exon_chrom_end": parseInt(region["exon_chrom_end"])
            });
        });
        //Import external transcript info
        return client.get(Object.assign({}, query, {
            "attributes": extraAttributes
        }));
    }).then(function (data) {
        //Generate an object with the meta information for each transcript
        let meta = {};
        data.forEach(function (item) {
            meta[item["ensembl_transcript_id"]] = {
                "biotype": item["transcript_biotype"],
                "gencode": item["transcript_gencode_basic"].length > 0,
                "refseq": item["refseq_mrna"]
            };
        });
        //Merge with the regions object
        return regions.map(function (item) {
            let transcript = item["ensembl_transcript_id"];
            return Object.assign(item, meta[transcript]);
        });
    });
}

//Generate the metatranscript
export function buildMetaTranscript (regions, wanted) {
    //let wanted = {}; //Wanted transcripts list
    //wantedList.forEach(function (id) {
    //    wanted[id] = true;
    //});
    //Filter the regions and only get exons of the wanted transcripts
    let filteredRegions = regions.filter(function (region) {
        let id = region["ensembl_transcript_id"];
        return typeof wanted[id] !== "undefined";
    });
    //Sort the regions by start position
    filteredRegions.sort(function (a, b) {
        return a["exon_chrom_start"] - b["exon_chrom_start"];
    });
    let meta = []; //Metatranscript object
    filteredRegions.forEach(function (region) {
        //Check for no regions added to the metatranscript or region not collapsing
        let index = meta.length - 1;
        if (meta.length === 0 || meta[index].end < region["exon_chrom_start"]) {
            meta.push({
                "start": region["exon_chrom_start"],
                "end": region["exon_chrom_start"],
                "exons": []
            });
            index = meta.length - 1; //Update last index
        }
        //Add this region to the list of exons
        meta[index].exons.push({
            "transcript": region["ensembl_transcript_id"],
            "exon": region["ensembl_exon_id"],
            "rank": region["rank"],
            "start": region["exon_chrom_start"], //Save exon start
            "end": region["exon_chrom_end"] //Save exon end
        });
        //Update meta region positions
        meta[index]["start"] = Math.min(meta[index]["start"], region["exon_chrom_start"]);
        meta[index]["end"] = Math.max(meta[index]["end"], region["exon_chrom_end"]);
    });
    //Return the metatranscript
    return meta.map(function (item) {
        return Object.assign(item, {
            "exons": item.exons.map(function (exon) {
                return Object.assign(exon, {
                    "id": `${exon.transcript}-${exon.exon}-${exon.rank}`
                });
            })
        });
    });
}

//Get a list of transcripts
export function listTranscripts (regions) {
    let transcripts = {};
    regions.forEach(function (region) {
        transcripts[region["ensembl_transcript_id"]] = true;
    });
    //Return only transcripts names
    return Object.keys(transcripts);
}


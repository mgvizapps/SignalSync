import {getKaryotypeImage} from "common/src/tracks/Karyotype/index.js";
import {getChromosomeImage} from "common/src/tracks/Chromosome/index.js";
import {getImageSize, resizeImage} from "common/src/utils/image.js";
import {createWritableWord} from "common/src/utils/word.js";
import {defaultColors} from "common/src/colors.js";
import {getBoxplotImage} from "./components/Boxplot/index.js";
import {getCNVStateName} from "./utils/cnv.js";

//Placeholder text (lorem ipsum)
let placeholderText = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
].join(" ");

//Global values
let evidencesImagesWidth = 280;

//Generate CNVs regions table
let generateCNVRegionsTable = function (word, client, data) {
    let regionsColumns = ["Genes", "Region", "Size", "Change"];
    let regionsData = data.regions.map(function (region) {
        return [
            region.genes.join(", "),
            region.displayCytobands,
            region.displaySize,
            getCNVStateName(region.state)
        ];
    });
    //console.log(data.regions);
    //console.log(regionsData);
    return word.addTable(regionsColumns, regionsData);
};

//Generate CNVEvidences
let generateReportAppendixEvidences = function (word, client, data) {
    word.addHeading("3", "CNV Evidences"); //Add evidences heading
    return new Promise(function (resolve, deject) {
        let generateCNVEvidence = function (index) {
            //Check for no more regions to add --> resolve with the word
            if (index >= data.regions.length) {
                return resolve(word);
            }
            //Get the region to generate the evidence section
            let region = data.regions[index];
            let genesImagesList = []; //Output genes images
            word.addLineBreak(); //Add separation for evidence
            word.addHeading("4", `${region.chromosome}: ${region.displayGenes} (${getCNVStateName(region.state)})`);
            //Get images for the genes on this region
            let generateGeneCoverageImage = function (geneIndex) {
                if (geneIndex >= region.genes.length) {
                    word.addImagesGallery(3, genesImagesList); //Generate gallery
                    word.addLineBreak(); //Add separation for gallery
                    return generateCNVEvidence(index + 1); //Continue with the next evidence region
                }
                //Get the gene to generate the coverage thumbnail
                let gene = region.genes[geneIndex];
                let geneImage = null; //gene image
                return client.getCoverageThumbnail(gene).then(function (image) {
                    geneImage = image; //Save the image
                    //Get the size of this image
                    return getImageSize(geneImage);
                }).then(function (size) {
                    //console.log(size);
                    //Resize the image before adding to the list of images
                    let scale = evidencesImagesWidth / size.width; //Resize scale
                    return resizeImage(geneImage, size.width * scale, size.height * scale);
                }).then(function (resizedImage) {
                    //Save the image with the gene title and continue with the next gene
                    genesImagesList.push({
                        //"width": evidencesImagesWidth + "px",
                        "src": resizedImage, 
                        "title": gene
                    });
                    return generateGeneCoverageImage(geneIndex + 1);
                });
            };
            //First generate the chromosome image
            Promise.resolve(null).then(function () {
                let chromosomeIndex = data.chromosomesIndex[region.chromosome]; //Get chromosome index
                return getChromosomeImage({
                    "currentChromosome": data.chromosomes[chromosomeIndex],
                    "cytobands": data.cytobands,
                    "regions": data.genes.filter(function (gene) {
                        return gene.chromosome === region.chromosome;
                    }),
                    "highlights": [
                        {"start": region.start, "end": region.end, "displayColor": defaultColors.orange} 
                    ],
                    "width": 850,
                    "height": 120
                });
            }).then(function (chromosomeImage) {
                word.addImage(chromosomeImage);
                word.addLineBreak(); //Add separation for evidence
                //Start generating coverages images
                return generateGeneCoverageImage(0);
            });
        };
        //Start with the first region
        return generateCNVEvidence(0);
    });
};

//Generate report appendix
let generateReportAppendix = function (word, client, data) {
    word.addLineBreak(); //Add separation for appendix section
    word.addLineBreak(); //Add separation for appendix section
    word.addHeading("2", "Appendix");
    //word.addParagraph("This is the karyotype with the distribution of the genes in the chromosomes");
    return Promise.resolve(null).then(function () {
        //First generate and insert karyotype image
        return getKaryotypeImage({
            "width": 850,
            "height": 100,
            "chromosomes": data.chromosomes,
            "cytobands": data.cytobands,
            "regions": data.genes
        });
    }).then(function (karyotypeImage) {
        word.addImage(karyotypeImage); //Insert karyotype image
        //Generate and insert the boxplot image
        return getBoxplotImage({
            "width": 850,
            "height": 120,
            "genes": data.genes,
            "thresholds": data.thresholds
        });
    }).then(function (boxplotImage) {
        word.addLineBreak(); //Add separation for boxplot
        word.addImage(boxplotImage); //Insert boxplot image
        //Generate table with all genes --> get non neutral state
        let displayGenes = data.genes.filter(function (gene) {
            return gene.annotation.state !== "neutral";
        });
        //console.log(displayGenes);
        let genesColumns = ["Chr", "Cytoband", "Symbol", "Description", "Change"];
        let genesRows = displayGenes.map(function (gene) {
            return [gene.chromosome, gene.cytoband, gene.name, "", getCNVStateName(gene.annotation.state)];
        });
        word.addLineBreak(); //Add separation for table
        //word.addLineBreak(); //Add separation for table
        word.addParagraph("List with all genes with a CNV change (amplification or deletion)");
        word.addTable(genesColumns, genesRows);
        word.addLineBreak(); //Add separation for table
        word.addLineBreak(); //Add separation for table
        //Generate CNV evidences
        return generateReportAppendixEvidences(word, client, data);
    });
};

//Generate the report
export function generateReport (client, data) {
    let word = createWritableWord({"title": "CNV Report"}); //Word wrapper
    word.addHeading("1", "CNVs Technical Report");
    word.addHeading("2", "Case information");
    word.addTable([], [["Date", ""], ["Case ID", ""], ["Sex", ""], ["Pathology", ""]]);
    word.addHeading("2", "Description");
    word.addParagraph(data.annotation.description || placeholderText);
    word.addHeading("2", "Results");
    word.addHeading("3", "CNVs regions");
    word.addParagraph("CNVs detected in the following genes:");
    generateCNVRegionsTable(word, client, data);
    word.addHeading("3", "Interpretation");
    word.addParagraph(placeholderText);
    word.addHeading("3", "Conclusion");
    word.addParagraph(placeholderText);
    word.addHeading("3", "Recommendation");
    word.addParagraph(placeholderText);
    //return new Promise(function (resolve, reject) {
    //    return null;
    //});
    return generateReportAppendix(word, client, data);
}



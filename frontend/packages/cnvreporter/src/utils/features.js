//Sort features
export function sortFeatures (features, chromosomes) {
    let chromosomesMap = {};
    let maxChromosomeLength = 0;
    //Map each chromosome to its index
    chromosomes.forEach(function (chr, index) {
        chromosomesMap[chr.name.replace("chr", "")] = index;
        maxChromosomeLength = Math.max(maxChromosomeLength, chr.length);
    });
    //Add a internal value to each feature with its start position
    features = features.map(function (feature) {
        let index = chromosomesMap[feature.chromosome.replace("chr", "")];
        return Object.assign(feature, {
            "_index": (maxChromosomeLength * index) + feature.start
        });
    });
    //Sort the features by the internal value added
    features.sort(function (a, b) {
        return a["_index"] - b["_index"];
    });
    //Return the sorted features
    return features.map(function (feature) {
        delete feature["_index"]; //Remove index field
        return feature;
    });
};

//Filter features by chromosome
export function filterFeaturesByChromosome (features, chromosome) {
    return features.filter(function (feature) {
        return feature.chromosome.replace("chr", "") === chromosome;
    });
}



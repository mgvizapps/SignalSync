//Calculate max coverage values
export function getMaxCoverageValues (points) {
    let values = {
        "germline":points[0].coverage_tumor,
        "tumor": points[0].coverage_germline,
        "diff": Math.abs(points[0].coverage_diff)
    };
    //Check all values
    for (let i = 1; i < points.length; i++) {
        values.germline = Math.max(values.germline, points[i].coverage_germline);
        values.tumor = Math.max(values.tumor, points[i].coverage_tumor);
        values.diff = Math.max(values.diff, Math.abs(points[i].coverage_diff));
    }
    //Return the max plots values
    return values;
}



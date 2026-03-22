/** Removes comma and turns string into a number. If num cannot be converted into a number without comma, leave num unchanged
 * 
 * @param {String} num- String to turn into num 
 * 
 * @returns - Number or the num paramter unchanged
 */
function removeCommaFromNum(num) {
    if (!num) {
        return null;
    }
    let convertedNum = Number(num.replace(/,/g, ""));
    if (!convertedNum && isNaN(convertedNum)) {
        return num;
    }
    return convertedNum;
}
/** Calculates engagement into percentage rounded to 2 decimal place
 * 
 * @param {Number} hits - Number of hits
 * @param {Number} kudo - Number of kudos
 * 
 * @returns {String} - Engagement percentage
 */
function calculateEngagement(kudo, hits) {
    return ((kudo/hits)*100).toFixed(2)+"%";
}
//consider missing data later or day changes
function metricPerDay(metrics, startStatKey, endStatKey) {
    for (let i = 0; i < metrics.length; i++) {
        if (i == 0) {
            metrics[i][endStatKey] = 0;
        } else {
            metrics[i][endStatKey] = metrics[i][startStatKey] - metrics[i-1][startStatKey];
        }
    }
}
let numberUtils = {
    removeCommaFromNum,
    calculateEngagement,
    metricPerDay
}
export default numberUtils;
import type { GraphMetric, Snapshot } from "../data/types";
/** Removes comma and turns string into a number. If num cannot be converted into a number without comma, leave num unchanged
 * 
 * @param {String} num- String to turn into num 
 * 
 * @returns - Number or the num paramter unchanged
 */
function removeCommaFromNum(num:string):number|string {
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
function calculateEngagement(kudo:number, hits:number):string {
    return ((kudo/hits)*100).toFixed(2)+"%";
}
//consider missing data later or day changes
function metricPerDay(metrics:GraphMetric[], startStatKey:string, endStatKey:string):void {
    for (let i = 0; i < metrics.length; i++) {
        if (i == 0) {
            metrics[i][endStatKey] = 0;
        } else {
            metrics[i][endStatKey] = metrics[i][startStatKey] - metrics[i-1][startStatKey];
        }
    }
}
function calculateHighestMetric(metrics:GraphMetric[], key: keyof GraphMetric): number {
    if (metrics.length == 0) {
        return null;
    } else {
        let highest;
        highest = metrics[0][key];
        for (let i = 1; i < metrics.length; i++) {
            if (metrics[i][key] && metrics[i][key] > highest) {
                highest = metrics[i][key];
            }
        }
        return highest;
    }
}
function findMaxOfGraphMetricProperty(list: GraphMetric[], property:string): number {
    if (list.length==0) {
        return null;
    }
    let highest = list[0];
    for (let i = 1; i < list.length; i++) {
        if (list[i][property]>highest[property]) {
            highest = list[i];
        }
    }
    return highest[property];
}
let numberUtils = {
    removeCommaFromNum,
    calculateEngagement,
    metricPerDay,
    findMaxOfGraphMetricProperty,
    calculateHighestMetric
}
export default numberUtils;
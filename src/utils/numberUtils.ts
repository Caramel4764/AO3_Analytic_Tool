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
/** Finds the current chapter from entire chapter string 6/?
 * 
 * @param chapterString - The chapter string from scraping ao3
 * @returns - The current chapter number
 */
function parseAO3Chapter(chapterString:string): number {
    let chapterInt = "";
    for (let i = 0; i < chapterString.length; i++) {
        if (chapterString[i]=='/') {
            //console.log(`ParsedChapter: ${Number(chapterInt)}`);
            return Number(chapterInt);
        }
        chapterInt+=chapterString[i];
    }
    return 0;
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

/**
 * 
 * @param timestamp1 First timestamp
 * @param timestamp2 Second timestamp
 * @returns {Number} Days Beween the timestmap
 */
function calcDaysInBetween(timestamp1:number, timestamp2:number): number {
    // Ignore hour so even if 24 hour not passed, can be new day
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

    const msDiff = Math.abs(utc1 - utc2);
    return Math.floor(msDiff)/(1000*60*60*24);
}
// Consider missing data later or day changes
function metricPerDay(metrics:GraphMetric[], startStatKey:string, endStatKey:string):void {
    for (let i = 0; i < metrics.length; i++) {
        if (i == 0) {
            metrics[i][endStatKey] = 0;
        } else {
            let daysElapsed = calcDaysInBetween(metrics[i]["timeStamps"], metrics[i-1]["timeStamps"]);
            if (daysElapsed == 0) {
                throw new Error("metricPerDay: Cannot divide by zero. Zero days have passed");
            }
            metrics[i][endStatKey] = Math.round((metrics[i][startStatKey] - metrics[i-1][startStatKey]) / daysElapsed);
            // console.log(`Days between ${metrics[i]["dates_converted"]} and ${metrics[i-1]["dates_converted"]} = ${calcDaysInBetween(metrics[i]["timeStamps"], metrics[i-1]["timeStamps"])}`);
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
    calculateHighestMetric,
    parseAO3Chapter
}
export default numberUtils;
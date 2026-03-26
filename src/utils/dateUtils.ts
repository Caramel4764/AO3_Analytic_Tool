import type { Snapshot } from "../data/types";
import indexDB from "../indexDB";

const millisecondPerDay = 1000*60*60*24;
/** Turns month int into month string. 1 = Jan. 12 = Dec
 * 
 * @param {Number} monthNum - month in number
 * 
 * @returns {String} - month in string with first 3 char
 */
function convertMonthToText(monthNum:number): string {
        switch(monthNum){
        case 1:
            return "Jan";
        case 2:
            return "Fed";
        case 3:
            return "Mar";
        case 4:
            return "Apr";
        case 5:
            return "May";
        case 6:
            return "Jun";
        case 7:
            return "Jul";
        case 8:
            return "Aug";
        case 9:
            return "Sept";
        case 10:
            return "Oct";
        case 11:
            return "Nov";
        case 12:
            return "Dec";
    }
}
/** Turns timestamp into human readable (mm-dd-yyyy) using ISO
 * 
 * @param {Number} timestamp - Date.now
 * 
 * @returns {String} - Human readable date (mm-dd-yyyy)
 */
function timeStampToReadable(timestamp:number):string {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    return date;
}
/** Converts millisecond from Date.now into month date (IE: Jan 2)
 * 
 * @param {Number} currTime - Current time
 * @param {Number} prevTime - Previous time
 * 
 * @returns {Boolean} - has a day passed
 */
function hasMillisecondPassed(currTime:number, prevTime:number, millisecondDiff:number): boolean {
    if (currTime - prevTime > millisecondDiff) {
        return true;
    }
    return false;
}
function isNewDate(snapshot:Snapshot):boolean {
    if(indexDB.doesSnapshotDateExist(snapshot)){
        return false;
    }
    return true;
}
let dateUtils = {
    timeStampToReadable,
    hasMillisecondPassed,
    isNewDate
}

export default dateUtils;
const millisecondPerDay = 1000*60*60*24;
/** Turns month int into month string. 1 = Jan. 12 = Dec
 * 
 * @param {Number} monthNum - month in number
 * 
 * @returns {String} - month in string with first 3 char
 */
function convertMonthToText(monthNum) {
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
/** Converts millisecond from Date.now into month date (IE: Jan 2)
 * 
 * @param {Number} monthNum - Date.now
 * 
 * @returns {String} - first 3 char of month and day
 */
function extractDayMonth(timestamp, includeYear = false) {
    /*let dateString;
    console.log("TEST: ", timestamp)
    const date = new Date(timestamp);
    const month = date.getMonth()+1
    const day = date.getDate();
    const monthText = convertMonthToText(month);
    dateString = monthText+" "+day
    if (includeYear) {
        const year = date.getFullYear();
        dateString+=", "+year;
    }
    return dateString;*/
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
function hasDayPassed(currTime, prevTime) {
    if (currTime - prevTime > millisecondPerDay) {
        return true;
    }
    return false;
}
let dateUtils = {
    extractDayMonth,
    hasDayPassed
}

export default dateUtils;
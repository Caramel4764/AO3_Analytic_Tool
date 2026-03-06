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

let numberUtils = {
    removeCommaFromNum
}
export default numberUtils;
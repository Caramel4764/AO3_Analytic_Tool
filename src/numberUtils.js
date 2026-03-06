function removeCommaFromNum(num) {
    if (!num) {
        return num;
    }
    return Number(num.replace(/,/g, ""));
}

let numberUtils = {
    removeCommaFromNum
}
export default numberUtils;
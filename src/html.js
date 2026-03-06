import workMetadata from "./workMetadata.js";
import workSnapshot from "./workSnapshot.js";
import queryData from "./queryData.js";

async function fetchHTML(weblink) {
    let weblinkNoWarning = weblink+"?view_adult=true";
    //?view_adult=true prevents warning page
    const res = await fetch(`http://localhost:3000/proxy?url=${encodeURIComponent(weblinkNoWarning)}`);
    if (!res.ok) {
        throw new Error(`HTTP error: website not extracted. Error code ${res.status}`);
    }
    const html = await res.text();
    console.log(`HasStats: ${html.includes("stats")}`);
    console.log(`HasKudos: ${html.includes("kudos")}`);
    console.log(`HTMLContentLength: ${html.length}`);
    return html;
}

function parseAO3Chapter(chapterString) {
    let chapterInt = "";
    for (let i = 0; i < chapterString.length; i++) {
        if (chapterString[i]=='/') {
            console.log(`important: ${chapterInt}`);
            return Number(chapterInt);
        }
        chapterInt+=chapterString[i];
    }
}
function removeCommaFromNum(num) {
    return Number(num.replace(/,/g, ""));
}
function updateMetaData() {
    //workMetadata.id = 
    //workMetadata.title = 
    //workMetadata.author = 
    //workMetadata.url = 
    workMetadata.published = queryData.stats.published;
}
function updateSnapshot() {
    let currDate = Date.now();
    workSnapshot.workId = workMetadata.workId;
    workSnapshot.snapshotId = workMetadata.workId+currDate
    workSnapshot.timeStamp = currDate;
    workSnapshot.lastUpdated = queryData.stats.updated;
    workSnapshot.chapterCount = removeCommaFromNum(queryData.stats.chapters);
    workSnapshot.kudos = removeCommaFromNum(queryData.stats.kudos);
    workSnapshot.hits = removeCommaFromNum(queryData.stats.hits);
    workSnapshot.commentCount = removeCommaFromNum(queryData.stats.commentCount);
    workSnapshot.bookmarks = removeCommaFromNum(queryData.stats.bookmarks);
}

function parseStat(HTMLContent) {
    const parser = new DOMParser();
    queryData.webpage = parser.parseFromString(HTMLContent, "text/html");
    let listOfDataLabel = queryData.webpage.querySelectorAll("dl.stats dt");
    let listOfDataValue = queryData.webpage.querySelectorAll("dl.stats dd");
    let dataObject={};
    for (let i = 0; i < listOfDataLabel.length; i++) {
        listOfDataLabel[i].textContent = (listOfDataLabel[i].textContent).toLowerCase();
        if (listOfDataLabel[i].textContent == "chapters:") {
            listOfDataValue[i].textContent = parseAO3Chapter(listOfDataValue[i].textContent);
        }
        dataObject[listOfDataLabel[i].textContent] = listOfDataValue[i].textContent;
    }
    queryData.stats = dataObject;
    updateSnapshot();
    console.log(queryData.stats);
}

const HTMLUtils = {
    fetchHTML,
    parseStat,
}
export default HTMLUtils;
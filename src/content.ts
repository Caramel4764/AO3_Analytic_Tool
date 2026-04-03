function getIdFromLink(link:string):number {
    const matchingUrlPart = link.match(/works\/(?<workId>\d+)/);
    const id = matchingUrlPart ? Number(matchingUrlPart.groups.workId): null;
    return id;
}
const HTMLParserUtil = {
    getIdFromLink
}
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
let numberUtils = {
    removeCommaFromNum,
    parseAO3Chapter
}
function timeStampToReadable(timestamp:number):string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
let dateUtils = {
  timeStampToReadable,
}


const Ao3WorkNavAction = document.querySelector(".work.navigation.actions");

if (Ao3WorkNavAction) {
  let trackBtn = document.createElement('li');
  trackBtn.textContent = "Track";
  trackBtn.innerHTML = `<a href="#">Track</a>`;
  trackBtn.querySelector('a').addEventListener('click', async(e)=>{
    e.preventDefault();

    let metadata = {
      workId: 0,
      timeStamp: 0,
      timeStampReadable: "",
      title: "",
      author: "",
      url: "",
      published: ""
    };
    let snapshot = {
      bookmarks: 0,
      chapters: 0,
      comments: 0,
      hits: 0,
      kudos: 0,
      snapshotId: "",
      timeStamp: 0,
      timeStampReadable: "",
      workId: 0
    };
    console.log("LINK:", window.location.href)
    metadata.url = window.location.href;
    metadata.workId = HTMLParserUtil.getIdFromLink(metadata.url);
    metadata.published = document.querySelector("dl.stats dd.status")?.textContent 
    ?? document.querySelector("dl.stats dd.published")?.textContent;
    metadata.author = document.querySelector("div.preface.group h3.byline.heading").textContent.trim();
    metadata.title = document.querySelector("div.preface.group h2.title.heading").textContent.trim();
    metadata.timeStamp = Date.now();
    metadata.timeStampReadable = dateUtils.timeStampToReadable(metadata.timeStamp);

    let listOfDataLabel = document.querySelectorAll("dl.stats dt");
    let listOfDataValue = document.querySelectorAll("dl.stats dd");
    for (let i = 0; i < listOfDataLabel.length; i++) {
        listOfDataLabel[i].textContent = (listOfDataLabel[i].textContent).toLowerCase().replace(":", "");
        if (listOfDataLabel[i].textContent == "chapters") {
            snapshot[listOfDataLabel[i].textContent] = numberUtils.parseAO3Chapter(listOfDataValue[i].textContent);
        } else {
            snapshot[listOfDataLabel[i].textContent] = numberUtils.removeCommaFromNum(listOfDataValue[i].textContent);
        }
    }
    snapshot.timeStamp = Date.now();
    snapshot.workId = metadata.workId;
    snapshot.snapshotId = snapshot.workId+"-"+Date.now();
    snapshot.timeStampReadable = new Date().toISOString();
    console.log('snap', snapshot);
    console.log('metada', metadata)

    chrome.runtime.sendMessage({
      type: "TRACK_WORK",
      metadata, 
      snapshot,
    });
  });
  Ao3WorkNavAction.appendChild(trackBtn);
}
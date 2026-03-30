//add track to ao3 page
import HTMLParserUtil from "./utils/HTMLParserUtil";
import Ao3WorkDom from "./Ao3WorkDom";
import numberUtils from "./utils/numberUtils";
import dateUtils from "./utils/dateUtils";
import type { Snapshot, Metadata, TrackWorkMsgData } from "./data/types";
const Ao3WorkNavAction = document.querySelector(".work.navigation.actions");


if (Ao3WorkNavAction) {
  let trackBtn = document.createElement('li');
  trackBtn.textContent = "Track";
  trackBtn.innerHTML = `<a href="#">Track</a>`;
  trackBtn.querySelector('a').addEventListener('click', async(e)=>{
    e.preventDefault();

    let metadata:Metadata = {
      workId: 0,
      timeStamp: 0,
      timeStampReadable: "",
      title: "",
      author: "",
      url: "",
      published: ""
    };
    let snapshot:Snapshot = {
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
    metadata.published = document.querySelector("dl.stats dd.status").textContent;
    metadata.author = document.querySelector("div.preface.group h3.byline.heading").textContent.trim();
    metadata.title = document.querySelector("div.preface.group h2.title.heading").textContent.trim();
    metadata.timeStamp = Date.now();
    metadata.timeStampReadable = dateUtils.timeStampToReadable(metadata.timeStamp);

    let listOfDataLabel = document.querySelectorAll("dl.stats dt");
    let listOfDataValue = document.querySelectorAll("dl.stats dd");
    for (let i = 0; i < listOfDataLabel.length; i++) {
        listOfDataLabel[i].textContent = (listOfDataLabel[i].textContent).toLowerCase().replace(":", "");
        if (listOfDataLabel[i].textContent == "chapters") {
            snapshot[listOfDataLabel[i].textContent] = Ao3WorkDom.parseAO3Chapter(listOfDataValue[i].textContent);
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
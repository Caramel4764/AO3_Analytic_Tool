import indexDB from "../indexDB"
import CWork from "./CWork";
let popupMainDiv = document.getElementById("popup_main_div");
let viewAllBtn = document.getElementById("view_all_btn");
let helpBtn = document.getElementById("help_btn");
let optionBtn = document.getElementById("option_btn");

viewAllBtn.addEventListener("click", function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});
helpBtn.addEventListener("click", function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("help.html") });
});
optionBtn.addEventListener('click', function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("option.html") });
})
async function init() {
  let allWork = await indexDB.getAllWork();
  for (let i = 0; i <allWork.length; i++) {
    let currWork = allWork[i];
    let snapshots = await indexDB.getAllSnapshotsFromWork(currWork.workId);
    let Work = new CWork(currWork, snapshots, popupMainDiv);
    Work.createElement();
  }
  await indexDB.removeAllSnapshotsByDate("2026-03-31");
  console.log('tried')
  //if no work
  if (allWork.length == 0) {
    let noMessage = document.createElement("div");
    noMessage.innerHTML=`
      <h3>No tracked Work Yet</h3>
    `
    popupMainDiv.appendChild(noMessage);
  }
}
init();

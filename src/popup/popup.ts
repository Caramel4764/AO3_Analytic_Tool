import indexDB from "../indexDB"
import CWork from "./CWork";
let popupMainDiv = document.getElementById("popup_main_div");
let viewAllBtn = document.getElementById("view_all_btn");
let allWork = await indexDB.getAllWork();
console.log("hi");

viewAllBtn.addEventListener("click", function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});

for (let i = 0; i <allWork.length; i++) {
  let currWork = allWork[i];
  let snapshots = await indexDB.getAllSnapshotsFromWork(currWork.workId);
  let Work = new CWork(currWork, snapshots, popupMainDiv);
  Work.createElement();
  
}
//import HTMLParserUtil from "./utils/HTMLParserUtil";
//import Ao3WorkDom from "./Ao3WorkDom";
import { snapshot } from "node:test";
import indexDB from "../indexDB";
import scraperController from "../scraperController";
let rootEle = document.getElementById("div_holding_multi_stats");

const linkInput = document.getElementById("link_input") as HTMLInputElement;
//const trackBtn = document.getElementById("track_btn");
const parseBtn = document.getElementById("parse_btn");
const params = new URLSearchParams(window.location.search);
const workID = Number(params.get("workId"));
//const workID = 123;
//let newAo3WorkDom;
async function getAllMetaData() {
    const allMetadata = await indexDB.getAllWork();
    console.log("%c All metadata: ", "color:purple;",allMetadata);
    return allMetadata;
}
/*
trackBtn.addEventListener('click', async function() {
    const res = await fetch('http://localhost:3000/testURL');
    const data = await res.json();
    let allMetadata = await getAllMetaData();
    let link;
    link = linkInput.value;
    //let workUrl = indexDB.findWork(workID);
    //link = workUrl;
    try {
        //timer tick down
        if (link) {
            scraperController.scrapeAndUpdate(link, rootEle);
        } else {
            scraperController.scrapeMultiWork(allMetadata, rootEle);
        }
        if (link) {
            scraperController.scrapeAndUpdate(link, rootEle);
        } else {
            scraperController.scrapeMultiWork(allMetadata, rootEle);
        }
    } catch(error) {
        console.error(error);
        alert("invalid link");
    }
});*/
//parseBtn.addEventListener('click', function() {
    //scraperController.displaySnapshot(workID);
//})
// look for indexDB and display if something is there


/*if (!isNoData && !isDBEmpty) {
    scraperController.displaySnapshot(workID);
}*/
//let isDBEmpty = await indexDB.isDBByWorkEmpty(workID);
async function getIsNoData() {
    return await indexDB.isDBEmpty();
}


async function init () {
    if (!(await getIsNoData())) {
        let allMetadata = await getAllMetaData();
        //specified work
        if (workID) {
            scraperController.displaySnapshot(workID, rootEle);
        } else {
            scraperController.displayAllWork(allMetadata, rootEle);
        }
    }
}
init();
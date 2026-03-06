import HTMLParserUtil from "./src/HTMLParserUtil.js";
import queryData from "./src/data/queryData.js";
import workMetadata from "./src/data/workMetadata.js";
import workSnapshot from "./src/data/workSnapshot.js";
import Ao3WorkDom from "./src/Ao3WorkDom.js";
const linkInput = document.getElementById("link_input");
const trackBtn = document.getElementById("track_btn");
const parseBtn = document.getElementById("parse_btn");
let newAo3WorkDom;

trackBtn.addEventListener('click', async function() {
    queryData.link = linkInput.value;
    try {
        //queryData.content = await HTMLParserUtil.fetchHTML(queryData.link);
        let HTMLString = await HTMLParserUtil.fetchHTML(queryData.link)
        queryData.content = HTMLString;
        let HTMLDom = HTMLParserUtil.stringHTMLToDom(HTMLString);
        newAo3WorkDom = new Ao3WorkDom(HTMLDom);
        //HTMLParserUtil.parseStat(queryData.content);
        //console.log(queryData.content);
    } catch(error) {
        console.error(error);
        alert("invalid link");
    }
});

parseBtn.addEventListener('click', function() {
    newAo3WorkDom.getKudos();
    //console.log(queryData.stats);
})
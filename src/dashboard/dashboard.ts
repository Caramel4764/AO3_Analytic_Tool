import indexDB from "../indexDB";
import frontend from "../frontend";

let rootEle = document.getElementById("div_holding_multi_stats");
const params = new URLSearchParams(window.location.search);
const workID = Number(params.get("workId"));
async function getAllMetaData() {
    const allMetadata = await indexDB.getAllWork();
    console.log("%c All metadata: ", "color:purple;",allMetadata);
    return allMetadata;
}

async function getIsNoData() {
    return await indexDB.isDBEmpty();
}


async function init () {
    if (!(await getIsNoData())) {
        let allMetadata = await getAllMetaData();
        //specified work
        if (workID) {
            frontend.generateHTMLStatsFromWork(workID, rootEle);
        } else {
            frontend.generateHTMLStatsFromMultiWork(allMetadata, rootEle);
        }
    }
}
init();
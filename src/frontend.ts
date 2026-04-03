import indexDB from "./indexDB";
import type { Metadata, Snapshot } from "./data/types";
import CAnalytic from "./CAnalytic";
let allCAnalytic = new Map<number, CAnalytic>();


/** Generates HTML for the frontend. Display snapshot as graph and stats.
 * 
 * @param workId - Work to graph
 * @param statDivHolder - Div which the graphs will be appended to
 * 
 * @returns - IsSuccessful
 */
async function generateHTMLStatsFromWork(workId, statDivHolder): Promise<boolean> {
    let allSnapshots = await indexDB.getAllSnapshotsFromWork(workId);
    if (allSnapshots.length == 0) {
        throw new Error(`No snapshot found for given id (${workId})`);
    }
    if (!allSnapshots) {
        return false;
    }
    let workMetadata = await indexDB.findWork(workId);
    console.log('%c Snapshots: ', 'color: pink;', allSnapshots);
    console.log("%c Metadata: ", 'color: pink;', workMetadata);
    if (allCAnalytic.has(workId)) {
        console.log("%c Graph already exist so I'll update", "color: red;");
        allCAnalytic.get(workId).update(allSnapshots, workMetadata);
        return true;
    } else {
        //div
        const Analytic = new CAnalytic(allSnapshots, workMetadata, statDivHolder);
        Analytic.mount();
        Analytic.draw();
        allCAnalytic.set(workId, Analytic);
        console.log("%c Graph doesn't exist so I'll create", "color: green;");
        return true;
    }
}
/** Generate HTML for the frontend on multiple work. Display graphs and stats for each.
 * 
 * @param listOfWork - List of work to graph
 * @param statDivHolder - Div which the graphs will be appended to
 */
async function generateHTMLStatsFromMultiWork(listOfWork:Metadata[], statDivHolder) {
    console.log("allMetadata: ", listOfWork);
    listOfWork.map(async(work)=>{
        await generateHTMLStatsFromWork(work.workId, statDivHolder);
    });
}

const frontend = {
  generateHTMLStatsFromWork,
  generateHTMLStatsFromMultiWork
}

export default frontend
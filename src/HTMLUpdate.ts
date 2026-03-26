import numberUtils from "./utils/numberUtils";
import graphDrawer from "./graphDrawer";
import dateUtils from "./utils/dateUtils"
import testingData from "./data/testingData";


let kudoCount = document.getElementById("kudo_count");
let hitCount = document.getElementById("hit_count");
let engagementCount = document.getElementById("engagement_count");
let titleHeader = document.getElementById("work_title");

function updateTitle(title):void {
  titleHeader.textContent = title;
}
function updateHit(hit):void {
  hitCount.textContent = hit;
}
function updateKudo(kudo):void {
  kudoCount.textContent = kudo;
}
/** Fill in missing data with null based on day
 * 
 * @param {GraphMetric[]} metrics - Array of metrics to fill
  * @param {Number} millisecondDiff - Amount of millisecondsbefore placing null. Defaults to a day
 * 
 * @returns {GraphMetric[]} - Metrics filled with null
 */

function updateEngagement(kudos, hits) {
  engagementCount.textContent = numberUtils.calculateEngagement(kudos, hits);
}
/** Update html of statistic liek kudos, hits, engagement, etc. Update the graph
 * 
 * @param {Snapshot} snapshot - Snapshot to graph
 * @param {Metadata} metadata - Metadata to graph
 * 
*/
function updateStats(index, snapshot, metadata) {
  updateHit(snapshot[index].hits);
  updateKudo(snapshot[index].kudos);
  updateEngagement(snapshot[index].kudos, snapshot[index].hits);
  updateTitle(metadata.title);
  graphDrawer.updateKudoGraph(snapshot);
  graphDrawer.updateHitGraph(snapshot);
}

let HTMLUpdate = {
  updateStats
}

export default HTMLUpdate;
import numberUtils from "./utils/numberUtils";
import graphDrawer from "./graphDrawer";
import dateUtils from "./utils/dateUtils"
import testingData from "./data/testingData";
import CAnalytic from "./CAnalytic";
import type{ Metadata, Snapshot } from "./data/types";
let titleHeader = document.getElementById("work_title");
let kudoCount = document.getElementById("kudo_count");
let hitCount = document.getElementById("hit_count");
let engagementCount = document.getElementById("engagement_count");
let commentCount = document.getElementById("comment_count");
let bookmarkCount = document.getElementById("bookmark_count");
let kudoHighCount = document.getElementById("kudo_count_high");
let hitHighCount = document.getElementById("hit_count_high");
let commentHighCount = document.getElementById("comment_count_high");
let bookmarkHighCount = document.getElementById("bookmark_count_high");
let graphGalleryDiv = document.getElementById("graph_gallery") as HTMLDivElement;

function updateTitle(title):void {
  titleHeader.textContent = title;
}
function updateHit(hit):void {
  hitCount.textContent = hit;
}
function updateKudo(kudo):void {
  kudoCount.textContent = kudo;
}
function updateComments(comment):void {
  commentCount.textContent = comment;
}
function updateBookmark(bookmark):void {
  bookmarkCount.textContent = bookmark;
}
function updateHitHigh(hit):void {
  hitHighCount.textContent = hit;
}
function updateKudoHigh(kudo):void {
  kudoHighCount.textContent = kudo;
}
function updateCommentsHigh(comment):void {
  commentHighCount.textContent = comment;
}
function updateBookmarkHigh(bookmark):void {
  bookmarkHighCount.textContent = bookmark;
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
async function updateStats(index:number, snapshots:Snapshot[], metadata:Metadata):Promise<void> {
  let tarSnap = snapshots[index];
  updateHit(tarSnap.hits);
  updateKudo(tarSnap.kudos);
  updateEngagement(tarSnap.kudos, tarSnap.hits);
  updateTitle(metadata.title);
  updateComments(tarSnap.comments);
  updateBookmark(tarSnap.bookmarks);
  let GraphAnalytic = new CAnalytic(snapshots, metadata, graphGalleryDiv); 
  GraphAnalytic.draw();
}

let HTMLUpdate = {
  updateStats
}

export default HTMLUpdate;
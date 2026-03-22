import numberUtils from "./numberUtils.js";
import graphDrawer from "./graphDrawer.js";
import testingData from "./data/testingData.js";
import 'chartjs-adapter-date-fns';
/**
 * @typedef {Object} GraphMetric 
 * @property {string} timeStamps - Unix timestamp in milliseconds (Date.now())
 * @property {string} dates_converted - String date intended for human reading (IE: Jan 1)
 * @property {number} kudos - Number of kudos
 * @property {number} kudosPerDay - Daily kudos
 * @property {number} hits - Number of hits
 * @property {number} hitsPerDay - Daily hits
 * 
 */


/** @type {GraphMetric[]} */
let graphMetrics = [];
let kudoCount = document.getElementById("kudo_count");
let hitCount = document.getElementById("hit_count");
let engagementCount = document.getElementById("engagement_count");
let titleHeader = document.getElementById("work_title");

//fetch data
for (let i = 0; i < testingData.snapshots.length; i++) {
    let snapshot = testingData.snapshots[i];
    let metric = {
      timeStamps: snapshot.timeStamp,
      kudos: snapshot.kudos,
      hits: snapshot.hits
    }
    graphMetrics.push(metric);
}
//clean data
//for (let i = 0; i < graphMetrics.length; i++) {
//  graphMetrics[i].dates_converted = dateUtils.extractDayMonth(graphMetrics[i].timeStamp);
//}
numberUtils.metricPerDay(graphMetrics, "kudos", "kudosPerDay");
numberUtils.metricPerDay(graphMetrics, "hits", "hitsPerDay");
//cleaning ends here
function updateTitle(title) {
  titleHeader.textContent = title;
}
function updateHit(hit) {
  hitCount.textContent = hit;
}
function updateKudo(kudo) {
  kudoCount.textContent = kudo;
}
function updateEngagement(kudos, hits) {
  engagementCount.textContent = numberUtils.calculateEngagement(kudos, hits);
}
function updateStats(snapshot, metadata) {
  updateHit(snapshot.hits);
  updateKudo(snapshot.kudos);
  updateEngagement(snapshot.kudos, snapshot.hits);
  updateTitle(metadata.title);
  graphDrawer.updateKudoGraph(graphMetrics);
  graphDrawer.updateHitGraph(graphMetrics);
}

let HTMLUpdate = {
  updateStats
}

export default HTMLUpdate;
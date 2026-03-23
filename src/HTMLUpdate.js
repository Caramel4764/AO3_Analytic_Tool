import numberUtils from "./numberUtils.js";
import graphDrawer from "./graphDrawer.js";
import testingData from "./data/testingData.js";
import dateUtils from "./dateUtils.js"
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
const millisecondPerDay = 1000*60*60*24;

/** @type {GraphMetric[]} */
let graphMetrics = [];
let kudoCount = document.getElementById("kudo_count");
let hitCount = document.getElementById("hit_count");
let engagementCount = document.getElementById("engagement_count");
let titleHeader = document.getElementById("work_title");

function updateTitle(title) {
  titleHeader.textContent = title;
}
function updateHit(hit) {
  hitCount.textContent = hit;
}
function updateKudo(kudo) {
  kudoCount.textContent = kudo;
}
/** Fill in missing data with null based on day
 * 
 * @param {GraphMetric[]} metrics - Array of metrics to fill
  * @param {Number} millisecondDiff - Amount of millisecondsbefore placing null. Defaults to a day
 * 
 * @returns {GraphMetric[]} - Metrics filled with null
 */
function missingMetricImputation(metrics, millisecondDiff = millisecondPerDay) {
  let imputatedMetric = [];
  for (let i = 0; i<metrics.length-1; i++) {
    imputatedMetric.push(metrics[i]);
    if (metrics[i+1].timeStamps - metrics[i].timeStamps > millisecondDiff) {
      imputatedMetric.push({
        timeStamps: null,
        hits: null,
        hitsPerDay: null,
        kudos: null,
        kudosPerDay: null,
        dates_converted: null,
      });
    }
  }
  imputatedMetric.push(metrics[metrics.length-1]);
  return imputatedMetric;
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
for (let i = 0; i < graphMetrics.length; i++) {
  graphMetrics[i].dates_converted = dateUtils.extractDayMonth(graphMetrics[i].timeStamps, true);
}
numberUtils.metricPerDay(graphMetrics, "kudos", "kudosPerDay");
numberUtils.metricPerDay(graphMetrics, "hits", "hitsPerDay");
graphMetrics = missingMetricImputation(graphMetrics);
//cleaning ends here

let HTMLUpdate = {
  updateStats
}

export default HTMLUpdate;
import numberUtils from "./numberUtils.js";
import dateUtils from "./dateUtils.js"
import Chart from 'chart.js/auto';
import testingData from "./data/testingData.js";

const ctx_kudos = document.getElementById('kudo_per_day_graph');
let graphMetrics = {
  timeStamps: [],
  dates_converted : [],
  kudos:[],
  kudosPerDay:[],
  hits:[],
  hitsPerDay:[]
};
let kudoCount = document.getElementById("kudo_count");
let hitCount = document.getElementById("hit_count");
let engagementCount = document.getElementById("engagement_count");
let titleHeader = document.getElementById("work_title");

//fetch data
for (let i = 0; i < testingData.snapshots.length; i++) {
    let snapshot = testingData.snapshots[i];
    graphMetrics.kudos.push(snapshot.kudos);
    graphMetrics.hits.push(snapshot.hits);
    graphMetrics.timeStamps.push(snapshot.timeStamp);
}
//clean data
for (let i = 0; i < graphMetrics.timeStamps.length; i++) {
  /* 
  let cleanedGraphTimes = [];
  cleanedGraphTimes[i] = dateUtils.extractDayMonth(graphTimes[i]);
  return cleanedGraphTimes;
  */
  graphMetrics.dates_converted[i] = dateUtils.extractDayMonth(graphMetrics.timeStamps[i]);
}
graphMetrics.kudosPerDay = numberUtils.metricPerDay(graphMetrics.kudos, graphMetrics.timeStamps);
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
  updateKudoGraph(graphMetrics.dates_converted, graphMetrics.kudosPerDay)
}
function updateKudoGraph(dates, kudos) {
  new Chart(ctx_kudos, {
    type: 'line',
    data: {
        labels: dates,
        datasets: [{
            label: 'Daily Kudos',
            data: kudos,
        }]
    }
  });
}
let HTMLUpdate = {
  updateStats
}

export default HTMLUpdate;
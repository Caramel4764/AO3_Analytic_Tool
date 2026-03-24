// This creates all the graphs
import dateUtils from "./dateUtils.js"
import Chart from 'chart.js/auto';
import { _adapters } from 'chart.js';
import 'chartjs-adapter-luxon';
import testingData from "./data/testingData.js";
import numberUtils from "./numberUtils.js";
import indexDb from "./indexDB.js"
const millisecondPerDay = 1000*60*60*24;

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

//tracks if a graph has already been created
let kudoChart = null;
let hitsChart = null;
/** @type {GraphMetric[]} */
//let graphMetrics = [];

const ctx_kudos = document.getElementById('kudo_per_day_graph');
const ctx_hits = document.getElementById('hit_per_day_graph');

/** Finds missing entries and replace it with null
 * 
 * @param {GraphMetric[]} metrics - Metric to add null
 * @return {millisecondDiff} - Milliseconds of time in betwen before a entry is considered missing. Defaults to a day
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
/** Takes prepared metric and creates the chart.js property for use
 * 
 * @param {GraphMetric[]} graphMetrics - Metrics
 * @param {millisecondDiff} yAxisPropertyKey - Key to search y property
*/
function generateGraphDataset(graphMetrics, yAxisPropertyKey) {
  const fixedData = [];
  for (let i = 0; i < graphMetrics.length; i++) {
    const current = graphMetrics[i];
    if (!current || current.dates_converted === null) {
      fixedData.push({x: null, y: null, skip: true});
    } else {
      fixedData.push({
        //here
        x: current.dates_converted,
        y: current[yAxisPropertyKey]
      });
    }
  }
  return fixedData;
}
const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

async function getMetrics(isTesting = false) {
  let graphMetrics = [];
  if (isTesting) {
  for (let i = 0; i < testingData.snapshots.length; i++) {
      let snapshot = testingData.snapshots[i];
      let metric = {
        timeStamps: snapshot.timeStamp,
        kudos: snapshot.kudos,
        hits: snapshot.hits
      }
      graphMetrics.push(metric);
    }
  } else {
    let allSnapshots = await indexDb.getAllSnapshots();
      for (let i = 0; i < allSnapshots.length; i++) {
      let snapshot = allSnapshots[i];
      let metric = {
        timeStamps: snapshot.timeStamp,
        kudos: snapshot.kudos,
        hits: snapshot.hits
      }
      graphMetrics.push(metric);
    }
  }
  return graphMetrics;
}
async function getGraphMetric(snapshot) {
  //fetch data
  let graphMetrics = await getMetrics();
  graphMetrics = prepGraphData(graphMetrics);
  return graphMetrics;
}
async function updateKudoGraph(snapshot) {
  if (kudoChart) {
    kudoChart.destroy();
  }
  let graphMetrics = await getGraphMetric(snapshot);
  let graphData = generateGraphDataset(graphMetrics, "kudosPerDay");
  console.log("IMPOR: ", graphData)
  kudoChart = new Chart(ctx_kudos, {
    type: 'line',
    data: {
      datasets: [{
          label: 'Daily Kudos',
          data: graphData,
          borderColor: "red",
          borderWidth: 2,
          tension: 0,
          pointBackgroundColor: "red",
          pointRadius: 4,
          segment: {
            borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)'),
            borderDash: ctx => skipped(ctx, [6, 6]),
          },
          spanGaps: true // avoid connecting null which I fill in for missing data points
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => {
              return items[0].raw.x;
            },
            label: (context) => {
              return `Kudos: ${context.raw.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          }
        }
      }
    }
  });
}

async function updateHitGraph(snapshot) {
if (hitsChart) {
    hitsChart.destroy();
  }
  let graphMetrics = await getGraphMetric(snapshot);
  let graphData = generateGraphDataset(graphMetrics, "hitsPerDay");
  hitsChart = new Chart(ctx_hits, {
    type: 'line',
    data: {
      datasets: [{
          label: 'Daily Hits',
          data: graphData,
          borderColor: "#008a17",
          borderWidth: 2,
          tension: 0,
          pointBackgroundColor: "#008a17",
          pointRadius: 4,
          segment: {
            borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)'),
            borderDash: ctx => skipped(ctx, [6, 6]),
          },
          spanGaps: true
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => {
              const date = new Date(items[0].raw.x);
              return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
            },
            label: (context) => {
              return `Hits: ${context.raw.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          }
        }
      }
    }
  });
}
/** Takes a list of graphMetric and prepare it for display. Has null for missing data and calculated kudos/hits
 * 
 * @param {GraphMetric[]} graphMetrics - Snapshot to graph
 * @return {GraphMetric[]} - Graph metric will null filled in for missing day
*/
function prepGraphData(graphMetrics) {
  for (let i = 0; i < graphMetrics.length; i++) {
    graphMetrics[i].dates_converted = dateUtils.extractDayMonth(graphMetrics[i].timeStamps, true);
  }
  numberUtils.metricPerDay(graphMetrics, "kudos", "kudosPerDay");
  numberUtils.metricPerDay(graphMetrics, "hits", "hitsPerDay");
  //
  graphMetrics = missingMetricImputation(graphMetrics);
  return graphMetrics;
}

let graphDrawer = {
  updateKudoGraph,
  updateHitGraph,
  prepGraphData
}

export default graphDrawer;
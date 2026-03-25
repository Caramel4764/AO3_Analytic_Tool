// This creates all the graphs
import dateUtils from "./dateUtils.js"
import Chart from 'chart.js/auto';
import { _adapters } from 'chart.js';
import 'chartjs-adapter-luxon';
import testingData from "./data/testingData.js";
import numberUtils from "./numberUtils.js";
import indexDb from "./indexDB.js"
import testingConfig from "./testingConfig.js"
const millisecondPerDay = 1000*60*60*24;
const isTesting = true;
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

function createChartConfig({ label, data, color, tooltipLabel }) {
  return {
    type: 'line',
    data: {
      datasets: [{
        clip: false,
        label,
        data,
        borderColor: color,
        borderWidth: 2,
        tension: 0,
        pointBackgroundColor: color,
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
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => {
              const date = new Date(items[0].raw.x);
              return date.toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric'
              });
            },
            label: (context) => `${tooltipLabel}: ${context.raw.y}`
          }
        }
      },
      scales: {
        x: { type: 'time', time: { unit: 'day' } },
        y: { min: 0, ticks: { precision: 0 } }
      }
    }
  };
}

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

/** Takes prepared metric and creates the chart.js property for use
 * 
 * @param {Boolean} isTesting - Include testinging value or real? False by default
*/
async function getMetrics(snapshots, isTesting = false) {
  let graphMetrics = [];
  for (let i = 0; i < snapshots.length; i++) {
    let snapshot = snapshots[i];
    let metric = {
      timeStamps: snapshot.timeStamp,
      kudos: snapshot.kudos,
      hits: snapshot.hits
    }
    graphMetrics.push(metric);
  }
  return graphMetrics;
}
/** Gets the graph metric and prepare it for use
 * 
*/
async function getGraphMetric(snapshots) {
  let graphMetrics = await getMetrics(snapshots);
  graphMetrics = prepGraphData(graphMetrics);
  return graphMetrics;
}
async function updateKudoGraph(snapshots) {
  if (kudoChart) {
    kudoChart.destroy();
  }
  let graphMetrics = await getGraphMetric(snapshots);
  let graphData = generateGraphDataset(graphMetrics, "kudosPerDay");
  kudoChart = new Chart(ctx_kudos, createChartConfig({
    label: 'Daily Kudos',
    data: graphData,
    color: 'red',
    tooltipLabel: 'Kudos'
  }));
}

async function updateHitGraph(snapshots) {
  if (hitsChart) {
    hitsChart.destroy();
  }
  let graphMetrics = await getGraphMetric(snapshots);
  let graphData = generateGraphDataset(graphMetrics, "hitsPerDay");
  hitsChart = new Chart(ctx_hits, createChartConfig({
    label: 'Daily Hits',
    data: graphData,
    color: '#1751ff',
    tooltipLabel: 'Hits'
  }));
}
/** Takes a list of graphMetric and prepare it for display. Has null for missing data and calculated kudos/hits
 * 
 * @param {GraphMetric[]} graphMetrics - Snapshot to graph
 * @return {GraphMetric[]} - Graph metric will null filled in for missing day
*/
function prepGraphData(graphMetrics) {
  for (let i = 0; i < graphMetrics.length; i++) {
    graphMetrics[i].dates_converted = dateUtils.timeStampToReadable(graphMetrics[i].timeStamps, true);
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
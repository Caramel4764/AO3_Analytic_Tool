// This creates all the graphs
import dateUtils from "./utils/dateUtils";
import Chart from 'chart.js/auto';
import { _adapters } from 'chart.js';
import 'chartjs-adapter-luxon';
import testingData from "./data/testingData";
import numberUtils from "./utils/numberUtils";
import indexDb from "./indexDB";
import annotationPlugin from 'chartjs-plugin-annotation';

import type {ChartConfigParam, GraphMetric, GraphData, Metadata, Snapshot} from "./data/types";
Chart.register(annotationPlugin);

const millisecondPerDay = 1000*60*60*24;
const isTesting = true;


//tracks if a graph has already been created
let kudoChart = null;
let hitsChart = null;
//let graphMetrics = [];

const ctx_kudos = document.getElementById('kudo_per_day_graph') as HTMLCanvasElement;
const ctx_hits = document.getElementById('hit_per_day_graph') as HTMLCanvasElement;

function createChartConfig({ label, data, color, tooltipLabel, snapshots, newChapterColor, getChartCallback }: ChartConfigParam) {
  let annotations = generateAnnotations(snapshots, getChartCallback, newChapterColor)
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
        order: 0,
        segment: {
          borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)'),
          borderDash: ctx => skipped(ctx, [6, 6]),
        },
        spanGaps: true
      }]
    },
    options: {
      plugins: {
        annotation: { annotations },
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => {
              const [year, month, day] = items[0].raw.x.split('-');
              const date = new Date(year, month - 1, day);
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
//[FIX HERE. NOT MILLISECONDS BUT UNIQUE DATE]
function missingMetricImputation(metrics: GraphMetric[], millisecondDiff:number = 2*millisecondPerDay) {
  let imputatedMetric = [];
  for (let i = 0; i<metrics.length-1; i++) {
    imputatedMetric.push(metrics[i]);
    if (metrics[i+1].timeStamps - metrics[i].timeStamps >= millisecondDiff) {
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

function generateAnnotations(snapshots:Snapshot[], getChart: ()=>Chart, newChapterColor:string) {
  let newChapterSnapshots = [];
  for (let i = 1; i < snapshots.length; i++) {
    let currSnap = snapshots[i];
    let prevSnap = snapshots[i-1];
    //if book mark has changed
    if (currSnap.chapters != prevSnap.chapters) {
      newChapterSnapshots.push(currSnap);
    }
  }
  let annotations = Object.fromEntries(
    newChapterSnapshots.map((snapshot) => [
      `chapter${snapshot.chapters}`,           // unique key
      {
        type: 'line',
        z: -1,
        drawTime: 'beforeDatasetsDraw',
        xMin: dateUtils.timeStampToReadable(snapshot.timeStamp),
        xMax: dateUtils.timeStampToReadable(snapshot.timeStamp),
        borderColor: newChapterColor,
        borderWidth: 4,
        display: true,
        label: {
          content: `Chapter ${snapshot.chapters}`,
          display: false,
        },
        enter() { 
          let chart = getChart();
          let annotation = chart.options.plugins.annotation.annotations[`chapter${snapshot.chapters}`]
          //if (annotation.label.display === true) return;
          annotation.label.display = true;
          //annotation.borderWidth = 3;
          chart.update('none');
        },
        leave() {
          let chart = getChart();
          let annotation = chart.options.plugins.annotation.annotations[`chapter${snapshot.chapters}`]
          //if (annotation.label.display === true) return;
          annotation.label.display = false;
          //annotation.borderWidth = 4;
          chart.update('none');
        },
      }
    ])
  );
  return annotations;
}

/** Takes prepared metric and creates the chart property for use
 * 
 * @param {GraphMetric[]} graphMetrics - Metrics
 * @param {millisecondDiff} yAxisPropertyKey - Key to search y property
*/
function generateGraphDataset(graphMetrics: GraphMetric[], yAxisPropertyKey:string):GraphData[] {
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
async function getMetrics(snapshots:Snapshot[], isTesting:boolean = false): Promise<GraphMetric[]> {
  let graphMetrics = [];
  for (let i = 0; i < snapshots.length; i++) {
    let snapshot = snapshots[i];
    let metric = {
      timeStamps: snapshot.timeStamp,
      kudos: snapshot.kudos,
      hits: snapshot.hits,
      comments: snapshot.comments,
      bookmarks: snapshot.bookmarks
    }
    graphMetrics.push(metric);
  }
  return graphMetrics;
}
/** Gets the graph metric and prepare it for use
 * 
*/
async function getGraphMetric(snapshots:Snapshot[]): Promise<GraphMetric[]> {
  let graphMetrics = await getMetrics(snapshots);
  graphMetrics = prepGraphData(graphMetrics);
  return graphMetrics;
}
async function updateKudoGraph(snapshots:Snapshot[]): Promise<void> {
  if (kudoChart) {
    kudoChart.destroy();
  }
  let graphMetrics = await getGraphMetric(snapshots);
  let graphData = generateGraphDataset(graphMetrics, "kudosPerDay");
  kudoChart = new Chart(ctx_kudos, createChartConfig({
    label: 'Daily Kudos',
    data: graphData,
    color: '#FF0000',
    tooltipLabel: 'Kudos',
    snapshots: snapshots,
    newChapterColor: "#fcdada",
    getChartCallback: () => kudoChart
  }) as any);
}

async function updateHitGraph(snapshots:Snapshot[]): Promise<void> {
  if (hitsChart) {
    hitsChart.destroy();
  }
  let graphMetrics = await getGraphMetric(snapshots);
  let graphData = generateGraphDataset(graphMetrics, "hitsPerDay");
  hitsChart = new Chart(ctx_hits, createChartConfig({
    label: 'Daily Hits',
    data: graphData,
    color: '#1751ff',
    tooltipLabel: 'Hits',
    snapshots: snapshots,
    newChapterColor: "#d6e1ff",
    getChartCallback: () => hitsChart
  }) as any);
}
/** Takes a list of graphMetric and prepare it for display. Has null for missing data and calculated kudos/hits
 * 
 * @param {GraphMetric[]} graphMetrics - Snapshot to graph
 * @return {GraphMetric[]} - Graph metric will null filled in for missing day
*/
function prepGraphData(graphMetrics:GraphMetric[]): GraphMetric[] {
  for (let i = 0; i < graphMetrics.length; i++) {
    graphMetrics[i].dates_converted = dateUtils.timeStampToReadable(graphMetrics[i].timeStamps);
  }
  calculateAdditionalGraphData(graphMetrics);
  graphMetrics = missingMetricImputation(graphMetrics);
  return graphMetrics;
}
//includes kudsoPerDay, commentsPerDay, etc
function calculateAdditionalGraphData(graphMetrics: GraphMetric[]):void {
numberUtils.metricPerDay(graphMetrics, "kudos", "kudosPerDay");
  numberUtils.metricPerDay(graphMetrics, "hits", "hitsPerDay");
  numberUtils.metricPerDay(graphMetrics, "comments", "commentsPerDay");
  numberUtils.metricPerDay(graphMetrics, "bookmarks", "bookmarksPerDay");
}
let graphDrawer = {
  updateKudoGraph,
  updateHitGraph,
  prepGraphData,
  getMetrics,
  calculateAdditionalGraphData
}

export default graphDrawer;
// This creates all the graphs
import dateUtils from "./dateUtils.js"
import Chart from 'chart.js/auto';
import { _adapters } from 'chart.js';
import 'chartjs-adapter-luxon';

//tracks if a graph has already been created
let kudoChart = null;
let hitsChart = null;

const ctx_kudos = document.getElementById('kudo_per_day_graph');
const ctx_hits = document.getElementById('hit_per_day_graph');

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

function updateKudoGraph(graphMetrics) {
  if (kudoChart) {
    kudoChart.destroy();
  }
  let fixedData = generateGraphDataset(graphMetrics, "kudosPerDay");
  kudoChart = new Chart(ctx_kudos, {
    type: 'line',
    data: {
      datasets: [{
          label: 'Daily Kudos',
          data: fixedData,
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

function updateHitGraph(graphMetrics) {
if (hitsChart) {
    hitsChart.destroy();
  }
  let fixedData = generateGraphDataset(graphMetrics, "hitsPerDay");
  hitsChart = new Chart(ctx_hits, {
    type: 'line',
    data: {
      datasets: [{
          label: 'Daily Hits',
          data: fixedData,
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

let graphDrawer = {
  updateKudoGraph,
  updateHitGraph
}

export default graphDrawer;
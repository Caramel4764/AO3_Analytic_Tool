// This creates all the graphs
import dateUtils from "./dateUtils.js"
import Chart from 'chart.js/auto';
//tracks if a graph has already been created
let kudoChart = null;
let hitsChart = null;

const ctx_kudos = document.getElementById('kudo_per_day_graph');
const ctx_hits = document.getElementById('hit_per_day_graph');

function updateKudoGraph(graphMetrics) {
  if (kudoChart) {
    kudoChart.destroy();
  }
  kudoChart = new Chart(ctx_kudos, {
    type: 'line',
    data: {
      datasets: [{
          label: 'Daily Kudos',
          data: graphMetrics.map((metric, i)=>({
            x: metric.timeStamps,
            y: metric.kudosPerDay
          })),
          borderColor: "red",
          borderWidth: 2,
          tension: 0,
          pointBackgroundColor: "red",
          pointRadius: 4,
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
              return `Kudos: ${context.raw.y}`;
            }
          }
        }
      },
      parsing: false,
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
  hitsChart = new Chart(ctx_hits, {
    type: 'line',
    data: {
      datasets: [{
          label: 'Daily Hits',
          data: graphMetrics.map((metric, i)=>({
            x: metric.timeStamps,
            y: metric.hitsPerDay
          })),
          borderColor: "#008a17",
          borderWidth: 2,
          tension: 0,
          pointBackgroundColor: "#008a17",
          pointRadius: 4,
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
      parsing: false,
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
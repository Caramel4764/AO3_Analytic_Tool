import type{ ChartConfigParam, Snapshot, Metadata, GraphMetric, GraphData } from "./data/types";
import dateUtils from "./utils/dateUtils";
import Chart from 'chart.js/auto';
import { _adapters } from 'chart.js';
import 'chartjs-adapter-luxon';
import testingData from "./data/testingData";
import numberUtils from "./utils/numberUtils";
import indexDb from "./indexDB";
import annotationPlugin from 'chartjs-plugin-annotation';
import stringUtils from "./utils/stringUtils";

const millisecondPerDay = 1000*60*60*24;


class CAnalytic {
  snapshots: Snapshot[];
  metadata: Metadata;
  kudoChart;
  hitChart;
  kudoChartCtx: HTMLCanvasElement;
  hitChartCtx: HTMLCanvasElement;
  graphMetrics: GraphMetric[];
  graphGalleryDiv:HTMLDivElement;
  //consider graphGalleryDiv in constructor
  constructor(snapshots:Snapshot[], metadata:Metadata, graphGalleryDiv:HTMLDivElement) {
    this.snapshots = snapshots;
    this.metadata = metadata;
    this.graphGalleryDiv = graphGalleryDiv;
    this.graphMetrics = this.getGraphMetric();
    this.kudoChartCtx = this.createCanvas("kudo");
    this.hitChartCtx = this.createCanvas("hit");
  }
  private createCanvas(name :string): HTMLCanvasElement {
    let graphDiv = document.createElement("div");
    graphDiv.className = "graph_div";
    graphDiv.id = `${name}_per_day_graph_div`;
    let title = document.createElement("h3");
    title.textContent = `${stringUtils.capitalize(name)}s per day`;
    let canvas = document.createElement("canvas");
    canvas.id = `${name}_per_day_graph`;
    this.graphGalleryDiv.appendChild(graphDiv);
    graphDiv.appendChild(title);
    graphDiv.appendChild(canvas);
    return canvas;
  }
  private missingMetricImputation(metrics: GraphMetric[], millisecondDiff:number = 2*millisecondPerDay): GraphMetric[] {
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
  private createChartConfig({ label, data, color, tooltipLabel, snapshots, newChapterColor, getChartCallback }: ChartConfigParam) {
    let annotations = this.generateAnnotations(snapshots, getChartCallback, newChapterColor)
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
            borderColor: ctx => this.skipped(ctx, 'rgb(0,0,0,0.2)'),
            borderDash: ctx => this.skipped(ctx, [6, 6]),
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
  private generateAnnotations(snapshots:Snapshot[], getChart: ()=>Chart, newChapterColor:string) {
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
  private generateGraphDataset(graphMetrics: GraphMetric[], yAxisPropertyKey:string):GraphData[] {
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
  private skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
  private getMetrics(snapshots:Snapshot[], isTesting:boolean = false): GraphMetric[] {
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
  private getGraphMetric(): GraphMetric[] {
    let graphMetrics = this.getMetrics(this.snapshots);
    graphMetrics = this.prepGraphData(graphMetrics);
    return graphMetrics;
  }
  private async updateKudoGraph(snapshots:Snapshot[] = this.snapshots): Promise<void> {
    if (this.kudoChart) {
      this.kudoChart.destroy();
    }
    let graphMetrics = await this.getGraphMetric();
    let graphData = this.generateGraphDataset(graphMetrics, "kudosPerDay");
    this.kudoChart = new Chart(this.kudoChartCtx, this.createChartConfig({
      label: 'Daily Kudos',
      data: graphData,
      color: '#FF0000',
      tooltipLabel: 'Kudos',
      snapshots: snapshots,
      newChapterColor: "#fcdada",
      getChartCallback: () => this.kudoChart
    }) as any);
  }
  private async updateHitGraph(snapshots:Snapshot[] = this.snapshots): Promise<void> {
    if (this.hitChart) {
      this.hitChart.destroy();
    }
    let graphMetrics = this.getGraphMetric();
    let graphData = this.generateGraphDataset(graphMetrics, "hitsPerDay");
    this.hitChart = new Chart(this.hitChartCtx, this.createChartConfig({
      label: 'Daily Hits',
      data: graphData,
      color: '#1751ff',
      tooltipLabel: 'Hits',
      snapshots: snapshots,
      newChapterColor: "#d6e1ff",
      getChartCallback: () => this.hitChart
    }) as any);
  }
  private prepGraphData(graphMetrics:GraphMetric[]): GraphMetric[] {
    for (let i = 0; i < graphMetrics.length; i++) {
      graphMetrics[i].dates_converted = dateUtils.timeStampToReadable(graphMetrics[i].timeStamps);
    }
    this.calculateAdditionalGraphData(graphMetrics);
    graphMetrics = this.missingMetricImputation(graphMetrics);
    return graphMetrics;
  }
  private calculateAdditionalGraphData(graphMetrics: GraphMetric[]):void {
    numberUtils.metricPerDay(graphMetrics, "kudos", "kudosPerDay");
    numberUtils.metricPerDay(graphMetrics, "hits", "hitsPerDay");
    numberUtils.metricPerDay(graphMetrics, "comments", "commentsPerDay");
    numberUtils.metricPerDay(graphMetrics, "bookmarks", "bookmarksPerDay");
  }
  public draw() {
    this.updateKudoGraph();
    this.updateHitGraph();
  }
}

export default CAnalytic;
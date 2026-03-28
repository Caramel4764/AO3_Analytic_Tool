import type{ AnalyticElements, ChartConfigParam, Snapshot, Metadata, GraphMetric, GraphData } from "./data/types";
import dateUtils from "./utils/dateUtils";
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import numberUtils from "./utils/numberUtils";
import stringUtils from "./utils/stringUtils";
import annotationPlugin from 'chartjs-plugin-annotation';
import testingData from "./data/testingData";
import { _adapters } from 'chart.js';
Chart.register(annotationPlugin);

let rootEle = document.getElementById("div_holding_multi_stats");

const millisecondPerDay = 1000*60*60*24;

class CAnalytic {
  snapshots: Snapshot[];
  metadata: Metadata;
  graphMetrics: GraphMetric[];
  elements:AnalyticElements = {
    titleHeader: null,
    kudoCount: null,
    hitCount: null,
    engagementCount: null,
    commentCount: null,
    bookmarkCount: null,
    kudoHighCount: null,
    hitHighCount: null,
    commentHighCount: null,
    bookmarkHighCount: null,
    graphGalleryDiv: null,
    kudoChartCtx: null,
    hitChartCtx: null,
    kudoChart: null,
    hitChart: null,
  }
  constructor(snapshots:Snapshot[], metadata:Metadata) {
    this.snapshots = snapshots;
    this.metadata = metadata;
    this.graphMetrics = this.getGraphMetric();
    //this.elements.graphGalleryDiv = graphGalleryDiv;
    this.createBlock();
    this.getHTMLElements();
    this.elements.kudoChartCtx = this.createCanvas("kudo");
    this.elements.hitChartCtx = this.createCanvas("hit");
  }
  private createCanvas(name :string): HTMLCanvasElement {
    let graphDiv = document.createElement("div");
    graphDiv.className = "graph_div";
    graphDiv.id = `${name}_per_day_graph_div`;
    let title = document.createElement("h3");
    title.textContent = `${stringUtils.capitalize(name)}s per day`;
    let canvas = document.createElement("canvas");
    canvas.id = `${name}_per_day_graph`;
    this.elements.graphGalleryDiv.appendChild(graphDiv);
    graphDiv.appendChild(title);
    graphDiv.appendChild(canvas);
    return canvas;
  }
  private getId() {
    return this.metadata.workId;
  }
  private createBlock(name:string="nothing") {
    const block = document.createElement('div');
    block.innerHTML = `
      <div id="stat_content_${this.getId()}">
        <h2 id="work_title_${this.getId()}">Title</h2>
        <div class="basic_stat">
            <div class="stat_flex">
                <div class="inner_stat_flex">
                    <div id='kudo_div_${this.getId()}' class="basic_stat_div kudo_div">Kudos: <span id="kudo_count_${this.getId()}">0</span></div>
                    <div id='hit_div_${this.getId()}' class="basic_stat_div hit_div">Hits: <span id="hit_count_${this.getId()}">0</span></div>
                    <div id='comment_div_${this.getId()}' class="basic_stat_div comment_div">Comments: <span id="comment_count_${this.getId()}">0</span></div>
                    <div id='bookmark_div_${this.getId()}' class="basic_stat_div bookmark_div">Bookmarks: <span id="bookmark_count_${this.getId()}">0</span></div>
                </div>
                <div class="inner_stat_flex" id="basic_stat_high_div_${this.getId()}">
                    <div id='kudo_high_div_${this.getId()}' class="basic_stat_div kudo_div">Kudo High: <span id="kudo_count_high_${this.getId()}">0</span></div>
                    <div id='hit_high_div_${this.getId()}' class="basic_stat_div hit_div">Hit High: <span id="hit_count_high_${this.getId()}">0</span></div>
                    <div id='comment_high_div_${this.getId()}' class="basic_stat_div comment_div">Comment High: <span id="comment_count_high_${this.getId()}">0</span></div>
                    <div id='bookmark_high_div_${this.getId()}' class="basic_stat_div bookmark_div">Bookmark High: <span id="bookmark_count_high_${this.getId()}">0</span></div>
                </div>
                <div class="inner_stat_flex">
                    <div class="basic_stat_div">Engagement: <span id="engagement_count_${this.getId()}">0</span></div>
                </div>
            </div>
        </div>
        <div class="graph_gallery" id="graph_gallery_${this.getId()}">
        </div>
      </div>
    `;
    rootEle.appendChild(block);
  }
  private getHTMLElements() {
    this.elements.titleHeader = document.getElementById(`work_title_${this.getId()}`);
    this.elements.kudoCount = document.getElementById(`kudo_count_${this.getId()}`) as HTMLParagraphElement;
    this.elements.hitCount = document.getElementById(`hit_count_${this.getId()}`) as HTMLParagraphElement;
    this.elements.engagementCount = document.getElementById(`engagement_count_${this.getId()}`) as HTMLParagraphElement;
    this.elements.commentCount = document.getElementById(`comment_count_${this.getId()}`) as HTMLParagraphElement;
    this.elements.bookmarkCount = document.getElementById(`bookmark_count_${this.getId()}`) as HTMLParagraphElement;
    this.elements.kudoHighCount = document.getElementById(`kudo_count_high_${this.getId()}`) as HTMLParagraphElement;
    this.elements.hitHighCount = document.getElementById(`hit_count_high_${this.getId()}`) as HTMLParagraphElement;
    this.elements.commentHighCount = document.getElementById(`comment_count_high_${this.getId()}`) as HTMLParagraphElement;
    this.elements.bookmarkHighCount = document.getElementById(`bookmark_count_high_${this.getId()}`) as HTMLParagraphElement;
    this.elements.graphGalleryDiv = document.getElementById(`graph_gallery_${this.getId()}`) as HTMLDivElement;
  }
  private updateStatBlock(index:number=this.snapshots.length-1) {
    let tarSnap = this.snapshots[index];
    this.elements.titleHeader.textContent = this.metadata.title;
    this.elements.kudoCount.textContent = ""+tarSnap.kudos;
    this.elements.hitCount.textContent = ""+tarSnap.hits;
    this.elements.commentCount.textContent = ""+tarSnap.comments;
    this.elements.bookmarkCount.textContent = ""+tarSnap.bookmarks;

    this.elements.engagementCount.textContent = ""+numberUtils.calculateEngagement(tarSnap.kudos, tarSnap.hits);

    this.elements.kudoHighCount.textContent = ""+tarSnap.hits;
    this.elements.hitHighCount.textContent = ""+tarSnap.hits;
    this.elements.commentHighCount.textContent = ""+tarSnap.hits;
    this.elements.bookmarkHighCount.textContent = ""+tarSnap.hits;
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
    if (this.elements.kudoChart) {
      this.elements.kudoChart.destroy();
    }
    let graphMetrics = await this.getGraphMetric();
    let graphData = this.generateGraphDataset(graphMetrics, "kudosPerDay");
    this.elements.kudoChart = new Chart(this.elements.kudoChartCtx, this.createChartConfig({
      label: 'Daily Kudos',
      data: graphData,
      color: '#FF0000',
      tooltipLabel: 'Kudos',
      snapshots: snapshots,
      newChapterColor: "#fcdada",
      getChartCallback: () => this.elements.kudoChart
    }) as any);
  }
  private async updateHitGraph(snapshots:Snapshot[] = this.snapshots): Promise<void> {
    if (this.elements.hitChart) {
      this.elements.hitChart.destroy();
    }
    let graphMetrics = this.getGraphMetric();
    let graphData = this.generateGraphDataset(graphMetrics, "hitsPerDay");
    this.elements.hitChart = new Chart(this.elements.hitChartCtx, this.createChartConfig({
      label: 'Daily Hits',
      data: graphData,
      color: '#1751ff',
      tooltipLabel: 'Hits',
      snapshots: snapshots,
      newChapterColor: "#d6e1ff",
      getChartCallback: () => this.elements.hitChart
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

  public draw(): void {
    this.updateStatBlock();
    this.updateKudoGraph();
    this.updateHitGraph();
  }
}

export default CAnalytic;
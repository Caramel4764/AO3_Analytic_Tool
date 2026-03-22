import numberUtils from "./numberUtils.js";

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
function updateEngagement(kudos, hits) {
  engagementCount.textContent = numberUtils.calculateEngagement(kudos, hits);
}
function updateStats(snapshot, metadata) {
  updateHit(snapshot.hits);
  updateKudo(snapshot.kudos);
  updateEngagement(snapshot.kudos, snapshot.hits);
  updateTitle(metadata.title);
}
let HTMLUpdate = {
  updateStats
}

export default HTMLUpdate;
import { elements } from "chart.js";
import type { Snapshot, Metadata } from "../data/types"

class CWork {
  snapshots: Snapshot[];
  metadata:Metadata;
  appendPoint: HTMLElement;
  constructor( metadata:Metadata, snapshots: Snapshot[], appendPoint:HTMLElement) {
    this.snapshots = snapshots;
    this.metadata = metadata;
    this.appendPoint = appendPoint;
  }
  private handlePauseUnpause() {

  }
  private handleView() {
    console.log('clicked')
    chrome.tabs.create({ url: chrome.runtime.getURL(`dashboard.html?workId=${this.metadata.workId}`) });
  }
  private handlePause() {

  }
  private handleUnpause() {

  }
  private handleDelete() {

  }
  public createElement() {
    let popupEleDiv = document.createElement("div");
    popupEleDiv.classList.add('flex');
    popupEleDiv.innerHTML=`
      <div id=name${this.metadata.workId}>
        <p>${this.metadata.title}</p>
      </div>
      <div class="flex" id=actions${this.metadata.workId}>
        <button id="action_btn_view_${this.metadata.workId}" class="action_btn action_btn_view">
          <img src="eye.png" alt="View this work" />
        </button>
        <button id="action_btn_pause_${this.metadata.workId}" class="action_btn action_btn_pause">
          <img src="pause.png" alt="Pause/unpause this work" />
        </button>
        <button id="action_btn_delete_${this.metadata.workId}" class="action_btn action_btn_delete">
          <img src="trash.png" alt="Delete this work" />
        </button>
      </div>
    `;
    this.appendPoint.appendChild(popupEleDiv);
    let viewBtn = document.getElementById(`action_btn_view_${this.metadata.workId}`);
    viewBtn.addEventListener("click", ()=>this.handleView());
    let pauseBtn = document.getElementById(`action_btn_pause_${this.metadata.workId}`);
    pauseBtn.addEventListener("click", ()=>this.handlePauseUnpause());
    let deleteBtn = document.getElementById(`action_btn_delete_${this.metadata.workId}`);
    deleteBtn.addEventListener("click", ()=>this.handleDelete());
  }
}

export default CWork
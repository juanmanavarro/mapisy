import {LitElement, html, css} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class MapConfig extends LitElement {
  static get styles() {
    const { cssRules } = document.styleSheets[1]
    const globalStyle = css([Object.values(cssRules).map(rule =>
    rule.cssText).join('\n')])
    return [
      globalStyle,
      css`
      `
    ];
  }

  static properties = {
    map: {},
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    zoom: {
      type: Number,
    },
    isOpen: {
      type: Boolean,
    },
  };

  constructor() {
    super();
    this.latitude = 0;
    this.longitude = 0;
    this.zoom = 0;
    this.isOpen = false;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mapUpdated', this._handleMapUpdated);
  }

  isMobile() {
    return window.innerWidth < 768;
  }

  _handleMapUpdated = (event) => {
    this.latitude = event.detail.lat ? event.detail.lat.toFixed(6) : this.latitude;
    this.longitude = event.detail.lng ? event.detail.lng.toFixed(6) : this.longitude;
    this.zoom = event.detail.zoom ? event.detail.zoom : this.zoom;
    this.isOpen = false;
  }

  render() {
    return html`
    ${this.isOpen ? html`
<div
  id="create-map-form"
  class="card position-relative ${this.isMobile() ? 'rounded-top' : ''}"
  @mapUpdated=${this._handleMapUpdated}
>
  <div class="card-header">
    <h6 class="card-title m-0">Configure map</h6>
  </div>
  <div class="card-body ${this.isMobile() ? 'pb-5' : ''}" style="max-height: 65vh;overflow-y: auto;">
    <form id="configForm" method="post">
      <div class="mb-3">
        <label for="email">Email <span style="color: red;">*</span></label>
        <input class="form-control" type="text" name="email" placeholder="Email">
        <div id="emailHelp" class="form-text">The API key will be sent to this email</div>
      </div>
      <div class="mb-3">
        <label for="title">Title <span style="color: red;">*</span></label>
        <input class="form-control" type="text" name="title" placeholder="Title">
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <textarea class="form-control" name="description" placeholder="Description"></textarea>
      </div>
      <div class="mb-3">
        <label for="latitude">Center <span style="color: red;">*</span></label>
        <input class="form-control" type="text" name="latitude" placeholder="Latitude" .value=${this.latitude}>
        <input class="form-control" type="text" name="longitude" placeholder="Longitude" .value=${this.longitude}>
      </div>
      <div id="zoom-container" class="mb-3">
        <label for="zoom">Zoom <span style="color: red;">*</span></label>
        <input class="form-control" type="number" name="zoom" placeholder="Zoom" .value=${this.zoom}>
      </div>
    </form>
  </div>
</div>
      ` : ''}
      <div class="d-grid ${this.isMobile() ? 'fixed-bottom p-3' : ''}">
        <button
          @click=${() => this.isOpen = true}
          id="configure-map-button"
          type="submit"
          class="btn btn-primary"
          >Configure map</button>
        </div>
    `;
  }
}
customElements.define('map-config', MapConfig);

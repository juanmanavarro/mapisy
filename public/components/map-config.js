import {LitElement, html, css, unsafeCSS} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class MapConfig extends LitElement {
  static get styles() {
    const { cssRules } = document.styleSheets[1]
    const globalStyle = css([Object.values(cssRules).map(rule =>
    rule.cssText).join('\n')])
    return [
      globalStyle,
      unsafeCSS`
      .card {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
      }
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
    isMobile: {
      type: Boolean,
    },
    validEmail: {
      type: Boolean,
    },
    validTitle: {
      type: Boolean,
    },
    validLatitude: {
      type: Boolean,
    },
    validLongitude: {
      type: Boolean,
    },
    validZoom: {
      type: Boolean,
    },
  };

  constructor() {
    super();
    this.latitude = '0';
    this.longitude = '0';
    this.zoom = '0';
    this.isMobile = false;
    this.isOpen = true;
    this.validEmail = true;
    this.validTitle = true;
    this.validLatitude = true;
    this.validLongitude = true;
    this.validZoom = true;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mapUpdated', this._handleMapUpdated);
    window.addEventListener('resize', this._handleResize);
  }

  _handleResize = () => {
    this.isMobile = window.innerWidth < 768;
    this.isOpen = !this.isMobile;
  }

  _handleMapUpdated = (event) => {
    if ( this.isMobile ) {
      this.isOpen = false;
    }

    this.latitude = event.detail.lat ? event.detail.lat.toFixed(6).toString() : this.latitude;
    this.longitude = event.detail.lng ? event.detail.lng.toFixed(6).toString() : this.longitude;
    this.zoom = event.detail.zoom ? event.detail.zoom.toString() : this.zoom;
  }

  _handleInput( evt ) {
    let { name, value } = evt.target;
    this[ name ] = value;
  }

  _handleSubmit = (event) => {
    event.preventDefault();

    if (!this.isOpen) {
      this.isOpen = true;
      return;
    }

    this.validEmail = v8n()
      .string()
      .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      .test(this.email);

    this.validTitle = v8n()
      .string()
      .minLength(1)
      .test(this.title);

    this.validLatitude = v8n()
      .string()
      .minLength(1)
      .test(this.latitude);

    this.validLongitude = v8n()
      .string()
      .minLength(1)
      .test(this.longitude);

    this.validZoom = v8n()
      .string()
      .minLength(1)
      .test(this.zoom);

    if ( !this.validEmail || !this.validTitle || !this.validLatitude || !this.validLongitude || !this.validZoom ) {
      return;
    }

    this.shadowRoot.querySelector('#configForm').submit();
  }

  render() {
    return html`
<div
  id="create-map-form"
  class="card position-relative ${this.isOpen ? 'd-block' : 'd-none'}"
  @mapUpdated=${this._handleMapUpdated}
>
  <div class="card-header">
    <h6 class="card-title m-0">Configure map</h6>
  </div>
  <div class="card-body ${this.isMobile ? 'pb-5' : ''}" style="max-height: 65vh;overflow-y: auto;">
    <form id="configForm" method="post">
      <div class="mb-3">
        <label for="email">Email <span style="color: red;">*</span></label>
        <input @change=${this._handleInput} class="form-control ${!this.validEmail ? 'is-invalid' : ''}" type="text" name="email" placeholder="Email">
        <div id="emailHelp" class="form-text">The API key will be sent to this email</div>
      </div>
      <div class="mb-3">
        <label for="title">Title <span style="color: red;">*</span></label>
        <input @change=${this._handleInput} class="form-control ${!this.validTitle ? 'is-invalid' : ''}" type="text" name="title" placeholder="Title">
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <textarea @change=${this._handleInput} class="form-control" name="description" placeholder="Description"></textarea>
      </div>
      <div class="mb-3">
        <label for="latitude">Center <span style="color: red;">*</span></label>
        <input @change=${this._handleInput} class="form-control ${!this.validLatitude ? 'is-invalid' : ''}" type="text" name="latitude" placeholder="Latitude" .value=${this.latitude}>
        <input @change=${this._handleInput} class="form-control ${!this.validLongitude ? 'is-invalid' : ''}" type="text" name="longitude" placeholder="Longitude" .value=${this.longitude}>
      </div>
      <div id="zoom-container" class="mb-3">
        <label for="zoom">Zoom <span style="color: red;">*</span></label>
        <input @change=${this._handleInput} class="form-control ${!this.validZoom ? 'is-invalid' : ''}" type="number" name="zoom" placeholder="Zoom" .value=${this.zoom}>
      </div>
      <div class="d-grid ${this.isMobile ? 'd-none' : ''}">
        <button
          @click=${this._handleSubmit}
          id="configure-map-button"
          type="submit"
          class="btn btn-primary"
        >
          Configure map
        </button>
      </div>
    </form>
  </div>
</div>
<div class="d-grid ${this.isMobile ? 'fixed-bottom p-3' : 'd-none'}">
  <button
    @click=${this._handleSubmit}
    id="configure-map-button"
    type="submit"
    class="btn btn-primary"
    >
    Configure map
  </button>
</div>
    `;
  }
}
customElements.define('map-config', MapConfig);

class Progress extends HTMLElement {
  static tagName = "cruk-progress";
  static attrs = {
    value: "value",
    max: "max",
  };
  static observedAttributes = Object.values(Progress.attrs);
  
  static documentCss = `
    @property --progress {
      syntax: "<length-percentage>";
      inherits: false;
      initial-value: 0%;
    }
  `;

  static css = `
    :host {
      display: inline-block;

      &, *, *::before, *::after {
        box-sizing: border-box;
      }

      --_bar-color: var(--cruk-progressbar__bar-color, #2e008b);
      --_track-color: var(--cruk-progressbar__track-color, #edebe9);
    }

    .progressbar {
      --_size: var(--cruk-progressbar__circle-size, 132px);
      --_bar-width: var(--cruk-progressbar__thickness, 20px);

      font-size: 2rem;
      width: var(--_size);
      aspect-ratio: 1 / 1;
      background: conic-gradient(
        var(--_bar-color),
        var(--_bar-color) var(--progress),
        var(--_track-color) 0%
      );
      border-radius: 50vmax;

      display: grid;
      place-items: center;

      /* this works thanks to the @property at the top */
      transition: --progress 600ms ease;
    }

    .progressbar::after {
      content: attr(data-valuenow) "%";
      background: white;
      width: calc(100% - var(--_bar-width));
      aspect-ratio: 1;
      border-radius: inherit;
      display: grid;
      place-items: center;
    }
  `;

  /**
    * @type { Element | undefined  null }
    * @private
    */
  #progressbar;
  
  /**
    * @returns { string }
    */
  get value() {
    return this.getAttribute(Progress.attrs.value) ?? "0";
  }

  /**
    * @param { number | string } value
    * @returns { void }
    */
  set value(value) {
    this.setAttribute(Progress.attrs.value, value);
    this.#progressbar.dataset.valuenow = this.value;
    this.#progressbar.style.setProperty("--progress", this.value + "%");
  }
  
  /**
    * @returns { string }
    */
  get max() {
    return this.getAttribute(Progress.attrs.max) ?? "100";
  }
  
  /**
    * @param { number | string } value
    * @returns { void }
    */
  set max(value) {
    this.setAttribute(Progress.attrs.max, value);
  }

  constructor() {
    super();

    const documentSheet = new CSSStyleSheet();
    documentSheet.replaceSync(Progress.documentCss);
    document.adoptedStyleSheets.push(documentSheet);
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });
    const template = document.createElement("template");

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(Progress.css);
    shadowRoot.adoptedStyleSheets = [sheet];
    template.innerHTML = `
      <div class="progressbar"></div>
    `;
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.#progressbar = shadowRoot.querySelector(".progressbar"); 

    this.setAttribute("role", "progressbar");
    this.value = this.value;
    this.setAttribute("aria-live", "polite");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) {
      return;
    }

    if (oldValue !== newValue) {
      if (name === Progress.attrs.value) {
        this.value = newValue;
      }
    }
  }
}

if ("customElements" in window) {
  customElements.define(Progress.tagName, Progress);
}

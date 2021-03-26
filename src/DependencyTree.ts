import { SentenceSVG, SentenceSVGOptions, defaultSentenceSVGOptions } from './SentenceSVG';
import { ReactiveSentence } from './ReactiveSentence';
import { annotationSchema } from './annotationSchema';
// import { UposDialog } from './components/UposDialog';

export class DependencyTree extends HTMLElement {
  conll: any;
  identifier: string = '';
  svgWrapperId: string = '';
  reactiveSentence: ReactiveSentence = new ReactiveSentence();
  sentenceSvg?: SentenceSVG;
  sentenceSVGOptions: SentenceSVGOptions = defaultSentenceSVGOptions();
  UposDialog: UposDialog | null = null;
  // shadow: ShadowRoot;
  constructor() {
    super();
    // this.shadow = this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    this.conll = this.getAttribute('conll')!;
    this.identifier = this._getElementIdentifier();
    this._attachSvgWrapper();
    this._initializeReactiveSentence();
    this._getSvgOptions();
    this._initializeSentenceSvg();
    // this.appendChild(document.createElement("button"))
    this._addSvgEventListeners();
    // console.log('KKQD');
    // this.UposDialog = document.createElement('upos-dialog') as UposDialog;
    // this.appendChild(this.UposDialog);
    // this.UposDialog.attachParent(this)
  }
  _getElementIdentifier(): string {
    let name: string | null = this.getAttribute('name');
    if (!name) {
      name = 'unnamed';
    }
    const randomInt = Math.random().toString().slice(2, 14);
    const extandedName = `${name}-${randomInt}`;
    return extandedName;
  }
  _getSvgOptions(): void {
    const interactive: string | null = this.getAttribute('interactive');
    if (interactive === 'true') {
      this.sentenceSVGOptions['interactive'] = true;
    }
    const shownFeatures: string | null = this.getAttribute('shown-features');
    if (shownFeatures) {
      this.sentenceSVGOptions['shownFeatures'] = JSON.parse(shownFeatures);
    }
  }
  _attachSvgWrapper(): void {
    const svgWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgWrapperId = `svg-wrapper--${this.identifier}`;
    svgWrapper.setAttribute('id', this.svgWrapperId);
    this.appendChild(svgWrapper);
  }
  _initializeReactiveSentence(): void {
    this.reactiveSentence.fromSentenceConll(this.conll);
  }
  _initializeSentenceSvg(): void {
    this.sentenceSvg = new SentenceSVG(this.svgWrapperId, this.reactiveSentence, this.sentenceSVGOptions);
  }
  _addSvgEventListeners(): void {
    this.sentenceSvg?.addEventListener('svg-click', (event) => {
      if (!(event instanceof CustomEvent)) throw 'not a CustomEvent';
      if (event.detail.targetLabel === 'UPOS') {
        // this.openDialog()
        // this.UposDialog?.open();
        if (!this.UposDialog) {
          this.UposDialog = document.createElement('upos-dialog') as UposDialog;
          this.UposDialog.setTreeId(this.identifier)
          this.appendChild(this.UposDialog)
          this.UposDialog.addEventListener('close', () => {
            if (this.UposDialog) {
              this.removeChild(this.UposDialog);
              this.UposDialog = null
            }
          });
        }
      }
      // if (e.detail.)
    });
  }
}

export class UposDialog extends HTMLElement {
  parent?: DependencyTree;
  treeId: string = "";
  constructor() {
    super();
  }
  setTreeId(treeId: string) {
    this.treeId = treeId
  }
  connectedCallback() {
    this.innerHTML = `
    <style>
    #${this.treeId}__dialog {
      background-color : red;
    }
    </style>
    <div id="${this.treeId}__dialog"><button id="${this.treeId}__dialog__close-button">close</button></div>`;
    const closeButton = document.getElementById(`${this.treeId}__close-button`);
    closeButton?.addEventListener('click', () => {
      const customEvent = new CustomEvent('close', { detail: 'CLOSE !' });
      this.dispatchEvent(customEvent);
    });
  }
}

customElements.define('upos-dialog', UposDialog);

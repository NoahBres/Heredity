import VizClass from "./VizClass";
import { Heredity } from "..";

export default class TopGeneViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _style = `

  `;

  private _styleId = "top-genes-style-id";

  constructor(parentElement: string | HTMLElement, heredity: Heredity) {
    this._heredity = heredity;
    if (parentElement instanceof String) {
      this._parentElement = <HTMLElement>(
        document.getElementById(<string>parentElement)
      );
    } else {
      this._parentElement = <HTMLElement>parentElement;
    }

    this._parentElement.classList.add("viz__top-genes-container");
    this.injectStylesheet(this._style, this._styleId);

    this._heredity = heredity;
  }

  init() {}

  update() {}

  link(toLink: VizClass) {
    return false;
  }

  private injectStylesheet(style: string, styleId: string) {
    const existingScript = document.getElementById(styleId);

    if (existingScript) {
      return;
    }

    const node = document.createElement("style");
    node.innerHTML = style;
    node.id = styleId;

    document.body.appendChild(node);
  }
}

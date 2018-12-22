import { default as VizClass, injectStylesheet } from "./VizClass";
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
    injectStylesheet(this._style, this._styleId);

    this._heredity = heredity;
  }

  init() {}

  update() {}

  link(toLink: VizClass) {
    return false;
  }
}

import Heredity from "../Heredity";
import { default as VizClass, injectStylesheet } from "./VizClass";

// TODO Move DNAPill to separate class

export default class TopGeneViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _style = `
    .viz__top-genes-container {
      display: flex;
      flex-wrap: wrap;
      padding: 1em;
      border: 1px solid #d0d0d0;
      border-radius: 0.3em;

      background: white;
    }
  `;

  private _styleId = "top-genes-style-id";

  constructor(parentElement: string | HTMLElement, heredity: Heredity) {
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

    // heredity.addHook("genPopPost", this, this.init);
    // heredity.addHook("nextGenPost", this, this.update);
  }

  init() {}

  update() {}

  link(toLink: VizClass) {
    return false;
  }
}

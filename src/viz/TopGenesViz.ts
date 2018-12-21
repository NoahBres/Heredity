import VizClass from "./VizClass";
import { Heredity } from "..";

export default class TopGeneViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  constructor(parentElement: string | HTMLElement, heredity: Heredity) {
    this._heredity = heredity;
    if (parentElement instanceof String) {
      this._parentElement = <HTMLElement>(
        document.getElementById(<string>parentElement)
      );
    } else {
      this._parentElement = <HTMLElement>parentElement;
    }
  }

  init(): void {
    throw new Error("Method not implemented.");
  }
  update(): void {
    throw new Error("Method not implemented.");
  }
  link(toLink: VizClass): boolean {
    throw new Error("Method not implemented.");
  }
}

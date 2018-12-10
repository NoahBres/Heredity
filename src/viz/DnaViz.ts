import Heredity from "../Heredity";
import GenericChromosome from "../chromosomes/GenericChromosome";
import VizClass from "./VizClass";

export default class DnaViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;
  _options: {};

  private _dnaPills: DnaPill[] = [];

  constructor(
    parentElement: string | HTMLElement,
    heredity: Heredity,
    options: {} = {}
  ) {
    if (parentElement instanceof String) {
      this._parentElement = <HTMLElement>(
        document.getElementById(<string>parentElement)
      );
    } else {
      this._parentElement = <HTMLElement>parentElement;
    }

    this._parentElement.style.display = "flex";
    this._parentElement.style.flexWrap = "wrap";

    this._heredity = heredity;

    this._options = options;

    heredity.addHook("genPopPost", this, this.init);
    heredity.addHook("nextGenPost", this, this.update);
  }

  init() {
    if (this._parentElement.dataset.initialized) {
      this.update();
      return;
    }

    this._heredity.chromosomes.forEach(e => {
      const dp = new DnaPill(e);
      this._dnaPills.push(dp);
      this._parentElement.appendChild(dp.element);
    });

    console.log(this._dnaPills);

    this._parentElement.dataset.initialized = "true";
  }

  update() {
    this._dnaPills = [];
    this._parentElement.innerHTML = "";

    this._heredity.chromosomes.forEach(e => {
      const dp = new DnaPill(e);
      this._dnaPills.push(dp);
      this._parentElement.appendChild(dp.element);
    });
  }
}

class DnaPill {
  private _length: number;
  private _element: HTMLDivElement;

  private _geneReps: HTMLDivElement[];

  constructor(chromosome: GenericChromosome<any>) {
    this._length = chromosome.length;

    this._element = document.createElement("div");

    this._element.style.borderRadius = "10px";
    this._element.style.overflow = "hidden";
    this._element.style.margin = "3px";

    this._geneReps = Array(this._length).fill(document.createElement("div"));
    this._geneReps.forEach((e, i) => {
      e.style.width = "10px";
      e.style.height = "10px";
      e.style.background = `hsl(${chromosome.getColorsHue()[i]},100%,50%)`;
      // this._element.appendChild(e);
      // this._element.appendChild(document.createTextNode(`${i}`));
      // Not sure why appendChild isn't working
      this._element.innerHTML += e.outerHTML;
    });
  }

  get element() {
    return this._element;
  }
}

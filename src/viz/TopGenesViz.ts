import Heredity from "../Heredity";
import {
  default as VizClass,
  cssPrefix,
  injectStylesheet,
  DnaPill
} from "./VizClass";
import GenericChromosome from "../chromosomes/GenericChromosome";

// TODO Add animation to spawn
// TODO Replace stuff with VizClass name

export default class TopGeneViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _chromosomeList: ChromosomeList[] = [];

  private _emptyTextElement: HTMLParagraphElement;

  private readonly _dnaPillClassName = `${cssPrefix}top-genes-viz-dna-pill`;

  private readonly _containerClassName = `top-genes-container`;

  private _style = `
    .${cssPrefix}${this._containerClassName} {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      
      padding: 1em;
      border: 1px solid #d0d0d0;
      border-radius: 0.3em;

      background: white;

      max-height: 400px;
      flex-direction: row;

      overflow-y: auto;
    }

    .${this._dnaPillClassName}-container {
      margin: 0.3em;

      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .${cssPrefix}${this._containerClassName} .hidden-text {
      width: 100%;
      text-align: center;
    }

    .${cssPrefix}${this._containerClassName} .hidden-text.hidden {
      display: none;
    }

    .${cssPrefix}${this._containerClassName} .generation-text,
    .${cssPrefix}${this._containerClassName} .fitness-text {
      margin: 0;
      font-size: 0.9em;
    }

    .${this._dnaPillClassName} .${this._dnaPillClassName}-gene {
      width: 0.7em!important;
      height: 0.7em!important;
    }
  `;

  private _styleId = "top-genes-style-id";

  constructor(
    parentElement: string | HTMLElement,
    heredity: Heredity,
    disableHooks: boolean = false
  ) {
    if (typeof parentElement === "string" || parentElement instanceof String) {
      this._parentElement = <HTMLElement>(
        document.getElementById(<string>parentElement)
      );
    } else {
      this._parentElement = <HTMLElement>parentElement;
    }

    this._parentElement.classList.add(
      `${cssPrefix}${this._containerClassName}`
    );
    injectStylesheet(this._style, this._styleId);

    this._heredity = heredity;

    this._emptyTextElement = document.createElement("p");
    this._emptyTextElement.innerText = "No past populations";
    this._emptyTextElement.classList.add("hidden-text");
    this._parentElement.appendChild(this._emptyTextElement);

    if (!disableHooks) {
      heredity.addHook("genPopPost", this.init, this);
      heredity.addHook("nextGenPost", this.update, this);
    }
  }

  init() {}

  update() {
    /* istanbul ignore next */
    if (!this._emptyTextElement.classList.contains("hidden")) {
      this._emptyTextElement.classList.add("hidden");
    }

    const topChromosome = this._heredity.history[
      this._heredity.history.length - 1
    ].topChromosome();

    this._chromosomeList.push({
      chromosome: topChromosome.chromosome,
      fitness: topChromosome.fitness
    });

    const pillContainer = document.createElement("div");
    pillContainer.classList.add(`${this._dnaPillClassName}-container`);

    const dp = new DnaPill(topChromosome.chromosome, this._dnaPillClassName);
    pillContainer.appendChild(dp.element);

    const generationText = document.createElement("p");
    generationText.innerText = `Gen: ${this._heredity.history.length - 1}`;
    generationText.classList.add("generation-text");
    pillContainer.appendChild(generationText);

    const fitnessText = document.createElement("p");
    fitnessText.innerText = `Fitness: ${Math.floor(
      topChromosome.fitness
    ).toString()}`;
    fitnessText.classList.add("fitness-text");
    pillContainer.appendChild(fitnessText);

    this._parentElement.insertBefore(
      pillContainer,
      this._parentElement.firstChild
    );
  }

  link(toLink: VizClass) {
    return false;
  }
}

interface ChromosomeList {
  chromosome: GenericChromosome<any>;
  fitness: number;
}

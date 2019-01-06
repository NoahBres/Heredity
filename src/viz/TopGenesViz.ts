import Heredity from "../Heredity";
import { default as VizClass, injectStylesheet, DnaPill } from "./VizClass";
import GenericChromosome from "../chromosomes/GenericChromosome";

// TODO Move DNAPill to separate class
// TODO Add animation to spawn

export default class TopGeneViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _chromosomeList: ChromosomeList[] = [];

  private _emptyTextElement: HTMLParagraphElement;

  private readonly _dnaPillClassName = "viz__top-genes-viz-dna-pill";

  private _style = `
    .viz__top-genes-container {
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

    .viz__top-genes-pill-container {
      margin: 0.3em;

      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .viz__top-genes-hidden-text {
      width: 100%;
      text-align: center;
    }

    .viz__top-genes-hidden-text.hidden {
      display: none;
    }

    .viz__top-genes-pill-container-generation-text, .viz__top-genes-pill-container-fitness-text {
      margin: 0;
      font-size: 0.9em;
    }

    .${this._dnaPillClassName} .${this._dnaPillClassName}-gene {
      width: 0.7em!important;
      height: 0.7em!important;
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

    this._emptyTextElement = document.createElement("p");
    this._emptyTextElement.innerText = "No past populations";
    this._emptyTextElement.classList.add("viz__top-genes-hidden-text");
    this._parentElement.appendChild(this._emptyTextElement);

    heredity.addHook("genPopPost", this, this.init);
    heredity.addHook("nextGenPost", this, this.update);
  }

  init() {}

  update() {
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
    pillContainer.classList.add("viz__top-genes-pill-container");

    const dp = new DnaPill(topChromosome.chromosome, this._dnaPillClassName);
    pillContainer.appendChild(dp.element);

    const generationText = document.createElement("p");
    generationText.innerText = `Gen: ${this._heredity.history.length - 1}`;
    generationText.classList.add(
      "viz__top-genes-pill-container-generation-text"
    );
    pillContainer.appendChild(generationText);

    const fitnessText = document.createElement("p");
    fitnessText.innerText = `Fitness: ${Math.floor(
      topChromosome.fitness
    ).toString()}`;
    fitnessText.classList.add("viz__top-genes-pill-container-fitness-text");
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

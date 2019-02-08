import Heredity from "../Heredity";
import {
  default as VizClass,
  cssPrefix,
  injectStylesheet,
  DnaPill
} from "./VizClass";
import GenericChromosome from "../chromosomes/GenericChromosome";

// TODO Add animation to spawn

/**
 * ## TopGenesViz
 * Visualizes a list of the highest scoring gene per generation
 *
 * #### Basic usage
 * @example
 * ```html
 *
 * <html>
 *    <body>
 *       <!-- Your html content -->
 *
 *        <div id="top-genes-viz-element">
 *            <!-- This div should be empty -->
 *        </div>
 *
 *        <script src="main.js"></script>
 *    </body>
 * </html>
 * ```
 *
 * @example
 * ```typescript
 *
 * import { Heredity } from "heredity";
 * import { TopGenesViz } from "heredity";
 *
 * const heredity = new Heredity({
 *    populationSize: 50,
 *    templateChromosome: new NumberChromosome({}, 5)
 * });
 *
 * const topGeneViz = new TopGeneViz(
 *    document.getElementById("top-gene-viz"),
 *    heredity
 * );
 *
 * // TopGeneViz will now automatically update by itself.
 * // No need to do anything else
 *
 * heredity.generatePopulation();
 * // TopGeneViz will auto update
 * heredity.nextGeneration();
 * // TopGeneViz will auto update
 * ```
 *
 * #### Note:
 * VizClass visualizations are designed to be set and forget. Meaning you simply initialize the
 * object and it will handle updating by itself automatically. It does this by utilizing the
 * addHook() function of Heredity. If you would like to control updating yourself, disable hooks through the disableHook parameter.
 */
export default class TopGenesViz implements VizClass {
  /** Parent of Heredity object  */
  _heredity: Heredity;
  /** Parent HTML element */
  _parentElement: HTMLElement;

  /** List of chromosomes to represent */
  private _chromosomeList: ChromosomeList[] = [];

  /** Text element indicating an empty list */
  private _emptyTextElement: HTMLParagraphElement;

  /** Style classname of the DnaPill */
  private readonly _dnaPillClassName = `${cssPrefix}top-genes-viz-dna-pill`;

  /** Style classname of the container div */
  private readonly _containerClassName = `top-genes-container`;

  /** Styling for the TopGenesViz component */
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

  /** ID given to the style element */
  private _styleId = "top-genes-style-id";

  /**
   * TopGenesViz can be initialized with either a string or HTMLElement as the first parameter.
   * Setting the parentElement parameter to a string will simply do a document.getElementById("") search
   *
   * @example
   * ```typescript
   * const heredity = new Heredity({
   *    populationSize: 50,
   *    templateChromosome: new NumberChromosome({}, 5)
   * });
   *
   * // Set by string id
   * const topGenesViz = new TopGenesViz('top-genes-viz-element', heredity);
   *
   * // Or set by manual html element
   * const topGenesViz = new TopGenesViz(document.getElementById('top-genes-viz-element'), heredity);
   *
   * // Disable hooks to control updates yourself
   * const topGenesViz = new TopGenesViz('top-genes-viz-element', heredity, false);
   * heredity.generatePopulation(); // topGenesViz.update() won't automatically be called
   * ```
   *
   * @param parentElement HTML element that the visualization will insert itself in. Should be a blank div.
   * @param heredity Heredity object where ChartViz will pull it's data from
   * @param disableHooks Choose to disable hooking into Heredity for manual control of the init and update functions
   */
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

  /** Initialize TopGenesViz. Doesn't do anything */
  init() {}

  /** Update TopGenesViz. Adds new pill upon update */
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

  /**
   * Allows visualizations to link and pass data to each other.
   * TopGenesViz doesn't link with anything else.
   *
   * @param toLink Visualization to link together
   */
  link(toLink: VizClass) {
    return false;
  }
}

/** Type checking for the chromosomeList */
interface ChromosomeList {
  chromosome: GenericChromosome<any>;
  fitness: number;
}

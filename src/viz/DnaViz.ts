import Heredity from "../Heredity";
import GenericChromosome from "../chromosomes/GenericChromosome";
import {
  default as VizClass,
  cssPrefix,
  injectStylesheet,
  DnaPill
} from "./VizClass";
import PerceptronViz from "./PerceptronViz";

// TODO Optimize by minimizing DOM manipulation
// Don't delete DOM on refresh
// TODO make it so that DnaPills aren't cleared on update and just update it's values

/**
 * ## DnaViz
 * Visualizes the DNA with colorful little pills
 *
 * #### Basic usage
 * @example
 * ```html
 *
 * <html>
 *    <body>
 *       <!-- Your html content -->
 *
 *        <div id="dna-viz-element">
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
 * import { ChartViz } from "heredity";
 *
 * const heredity = new Heredity({
 *    populationSize: 50,
 *    templateChromosome: new NumberChromosome({}, 5)
 * });
 *
 * const dnaViz = new DnaViz(
 *    doucment.getElementById("dna-viz-element"),
 *    heredity
 * );
 *
 * // DnaViz will now automatically update by itself.
 * // No need to do anything else
 *
 * heredity.generatePopulation();
 * // DnaViz will update
 * heredity.nextGeneration();
 * // DnaViz will update
 * ```
 *
 *
 * #### Note:
 * VizClass visualizations are designed to be set and forget. Meaning you simply initialize the
 * object and it will handle updating by itself automatically. It does this by utilizing the
 * addHook() function of Heredity. If you would like to control updating yourself, disable hooks through the disableHook parameter.
 *
 */
export default class DnaViz implements VizClass {
  /** Parent Heredity object */
  _heredity: Heredity;
  /** Parent HTML element */
  _parentElement: HTMLElement;

  /** Class name to prepend to children elements. Used to manage styling. */
  private readonly _containerClassName = "dna-viz-container";

  /** Map of DNA pills. Each DnaPill object is linked to its respective chromosome  */
  private _dnaPills: Map<GenericChromosome<any>, DnaPill> = new Map();

  /** PRevious chromosomeList. Checks to see if the list has changed to optimzie updates.  */
  private _lastChromosomeList: GenericChromosome<any>[] = [];

  /** List of the onPillHover listeners */
  private _onPillHoverListeners: PillListenerObject[] = [];
  /** List of the onPillHoverLeave listeners */
  private _onPillHoverLeaveListeners: PillListenerObject[] = [];

  /** Styling of the DnaViz component */
  private _style = `
    .${cssPrefix}${this._containerClassName} {
      display: flex;
      flex-wrap: wrap;
      padding: 1em;
      border: 1px solid #d0d0d0;
      border-radius: 0.3em;

      background: white;
    }
  `;

  /** ID given to the style element */
  private _styleId = "dna-viz-style-id";

  /**
   * DnatViz can be initialized with either a string or HTMLElement as the first parameter.
   * Setting the parentElement parameter to a string will simply do a document.getElementById("") search
   *
   * @example
   * ```typescript
   *
   * const heredity = new Heredity({
   *    populationSize: 50,
   *    templateChromosome: new NumberChromosome({}, 5)
   * });
   *
   * // Set by string id
   * const dnaViz = new DnaViz('dna-viz-element', heredity);
   *
   * // Or set by manual html element
   * const dnaViz = new DnaViz(document.getElementById('dna-viz-element'), heredity);
   *
   * // Disable hooks to control updates yourself
   * const dna = new DnaViz('dna-viz-element', heredity, false);
   * heredity.generatePopulation(); // dna.update() won't automatically be called
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

    if (!disableHooks) {
      heredity.addHook("genPopPost", this.init, this);
      heredity.addHook("nextGenPost", this.update, this);
    }
  }

  /** Initialize DnaViz. Adds onChange tag listeners. Creates DnaPills. */
  init() {
    this._heredity.chromosomes.forEach(c => {
      c.tags.onChange(this, chromosome => {
        // To suppress object is possibly undefined error
        const pilly = this._dnaPills.get(chromosome);
        /* istanbul ignore next */
        if (pilly) pilly!.update();
      });
    });

    if (this._parentElement.dataset.initialized) {
      this.update();
      return;
    }

    this._heredity.chromosomes.forEach(e => {
      const dp = new DnaPill(e);
      dp.onHover(chromosome => {
        this._onPillHoverListeners.forEach(l => {
          l.listener.apply(l.thisVal, [chromosome]);
        });
      }, this);
      dp.onHoverLeave(chromosome => {
        this._onPillHoverLeaveListeners.forEach(l => {
          l.listener.apply(l.thisVal, [chromosome]);
        });
      }, this);

      this._dnaPills.set(e, dp);
      this._parentElement.appendChild(dp.element);
    });

    this._parentElement.dataset.initialized = "true";
  }

  /** Update DnaViz. Clears DnaPills and adds new ones */
  update() {
    if (this._heredity.chromosomes !== this._lastChromosomeList) {
      this._dnaPills.clear();
      this._parentElement.innerHTML = "";

      this._heredity.chromosomes.forEach(e => {
        const dp = new DnaPill(e);
        dp.onHover(chromosome => {
          this._onPillHoverListeners.forEach(l => {
            l.listener.apply(l.thisVal, [chromosome]);
          });
        }, this);
        dp.onHoverLeave(chromosome => {
          this._onPillHoverLeaveListeners.forEach(l => {
            l.listener.apply(l.thisVal, [chromosome]);
          });
        }, this);

        this._dnaPills.set(e, dp);
        this._parentElement.appendChild(dp.element);
      });

      this._heredity.chromosomes.forEach(c => {
        c.tags.onChange(this, chromosome => {
          // To suppress object is possibly undefined error
          const pilly = this._dnaPills.get(chromosome);
          /* istanbul ignore next */
          if (pilly) {
            pilly!.update();
          }
        });
      });

      this._lastChromosomeList = this._heredity.chromosomes;
    }

    // Not optimized well
    // for (let i = 0; i < this._dnaPills.length; i++) {
    //   this._dnaPills[i].update();
    // }
  }

  /**
   * Adds a listener that is called on a DnaPill hover event
   *
   * @param listener Function that will be called on hover
   * @param thisVal `this` value that will be bound on function call
   *
   * @example
   * ```typescript
   *
   * dnaViz.onPillHover(() => {
   *       console.log("This is called on hover");
   *    },
   *    this // <-- setting this is optional but may fix some errors
   * );
   * ```
   */
  onPillHover(
    listener: (chromosome: GenericChromosome<any>) => void,
    thisVal?: any
  ) {
    this._onPillHoverListeners.push({ thisVal, listener });
  }

  /**
   * Adds a listener that is called on a DnaPill hover leave event
   *
   * @param listener
   * @param thisVal
   *
   * @example
   * ```typescript
   *
   * dnaViz.onPillHoverLeave(() => {
   *       console.log("This is called on hover leave");
   *    },
   *    this // <-- setting this is optional but may fix some errors
   * );
   * ```
   */
  onPillHoverLeave(
    listener: (chromosome: GenericChromosome<any>) => void,
    thisVal?: any
  ) {
    this._onPillHoverLeaveListeners.push({ thisVal, listener });
  }

  /**
   * Allows visualizations to link and pass data to each other.
   * DnaViz can link to PerceptronViz
   * Linking these two will allow PerceptronViz to show the perceptron of the hovered DNA Pill
   *
   * @param toLink Visualization to link together
   */
  link(toLink: VizClass): boolean {
    if (toLink instanceof PerceptronViz) {
      return toLink.link(this);
    }
    return false;
  }
}

/** Type checking for the pill listener parameters */
interface PillListenerObject {
  thisVal: any;
  listener: (chromosome: GenericChromosome<any>) => void;
}

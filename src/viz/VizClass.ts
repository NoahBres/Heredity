import { default as Heredity } from "../Heredity";
import GenericChromosome from "../chromosomes/GenericChromosome";

/** Prefix for visualization css classes */
const cssPrefix = "heredity-viz__";
export { cssPrefix };

/**
 * ## VizClass
 * Interface for implementing visualizations.
 *
 * Only used for Typescript projects
 *
 * @example
 * ```typescript
 * class DnaViz implements VizClass {
 *    _heredity: Heredity;
 *    _parentElement: HTMLElement;
 *
 *    init() {}
 *    update() {}
 *    link() {}
 * }
 * ```
 */
export default interface VizClass {
  readonly _heredity: Heredity;
  readonly _parentElement: HTMLElement;

  init(): void;
  update(): void;
  link(toLink: VizClass): boolean;
}

/**
 * Injects css styles into a page
 *
 * @param style Takes css styles as a string
 * @param styleId Pass in an id to append to the <style> element. Ensures that you don't inject the same stylesheet
 */
export function injectStylesheet(style: string, styleId?: string) {
  if (styleId && document.getElementById(styleId)) return;

  const node = document.createElement("style");
  node.innerHTML = style;
  if (styleId) node.id = styleId;

  document.head!.appendChild(node);
}

/**
 * ## DnaPill
 * Component used to visualize chromosome
 *
 * @example
 * ```typescript
 * import { DnaPill } from 'heredity';
 *
 * const chrom = new NumberChromosome({}, 5).generate();
 *
 * const dp = new DnaPill(chrom);
 *
 * document.body.appendChild(dp.element);
 *
 * // Change chromosome
 * dp.setChromosome(new NumberChromosome({}, 5).generate());
 *
 * // Update
 * dp.update();
 *
 * // Set hover listener
 * dp.onHover(() => { console.log("I'm called on hover"); });
 * dp.onHoverLeave(() => { console.log("I'm called on hover leave"); });
 * ```
 */
export class DnaPill {
  /** Constructed HTML element */
  private _element: HTMLDivElement;

  /** HTML Element representing each gene */
  private _geneReps: HTMLDivElement[];

  /** Chromosome to represent */
  private _chromosome: GenericChromosome<any>;

  /** List of hover listeners */
  private _onHoverListeners: PillListenerObject[] = [];
  /** List of hover leave listeners */
  private _onHoverLeaveListeners: PillListenerObject[] = [];

  /** CSS class to manage styles */
  private readonly _baseClassName = "viz__base-dna-pill";
  /** Alternative class name. Allows user to set additional CSS class for custom styling. */
  private _alternativeClassName = "";

  /** Styling for the DnaPill component */
  private _style = `
    .${this._baseClassName} {
      display: inline-block;

      border-radius: 0.5em;
      margin: 0.3em;

      box-shadow: 0px 4px 11px 0px rgba(0, 0, 0, 0.12);    
    
      transition: 300ms ease;
    }
    
    .${this._baseClassName}.dead {
      box-shadow: none;
      opacity: 0.5;
      
      transform: scale(0.8);
    }
    
    .${this._baseClassName}:hover {
      opacity: 1;
      transform: scale(1);
      cursor: pointer;
    }
    
    .${this._baseClassName} .${this._baseClassName}-gene {
      width: 0.8em;
      height: 0.8em;

      position: relative;
    }

    .${this._baseClassName} .${this._baseClassName}-gene:first-child {
      border-top-left-radius: 0.5em;
      border-top-right-radius: 0.5em;
    }

    .${this._baseClassName} .${this._baseClassName}-gene:last-child {
      border-bottom-left-radius: 0.5em;
      border-bottom-right-radius: 0.5em;
    }

    .${this._baseClassName} .${this._baseClassName}-gene:hover {
      border: 2px solid red;
    }

    .${this._baseClassName} .${this._baseClassName}-gene:before {
      content: attr(data-value);
      
      position: absolute;
      top: 50%;
      right: 180%;

      transform: translateY(-50%) translateX(1em);

      padding: 0.3em 0.6em;

      background: white;

      font-size: 0.8em;

      opacity: 0;
      z-index: 99;
      pointer-events: none;

      box-shadow: 0px 4px 11px 0px rgba(0, 0, 0, 0.12);
      border: 1px solid #d0d0d0;
      border-radius: 0.3em;

      transition: 300ms ease;
    }

    .${this._baseClassName} .${this._baseClassName}-gene:hover:before {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
    `;

  /** ID given to the element */
  private _styleId = "dna-pill-style-id";

  /** Dirty tag. Indicates whether or not to update dom when update() is called for optimization purposes. */
  private _dirty = false;

  /**
   * DnaPill is initialized with a chromosome. Chromosome must implement getColorsHue() to work correctly.
   * DnaPill can be initialized with an optional class that you can use to style on your own.
   *
   * @param chromosome Chromosome to represent
   * @param className Class name appended to the container element
   */
  constructor(chromosome: GenericChromosome<any>, className?: string) {
    this._chromosome = chromosome;

    this._element = document.createElement("div");

    this._element.classList.add(this._baseClassName);
    this._alternativeClassName = className ? className : "";
    if (this._alternativeClassName.length > 0) {
      this._element.classList.add(this._alternativeClassName);
    }

    this._geneReps = Array(this._chromosome.length).fill(
      document.createElement("div")
    );

    this._geneReps.forEach((e, i) => {
      e.classList.add(`${this._baseClassName}-gene`);
      if (this._alternativeClassName.length > 0) {
        e.classList.add(`${this._alternativeClassName}-gene`);
      }
      e.style.background = `hsl(${chromosome.getColorsHue()[i]},100%,60%)`;
      e.dataset.value = chromosome.genes[i].toString();
      // this._element.appendChild(e);
      // this._element.appendChild(document.createTextNode(`${i}`));
      // Not sure why appendChild isn't working
      this._element.innerHTML += e.outerHTML;
    });

    this._element.addEventListener("mouseover", () => {
      this._onHoverListeners.forEach(fn => {
        fn.listener.apply(fn.thisVal, [this._chromosome]);
      });
    });

    this._element.addEventListener("mouseleave", () => {
      this._onHoverLeaveListeners.forEach(fn => {
        fn.listener.apply(fn.thisVal, [this._chromosome]);
      });
    });

    injectStylesheet(this._style, this._styleId);
  }

  /** Update DnaPill. Checks for tags. If dirty, clears children and insert new updated values */
  update() {
    if (this._chromosome.tags.has("dead")) {
      this._element.classList.add("dead");
    } else {
      this._element.classList.remove("dead");
    }

    if (this._dirty) {
      this._element.innerHTML = "";

      // TODO Optimize this. Update DOM rather than deleting and readding
      this._geneReps.forEach((e, i) => {
        e.className = `${this._baseClassName}-gene`;
        if (this._alternativeClassName.length > 0) {
          e.classList.add(`${this._alternativeClassName}-gene`);
        }
        e.style.background = `hsl(${
          this._chromosome.getColorsHue()[i]
        },100%,60%)`;
        e.dataset.value = this._chromosome.genes[i].toString();
        // this._element.appendChild(e);
        // this._element.appendChild(document.createTextNode(`${i}`));
        // Not sure why appendChild isn't working
        this._element.innerHTML += e.outerHTML;
      });

      this._dirty = false;
    }
  }

  /**
   * Set a new chromosome to represent
   * @param chromosome Chromosome to represent
   */
  setChromosome(chromosome: GenericChromosome<any>) {
    this._chromosome = chromosome;
    this._dirty = true;
  }

  /**
   * Adds a listener that is called on a DnaPill hover event
   *
   * @param listener Function that will be called on hover
   * @param thisVal `this` value that will be bound on function call
   */
  onHover(
    listener: (chromosome: GenericChromosome<any>) => void,
    thisVal?: any
  ) {
    this._onHoverListeners.push({ thisVal, listener });
  }

  /**
   * Adds a listener that is called on DnaPill hover leave event
   *
   * @param listener Function that will be called on hover leave
   * @param thisVal `this` value that will be bound on function call
   */
  onHoverLeave(
    listener: (chromosome: GenericChromosome<any>) => void,
    thisVal?: any
  ) {
    this._onHoverLeaveListeners.push({ thisVal, listener });
  }

  /**
   * Set alternative class name. This allows you to set an additional css class name for custom styling.
   */
  set alternativeClassName(className: string) {
    this._alternativeClassName = className;
    this._dirty = true;
  }

  /**
   * Returns the default css class name appended to the pill. Can be used for custom styling.
   */
  get baseClassName(): string {
    return this._baseClassName;
  }

  /** Returns the HTML Element containing the pill. */
  get element(): HTMLDivElement {
    return this._element;
  }
}

/** Type checking for the pill lisstener parameters */
interface PillListenerObject {
  thisVal: any;
  listener: (chromosome: GenericChromosome<any>) => void;
}

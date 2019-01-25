import { default as Heredity } from "../Heredity";
import GenericChromosome from "../chromosomes/GenericChromosome";

const cssPrefix = "heredity-viz__";
export { cssPrefix };

export default interface VizClass {
  readonly _heredity: Heredity;
  readonly _parentElement: HTMLElement;

  init(): void;
  update(): void;
  link(toLink: VizClass): boolean;
}

export function injectStylesheet(style: string, styleId: string) {
  const existingScript = document.getElementById(styleId);

  if (existingScript) {
    return;
  }

  const node = document.createElement("style");
  node.innerHTML = style;
  node.id = styleId;

  document.head!.appendChild(node);
}

export class DnaPill {
  private _element: HTMLDivElement;

  private _geneReps: HTMLDivElement[];

  private _chromosome: GenericChromosome<any>;

  private _onHoverListeners: PillListenerObject[] = [];
  private _onHoverLeaveListeners: PillListenerObject[] = [];

  private readonly _baseClassName = "viz__base-dna-pill";
  private _alternativeClassName = "";

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

  private _styleId = "dna-pill-style-id";

  private _dirty = false;

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

  setChromosome(chromosome: GenericChromosome<any>) {
    this._chromosome = chromosome;
    this._dirty = true;
  }

  onHover(
    thisVal: any,
    listener: (chromosome: GenericChromosome<any>) => void
  ) {
    this._onHoverListeners.push({ thisVal, listener });
  }

  onHoverLeave(
    thisVal: any,
    listener: (chromosome: GenericChromosome<any>) => void
  ) {
    this._onHoverLeaveListeners.push({ thisVal, listener });
  }

  set alternativeClassName(className: string) {
    this._alternativeClassName = className;
    this._dirty = true;
  }

  get baseClassName(): string {
    return this._baseClassName;
  }

  get element(): HTMLDivElement {
    return this._element;
  }
}

interface PillListenerObject {
  thisVal: any;
  listener: (chromosome: GenericChromosome<any>) => void;
}

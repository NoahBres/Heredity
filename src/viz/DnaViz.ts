import Heredity from "../Heredity";
import GenericChromosome from "../chromosomes/GenericChromosome";
import VizClass from "./VizClass";
import PerceptronViz from "./PerceptronViz";

export default class DnaViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _dnaPills: Map<GenericChromosome<any>, DnaPill> = new Map();

  private _lastChromosomeList = [];

  private _onPillHoverListeners: PillListenerObject[] = [];
  private _onPillHoverLeaveListeners: PillListenerObject[] = [];

  private _style = `
    .viz__dna-container {
      display: flex;
      flex-wrap: wrap;
      padding: 1em;
      border: 1px solid #d0d0d0;
      border-radius: 0.3em;

      background: white;
    }
  
    .viz__dna-pill {
      border-radius: 0.5em;
      margin: 0.3em;

      box-shadow: 0px 4px 11px 0px rgba(0, 0, 0, 0.12);    
    
      transition: 300ms ease;
    }
    
    .viz__dna-pill.dead {
      box-shadow: none;
      opacity: 0.5;
      
      transform: scale(0.8);
    }
    
    .viz__dna-pill:hover {
      opacity: 1;
      transform: scale(1);
      cursor: pointer;
    }
    
    .viz__dna-pill .viz__dna-pill-gene {
      width: 0.8em;
      height: 0.8em;

      position: relative;
    }

    .viz__dna-pill .viz__dna-pill-gene:first-child {
      border-top-left-radius: 0.5em;
      border-top-right-radius: 0.5em;
    }

    .viz__dna-pill .viz__dna-pill-gene:last-child {
      border-bottom-left-radius: 0.5em;
      border-bottom-right-radius: 0.5em;
    }

    .viz__dna-pill .viz__dna-pill-gene:hover {
      border: 2px solid red;
    }

    .viz__dna-pill .viz__dna-pill-gene:before {
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

    .viz__dna-pill .viz__dna-pill-gene:hover:before {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  `;

  private _styleId = "dna-viz-style-id";

  constructor(parentElement: string | HTMLElement, heredity: Heredity) {
    if (parentElement instanceof String) {
      this._parentElement = <HTMLElement>(
        document.getElementById(<string>parentElement)
      );
    } else {
      this._parentElement = <HTMLElement>parentElement;
    }

    this._parentElement.classList.add("viz__dna-container");
    this.injectStylesheet(this._style, this._styleId);

    this._heredity = heredity;

    heredity.addHook("genPopPost", this, this.init);
    heredity.addHook("nextGenPost", this, this.update);
  }

  init() {
    this._heredity.chromosomes.forEach(c => {
      c.tags.onChange(this, chromosome => {
        // To suppress object is possibly undefined error
        const pilly = this._dnaPills.get(chromosome);
        if (pilly) pilly!.update();
      });
    });

    if (this._parentElement.dataset.initialized) {
      this.update();
      return;
    }

    this._heredity.chromosomes.forEach(e => {
      const dp = new DnaPill(e, this);

      this._dnaPills.set(e, dp);
      this._parentElement.appendChild(dp.element);
    });

    this._parentElement.dataset.initialized = "true";
  }

  update() {
    if (this._heredity.chromosomes !== this._lastChromosomeList) {
      this._dnaPills.clear();
      this._parentElement.innerHTML = "";

      this._heredity.chromosomes.forEach(e => {
        const dp = new DnaPill(e, this);
        this._dnaPills.set(e, dp);
        this._parentElement.appendChild(dp.element);
      });

      this._heredity.chromosomes.forEach(c => {
        c.tags.onChange(this, chromosome => {
          // To suppress object is possibly undefined error
          const pilly = this._dnaPills.get(chromosome);
          if (pilly) {
            pilly!.update();
          }
        });
      });
    }

    // Not optimized well
    // for (let i = 0; i < this._dnaPills.length; i++) {
    //   this._dnaPills[i].update();
    // }
  }

  private injectStylesheet(style: string, styleId: string) {
    const existingScript = document.getElementById(styleId);

    if (existingScript) {
      return;
    }

    const node = document.createElement("style");
    node.innerHTML = style;
    node.id = styleId;

    document.body.appendChild(node);
  }

  onPillHover(
    thisVal: any,
    listener: (chromosome: GenericChromosome<any>) => void
  ) {
    this._onPillHoverListeners.push({ thisVal, listener });
  }

  onPillHoverLeave(
    thisVal: any,
    listener: (chromosome: GenericChromosome<any>) => void
  ) {
    this._onPillHoverLeaveListeners.push({ thisVal, listener });
  }

  childCallingMouseHover(chromosome: GenericChromosome<any>) {
    this._onPillHoverListeners.forEach(l => {
      l.listener.apply(l.thisVal, [chromosome]);
    });
  }

  childCallingMouseHoverLeave(chromosome: GenericChromosome<any>) {
    this._onPillHoverLeaveListeners.forEach(l => {
      l.listener.apply(l.thisVal, [chromosome]);
    });
  }

  link(toLink: VizClass): boolean {
    if (toLink instanceof PerceptronViz) {
      toLink.link(this);
      return true;
    }
    return false;
  }
}

class DnaPill {
  private _element: HTMLDivElement;

  private _geneReps: HTMLDivElement[];

  private _chromosome: GenericChromosome<any>;
  private _dnaViz: DnaViz;

  constructor(chromosome: GenericChromosome<any>, dnaViz: DnaViz) {
    this._chromosome = chromosome;
    this._dnaViz = dnaViz;

    this._element = document.createElement("div");

    this._element.className = "viz__dna-pill";

    this._geneReps = Array(this._chromosome.length).fill(
      document.createElement("div")
    );
    this._geneReps.forEach((e, i) => {
      e.className = "viz__dna-pill-gene";
      e.style.background = `hsl(${chromosome.getColorsHue()[i]},100%,60%)`;
      e.dataset.value = chromosome.genes[i];
      // this._element.appendChild(e);
      // this._element.appendChild(document.createTextNode(`${i}`));
      // Not sure why appendChild isn't working
      this._element.innerHTML += e.outerHTML;
    });

    this._element.addEventListener("mouseover", () => {
      this._dnaViz.childCallingMouseHover(this._chromosome);
    });

    this._element.addEventListener("mouseleave", () => {
      this._dnaViz.childCallingMouseHoverLeave(this._chromosome);
    });
  }

  get element() {
    return this._element;
  }

  update() {
    if (this._chromosome.tags.has("dead")) {
      this._element.classList.add("dead");
    }
  }
}

interface PillListenerObject {
  thisVal: any;
  listener: (chromosome: GenericChromosome<any>) => void;
}

import Heredity from "../Heredity";
import GenericChromosome from "../chromosomes/GenericChromosome";
import { default as VizClass, injectStylesheet, DnaPill } from "./VizClass";
import PerceptronViz from "./PerceptronViz";

// TODO Optimize by minimizing DOM manipulation
// Don't delete DOM on refresh
// TODO Move DNAPill to separate class

export default class DnaViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _dnaPills: Map<GenericChromosome<any>, DnaPill> = new Map();

  private _lastChromosomeList: GenericChromosome<any>[] = [];

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
  `;

  private _styleId = "dna-viz-style-id";

  constructor(parentElement: string | HTMLElement, heredity: Heredity) {
    if (typeof parentElement === "string" || parentElement instanceof String) {
      this._parentElement = <HTMLElement>(
        document.getElementById(<string>parentElement)
      );
    } else {
      this._parentElement = <HTMLElement>parentElement;
    }

    this._parentElement.classList.add("viz__dna-container");
    injectStylesheet(this._style, this._styleId);

    this._heredity = heredity;

    heredity.addHook("genPopPost", this.init, this);
    heredity.addHook("nextGenPost", this.update, this);
  }

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
      dp.onHover(this, chromosome => {
        this._onPillHoverListeners.forEach(l => {
          l.listener.apply(l.thisVal, [chromosome]);
        });
      });
      dp.onHoverLeave(this, chromosome => {
        this._onPillHoverLeaveListeners.forEach(l => {
          l.listener.apply(l.thisVal, [chromosome]);
        });
      });

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
        const dp = new DnaPill(e);
        dp.onHover(this, chromosome => {
          this._onPillHoverListeners.forEach(l => {
            l.listener.apply(l.thisVal, [chromosome]);
          });
        });
        dp.onHoverLeave(this, chromosome => {
          this._onPillHoverLeaveListeners.forEach(l => {
            l.listener.apply(l.thisVal, [chromosome]);
          });
        });

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

  link(toLink: VizClass): boolean {
    if (toLink instanceof PerceptronViz) {
      return toLink.link(this);
    }
    return false;
  }
}

interface PillListenerObject {
  thisVal: any;
  listener: (chromosome: GenericChromosome<any>) => void;
}

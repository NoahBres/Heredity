import Heredity from "../Heredity";
import { default as VizClass, injectStylesheet, cssPrefix } from "./VizClass";
import * as SVG from "svg.js";

export default class ChartViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private readonly _containerClassName = "chart-container";

  private _canvas?: SVG.Doc;
  private readonly _canvasId = `${cssPrefix}chart-viz-canvas`;

  private _axisXLine?: SVG.Rect;
  private _axisYLine?: SVG.Rect;

  private _axisStrokeWidth = 1;

  private _xAxisTicks: XAxisTick[] = [];

  private _margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  private _bounds?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  private _graphWidth = 0;
  private _graphHeight = 0;

  private _chartData: ChartDataType = {
    topFitness: {
      name: "Top Fitness",
      values: [],
      lineColor: "#f5a623"
    },
    fitness: {
      name: "Fitness",
      values: [],
      lineColor: "0076ff"
    }
  };

  private _style = `
    .${cssPrefix}${this._containerClassName} {
      display: flex;
      flex-direction: column-reverse;
      
      background: white;
      border-radius: 0.3em;
      border: 1px solid #d0d0d0;
      
      height: 230px;

      position: relative;
    }
    
    .${cssPrefix}${this._containerClassName} .legend-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .${cssPrefix}${this._containerClassName} .legend-color {
      height: 0.5em;
      width: 0.5em;
      
      margin: 0 0.45em;
      margin-top: 0.2em;
      margin-left: 1em;
      
      background: red;

      border-radius: 0.15em;
    }
    
    .${cssPrefix}${this._containerClassName} .legend-color.yellow {
      background: #f5a623;
    }
    
    .${cssPrefix}${this._containerClassName} .legend-color.blue {
      background: #0076ff;
    }
  `;

  private _styleId = "chart-viz-style-id";

  constructor(parentElement: string | HTMLElement, heredity: Heredity) {
    if (parentElement instanceof String) {
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

    const canvas = document.createElement("div");
    canvas.id = this._canvasId;
    this._parentElement.appendChild(canvas);

    this._heredity = heredity;

    heredity.addHook("genPopPost", this, this.init);
    heredity.addHook("nextGenPost", this, this.update);
  }

  init() {
    if (this._parentElement.dataset.initialized) {
      this.update();
      return;
    }

    this._margin = {
      top: 30,
      right: 50,
      bottom: 30,
      left: 50
    };

    this._bounds = {
      top: this._margin.top,
      right: this._parentElement.clientWidth - this._margin.left,
      bottom: this._parentElement.clientHeight - this._margin.bottom,
      left: this._margin.left
    };

    this._graphWidth = this._bounds.right - this._bounds.left;
    this._graphHeight = this._bounds.bottom - this._bounds.top;

    this._canvas = SVG(this._canvasId);

    this._axisXLine = this._canvas
      .rect(this._bounds.right - this._bounds.left, this._axisStrokeWidth)
      .fill("#4c4c4c")
      .move(this._bounds.left, this._bounds.bottom);
    this._axisYLine = this._canvas
      .rect(this._axisStrokeWidth, this._bounds.bottom - this._bounds.top)
      .fill("#4c4c4c")
      .move(this._bounds.left, this._bounds.top);

    // const legendContainer = document.createElement("div");
    // legendContainer.classList.add("legend-container");

    // const fitnessLegend = document.createElement("p");
    // const topFitnessLegend = document.createElement("p");
    // fitnessLegend.innerText = "Fitness";
    // topFitnessLegend.innerText = "Top Fitness";

    // const fitnessColor = document.createElement("div");
    // const topFitnessColor = document.createElement("div");
    // fitnessColor.classList.add("legend-color");
    // fitnessColor.classList.add("yellow");
    // topFitnessColor.classList.add("legend-color");
    // topFitnessColor.classList.add("blue");

    // legendContainer.appendChild(fitnessColor);
    // legendContainer.appendChild(fitnessLegend);
    // legendContainer.appendChild(topFitnessColor);
    // legendContainer.appendChild(topFitnessLegend);
    // this._parentElement.appendChild(legendContainer);

    // this.update();

    this._parentElement.dataset.initialized = "true";
  }

  update() {
    const latestFitness = this._heredity.history[
      this._heredity.history.length - 1
    ].topChromosome().fitness;

    this._chartData.fitness.values.push(latestFitness);
    const topFitness =
      this._chartData.topFitness.values.length === 0
        ? 0
        : this._chartData.topFitness.values[
            this._chartData.topFitness.values.length - 1
          ];
    this._chartData.topFitness.values.push(Math.max(latestFitness, topFitness));

    const xMax = this._chartData.fitness.values.length - 1;
    this._xAxisTicks.forEach((n, i) => {
      n.x = (i / xMax) * this._graphWidth + this._bounds!.left;
    });

    this._xAxisTicks.push(
      new XAxisTick(
        this._bounds!.right,
        this._bounds!.bottom,
        6,
        (this._chartData.fitness.values.length - 1).toString(),
        this._canvas!
      )
    );

    for (const key in this._chartData) {
      const chartObj = this._chartData[key];

      const yMax = Math.max(...chartObj.values);
      const yMin = Math.min(...chartObj.values);
    }
  }

  link(toLink: VizClass): boolean {
    return false;
  }
}

abstract class AxisTick {
  protected _x: number;
  protected _y: number;
  protected _height: number;
  protected _width = 1;
  protected _margin = 3;
  protected _value: string;

  protected _draw: SVG.Doc;

  protected _group?: SVG.G;

  constructor(
    x: number,
    y: number,
    height: number,
    value: string,
    draw: SVG.Doc
  ) {
    this._x = x;
    this._y = y;
    this._height = height;
    this._value = value;

    this._draw = draw;

    this.init();
  }

  abstract init(): void;
}

class XAxisTick extends AxisTick {
  init() {
    this._group = this._draw.group().move(this._x, this._y);

    const line = this._draw
      .rect(this._width, this._height)
      .move(-this._width, 0)
      .fill("#4c4c4c");

    const text = this._draw
      .plain(this._value)
      .font({ size: 11 })
      .cx(0)
      .y(this._height + this._margin);

    this._group.add(line);
    this._group.add(text);
  }

  set x(x: number) {
    this._x = x + this._width;
    this._group!.animate(300, ">").x(this._x);
  }
}

interface ChartDataType {
  [key: string]: ChartDataFitnessType;
  topFitness: ChartDataFitnessType;
  fitness: ChartDataFitnessType;
}

interface ChartDataFitnessType {
  name: string;
  values: number[];
  lineColor: string;
}

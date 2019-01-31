import Heredity from "../Heredity";
import { default as VizClass, injectStylesheet, cssPrefix } from "./VizClass";
import * as SVG from "svg.js";

// import { Doc, Text, Rect, PolyLine } from "svg.js";

// TODO Move ticsk to their own axis groups
// TODO Don't remove ticks that don't need to be removed
// TODO give the option to start the graph at 0 rather than the lowest number
// TODO add nodes on hover

/**
 * ## ChartViz
 * A visualization detailing the fitness and maximum fitness in a line chart.
 *
 * #### Basic usage
 * @example
 * ```html
 *
 * <html>
 *    <body>
 *       <!-- Your html content -->
 *
 *        <div id="chart-viz-element">
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
 *    populationSize: 50
 *    templateChromosome: new NumberChromosome({}, 5)
 * });
 *
 * const chartViz = new ChartViz(
 *     document.getElementById("chart-viz-element")
 *     heredity
 * );
 *
 * // ChartViz will now automatically update by itself.
 * // No need to do anything else
 *
 * heredity.generatePopulation();
 * // ChartViz will update
 * heredity.nextGeneration();
 * // ChartViz will update
 *```
 *
 *
 * #### Note:
 * VizClass visualizations are designed to be set and forget. Meaning you simply initialize the
 * object and it will handle updating by itself automatically. It does this by utilizing the
 * addHook() function of Heredity. If you would like to control updating yourself, disable hooks through the disableHook parameter.
 *
 */
export default class ChartViz implements VizClass {
  /** Parent Heredity object */
  _heredity: Heredity;
  /** Parent HTML element */
  _parentElement: HTMLElement;

  /** Class name to prepend to children elements. Used to manage styling. */
  private readonly _containerClassName = "chart-container";

  /** Object to draw SVG on */
  private _canvas?: SVG.Doc;
  /** ID of the canvas */
  private readonly _canvasId = `${cssPrefix}chart-viz-canvas`;

  /** Text indicating that there is no data */
  private _noDataText?: SVG.Text;
  /** Toggle the view of the  noDataText  */
  private _noDataTextRemoved = false;

  /** SVG.js object drawing the X axis line */
  private _axisXLine?: SVG.Rect;
  /** SVG.js object drawing the Y axis line */
  private _axisYLine?: SVG.Rect;

  /** Width of the axes */
  private _axisStrokeWidth = 3;
  /** Width of the ticks on the axes */
  private _axisTickWidth = 2;

  /** Array of the ticks on the X Axis */
  private _xAxisTicks: XAxisTick[] = [];
  /** Array of the ticks on the Y Axis */
  private _yAxisTicks: YAxisTick[] = [];

  /** Last maximum Y. Used to check if ticks need to be redrawn. */
  private _lastMaxY = 0;

  /** Array of lines used in the chart */
  private _plotLines: SVG.PolyLine[] = [];
  /** Width of the lines */
  private _plotLineWidth = 2;

  /** Margin of the chart */
  private _margin = {
    top: 30,
    right: 50,
    bottom: 60,
    left: 60
  };

  /** Coordinates of the corners of the chart accounting for margin + width */
  private _bounds?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  /** Calculated width of the graph */
  private _graphWidth = 0;
  /** Calculated height of the graph */
  private _graphHeight = 0;

  /**
   * ChartData contains all the various data types collected.
   * Basically just an object wrapper for ChartDataType.
   * Heads up: the order of the objects affects it's drawing order. So lower on the objects == drawn on top
   */
  private _chartData: ChartDataType = {
    fitness: {
      name: "Fitness",
      values: [],
      lineColor: "#f5a623"
    },
    topFitness: {
      name: "Top Fitness",
      values: [],
      lineColor: "#0076ff"
    }
  };

  /** Styling of the ChartViz component */
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

      position: absolute;
      bottom: 0;

      width: 100%;
      left: 0;
      right: 0;
    }

    .${cssPrefix}${this._containerClassName} .legend-container p {
      margin: 0.8em 0;
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

  /** ID given to the style element */
  private _styleId = "chart-viz-style-id";

  /**
   * ChartViz can be initialized with either a string or HTMLElement as the first parameter.
   * Setting the parentElement parameter to a string will simply do a document.getElementById("") search
   *
   * @example
   * ```typescript
   *
   * const heredity = new Heredity({
   *    populationSize: 50
   *    templateChromosome: new NumberChromosome({}, 5)
   * });
   *
   * // Set by string id
   * const chart = new ChartViz('chart-viz-element', heredity);
   *
   * // Or set by manual html element
   * const chart = new ChartViz(document.getElementById('chart-viz-element'), heredity);
   *
   * // Disable hooks to control updates yourself
   * const chart = new ChartViz('chart-viz-element', heredity, false);
   * heredity.generatePopulation(); // chart.update() won't automatically be called
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

    const canvas = document.createElement("div");
    canvas.id = this._canvasId;
    this._parentElement.appendChild(canvas);

    this._heredity = heredity;

    if (!disableHooks) {
      heredity.addHook("genPopPost", this.init, this);
      heredity.addHook("nextGenPost", this.update, this);
    }
  }

  /** Initialize ChartViz. Sets bounds. Caclulates location. Sets lines. Adds legend. */
  init() {
    if (this._parentElement.dataset.initialized) {
      this.update();
      return;
    }

    this._bounds = {
      top: this._margin.top,
      right: this._parentElement.clientWidth - this._margin.left,
      bottom: this._parentElement.clientHeight - this._margin.bottom,
      left: this._margin.left
    };

    this._graphWidth = this._bounds.right - this._bounds.left;
    this._graphHeight = this._bounds.bottom - this._bounds.top;

    this._canvas = SVG(this._canvasId);

    Object.values(this._chartData).forEach(obj => {
      this._plotLines.push(
        this._canvas!.polyline([
          [
            this._bounds!.left + this._plotLineWidth / 2,
            this._bounds!.top + this._plotLineWidth / 2
          ],
          [
            this._bounds!.right - this._plotLineWidth / 2,
            this._bounds!.top + this._plotLineWidth / 2
          ]
        ])
          .fill("none")
          .stroke({
            color: obj.lineColor,
            width: this._plotLineWidth,
            linecap: "square",
            linejoin: "round"
          })
      );
    });

    this._axisXLine = this._canvas
      .rect(
        this._bounds.right - this._bounds.left + this._axisStrokeWidth,
        this._axisStrokeWidth
      )
      .fill("#4c4c4c")
      .move(this._bounds.left - this._axisStrokeWidth, this._bounds.bottom);
    this._axisYLine = this._canvas
      .rect(
        this._axisStrokeWidth,
        this._bounds.bottom - this._bounds.top + this._axisStrokeWidth
      )
      .fill("#4c4c4c")
      .move(this._bounds.left - this._axisStrokeWidth, this._bounds.top);

    this._noDataText = this._canvas
      .plain("No Data Available")
      .font({ size: 16 })
      .cx(this._parentElement.clientWidth / 2)
      .cy(this._parentElement.clientHeight / 2);

    const legendContainer = document.createElement("div");
    legendContainer.classList.add("legend-container");

    const fitnessLegend = document.createElement("p");
    const topFitnessLegend = document.createElement("p");
    fitnessLegend.innerText = "Fitness";
    topFitnessLegend.innerText = "Top Fitness";

    const fitnessColor = document.createElement("div");
    const topFitnessColor = document.createElement("div");
    fitnessColor.classList.add("legend-color");
    fitnessColor.classList.add("yellow");
    topFitnessColor.classList.add("legend-color");
    topFitnessColor.classList.add("blue");

    legendContainer.appendChild(fitnessColor);
    legendContainer.appendChild(fitnessLegend);
    legendContainer.appendChild(topFitnessColor);
    legendContainer.appendChild(topFitnessLegend);
    this._parentElement.appendChild(legendContainer);

    window.addEventListener("resize", () => {
      this.resize();
    });

    this._parentElement.dataset.initialized = "true";
  }

  /** Update ChartViz. Updates the svg lines and ticks */
  update() {
    if (!this._noDataTextRemoved) {
      this._noDataText!.animate(200)
        .attr({ opacity: 0 })
        .transform({ scale: 0.8 })
        .after(() => {
          this._noDataText!.remove();
          this._noDataTextRemoved = true;
        });
    }

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
      n.setX((i / xMax) * this._graphWidth + this._bounds!.left);
    });

    this._xAxisTicks.push(
      new XAxisTick(
        this._bounds!.right,
        this._bounds!.bottom + this._axisStrokeWidth,
        this._axisTickWidth,
        6,
        (this._chartData.fitness.values.length - 1).toString(),
        this._canvas!
      )
    );

    let yMin = this._chartData.fitness.values[0];
    let yMax = this._chartData.fitness.values[0];

    Object.values(this._chartData).forEach(obj => {
      const yMaxLocal = Math.max(...obj.values);
      const yMinLocal = Math.min(...obj.values);

      yMin = Math.min(yMin, yMinLocal);
      yMax = Math.max(yMax, yMaxLocal);
    });

    // TODO I need to make this scale higher
    const tensDifference = [
      1,
      5,
      10,
      15,
      20,
      25,
      50,
      75,
      100,
      150,
      200,
      250,
      300,
      500,
      750,
      1000,
      5000,
      10000
    ];

    const difference = yMax - yMin;
    if (this._chartData.fitness.values.length === 1) {
      this._yAxisTicks.push(
        new YAxisTick(
          this._bounds!.left - this._axisStrokeWidth,
          this._bounds!.top,
          this._axisTickWidth,
          6,
          Math.floor(yMin).toString(),
          this._canvas!
        )
      );

      // TODO Fix this, suuuuuper disgusting and hacky
    } else {
      let thisNum = tensDifference[0];
      tensDifference.some((e, i) => {
        thisNum = e;
        return difference <= e * 10;
      });
      this.handleTicks(
        this._yAxisTicks,
        this.roundDown(yMin, thisNum),
        this.roundUp(yMax, thisNum),
        thisNum
      );
    }

    Object.values(this._chartData).forEach((n, i) => {
      if (n.values.length === 1) return;
      const newPlot: number[][] = [];

      n.values.forEach((n, i) => {
        const coords = [
          (i / (xMax === 0 ? 1 : xMax)) * this._graphWidth + this._bounds!.left,
          (1 - (n - yMin) / (yMax - yMin === 0 ? 1 : yMax - yMin)) *
            this._graphHeight +
            this._bounds!.top
        ];

        // console.log(n - yMin / (yMax - yMin === 0 ? 1 : yMax - yMin));
        newPlot.push(coords);
      });

      (<any>this._plotLines[i]).animate(250).plot(newPlot);
    });
  }

  /** Setting ticks was too complicated and hacky so moved to it's own function
   *
   * @param ticks Array of ticks to update
   * @param yMin y minimum to set
   * @param yMax y max to set
   * @param interval Interval of the ticks
   */
  handleTicks(
    ticks: YAxisTick[],
    yMin: number,
    yMax: number,
    interval: number
  ) {
    if (this._lastMaxY === yMax) return;

    this._lastMaxY = yMax;

    ticks.forEach(n => n.remove());
    ticks.length = 0;

    // TODO This is so hacky. Fix it.
    // Soooooooooooooooo hacky
    // Make the code not disgusting
    // Replace with Array.from with map parameter
    Array(Math.ceil((yMax - yMin) / interval))
      .fill(undefined)
      .forEach((n, i, arr) => {
        const newTick = new YAxisTick(
          this._bounds!.left - this._axisStrokeWidth,
          0,
          this._axisTickWidth,
          6,
          Math.floor(yMax - i * interval).toString(),
          this._canvas!
        );

        newTick.setY(
          this._bounds!.top +
            (this._bounds!.bottom - this._bounds!.top - this._axisTickWidth) *
              (i / Math.max(arr.length - 1, 1))
        );

        ticks.push(newTick);
      });
  }

  /**
   * Round up helper function. Rounds up the number based on toRound
   *
   * @param n Number to round up
   * @param toRound Number to round by
   *
   * @example
   * ```
   * // Round up 8 to the nearest 5's place
   * chartViz.roundUp(8, 5)
   * // 10
   *
   * // Round up 14 to the nearest ten's place
   * chartViz.roundDown(14, 10)
   * // 20
   * ```
   */
  roundUp(n: number, toRound: number): number {
    let num = toRound * Math.round(n / toRound);

    if (num < n) num += toRound;

    return num;
  }

  /**
   * Round down helper function. Rounds up the number based on toRound
   *
   * @param n Number to round down
   * @param toRound Number to round by
   *
   * @example
   * ```
   * // Round down 8 to the nearest 5's place
   * chartViz.roundUp(8, 5)
   * // 5
   *
   * // Round down 14 to the nearest ten's place
   * chartViz.roundDown(14, 10)
   * // 10
   * ```
   */
  roundDown(n: number, toRound: number): number {
    let num = this.roundUp(n, toRound);
    if (num > n) num -= toRound;

    return num;
  }

  /** Handles resizing of the graph */
  resize() {
    this._bounds = {
      top: this._margin.top,
      right: this._parentElement.clientWidth - this._margin.left,
      bottom: this._parentElement.clientHeight - this._margin.bottom,
      left: this._margin.left
    };

    this._graphWidth = this._bounds.right - this._bounds.left;
    this._graphHeight = this._bounds.bottom - this._bounds.top;

    this._axisXLine!.width(
      this._bounds.right - this._bounds.left + this._axisStrokeWidth
    ).height(this._axisStrokeWidth);
    this._axisYLine!.width(this._axisStrokeWidth).height(
      this._bounds.bottom - this._bounds.top + this._axisStrokeWidth
    );

    const xMax = this._chartData.fitness.values.length - 1;
    this._xAxisTicks.forEach((n, i) => {
      n.setX(
        (i / xMax) * (this._graphWidth - this._axisTickWidth) +
          this._bounds!.left,
        false
      );
    });

    this._yAxisTicks.forEach((n, i, arr) => {
      n.setY(
        this._bounds!.top +
          (this._bounds!.bottom - this._bounds!.top - this._axisTickWidth) *
            (i / Math.max(arr.length - 1, 1)),
        false
      );
    });

    let yMin = this._chartData.fitness.values[0];
    let yMax = this._chartData.fitness.values[0];

    Object.values(this._chartData).forEach(obj => {
      const yMaxLocal = Math.max(...obj.values);
      const yMinLocal = Math.min(...obj.values);

      yMin = Math.min(yMin, yMinLocal);
      yMax = Math.max(yMax, yMaxLocal);
    });

    Object.values(this._chartData).forEach((n, i) => {
      if (n.values.length === 1) return;
      const newPlot: number[][] = [];

      n.values.forEach((n, i) => {
        const coords = [
          (i / (xMax === 0 ? 1 : xMax)) * this._graphWidth + this._bounds!.left,
          (1 - (n - yMin) / (yMax - yMin === 0 ? 1 : yMax - yMin)) *
            this._graphHeight +
            this._bounds!.top
        ];

        // console.log(n - yMin / (yMax - yMin === 0 ? 1 : yMax - yMin));
        newPlot.push(coords);
      });

      (<any>this._plotLines[i]).plot(newPlot);
    });
  }

  /**
   * Allows visualization to link and pass data to each other.
   * ChartViz doesn't have any linking functionality at the moment.
   *
   * @param toLink Visualization to link together
   */
  link(toLink: VizClass): boolean {
    return false;
  }
}

/**
 * Axis tick abstract class. Boilerplate for XAxisTick and YAxis tick.
 * Draws the ticks on the x and y axes.
 */
abstract class AxisTick {
  /** X coordinate of the tick */
  protected _x: number;
  /** Y coordinate of the tick */
  protected _y: number;
  /** Height of the tick */
  protected _height: number;
  /** Width of the tick */
  protected _width: number;
  /** Margin of the tick */
  protected _margin = 3;
  /** Text drawn next to the tick */
  protected _value: string;

  /** Object to draw on */
  protected _draw: SVG.Doc;
  /** Tick line */
  protected _line?: SVG.Rect;
  /** Text element */
  protected _text?: SVG.Text;

  /** Group containing line and text */
  protected _group?: SVG.G;

  /**
   * @param x Set the x coordinate
   * @param y Set the y coordinate
   * @param width Set the width
   * @param height Set the height
   * @param value Set the text value
   * @param draw Where to draw the tick
   */
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    value: string,
    draw: SVG.Doc
  ) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._value = value;

    this._draw = draw;

    this.init();
  }

  /** Remove elements */
  remove() {
    this._group!.remove();
  }

  /** Initialize tick element */
  abstract init(): void;
}

/** Draws the ticks on the X Axis */
class XAxisTick extends AxisTick {
  /** Initalized the tick */
  init() {
    this._group = this._draw.group().move(this._x, this._y);

    this._line = this._draw
      .rect(this._width, this._height)
      .move(-this._width, 0)
      .fill("#4c4c4c");

    this._text = this._draw
      .plain(this._value)
      .font({ size: 11 })
      .cx(0)
      .y(this._height + this._margin);

    this._group.add(this._line);
    this._group.add(this._text);
  }

  /**
   * Set the x coordinate of the tick. Choose whether to animate or not.
   *
   * @param x New x coordinate to move to
   * @param animate Choose to animate the x change
   */
  setX(x: number, animate = true) {
    this._x = x + this._width;
    this._group!.stop(true, true);
    if (animate) {
      this._group!.animate(250, ">").x(this._x);
    } else {
      this._group!.x(this._x);
    }
  }
}

/** Draws the tick on the Y Axis */
class YAxisTick extends AxisTick {
  /** Initialize the tick */
  init() {
    this._group = this._draw.group().move(this._x, this._y);

    this._line = this._draw
      .rect(this._height, this._width)
      .move(-this._height, 0)
      .fill("#4c4c4c");

    this._margin = 0;

    this._text = this._draw.plain(this._value).font({ size: 11 });
    this._text.cy(0).cx(-this._height - this._margin - this._text.bbox().width);

    this._group.add(this._line);
    this._group.add(this._text);
  }

  /**
   * Set the y coordinate of the tick. Choose whether to animate or not.
   *
   * @param y New y coordinate to move to
   * @param animate Choose to animate the y change
   */
  setY(y: number, animate = true) {
    this._y = y;
    this._group!.stop(true, true);
    if (animate) {
      this._group!.animate(300, ">").y(this._y);
    } else {
      this._group!.y(this._y);
    }
  }

  /**
   * Remove the tick. Animate it off the graph
   */
  remove() {
    this._y = this._group!.doc().node.clientHeight;
    this._group!.animate(300, ">")
      .y(this._y)
      .attr("opacity", "0")
      .after(() => {
        this._group!.remove();
      });
    // this._group!.remove();
  }
}

/** Interface for ChartDataType */
interface ChartDataType {
  [key: string]: ChartDataFitnessType;
  topFitness: ChartDataFitnessType;
  fitness: ChartDataFitnessType;
}

/** Interface for ChartDataFitnessType */
interface ChartDataFitnessType {
  name: string;
  values: number[];
  lineColor: string;
}

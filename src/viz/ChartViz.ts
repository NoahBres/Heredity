import Heredity from "../Heredity";
import { default as VizClass, injectStylesheet } from "./VizClass";
import * as d3 from "d3";
import { exit } from "shelljs";

// TODO Move stuff to constructor so it doesn't need to be undefined
// TODO Then remove the possibly undefined question marks
// TODO Rid of all D3. All of it. ALL OF IT

export default class ChartViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _data: ChartDataType = {
    topFitness: {
      name: "Top Fitness",
      values: []
    },
    fitness: {
      name: "Fitness",
      values: []
    }
  };

  private _color = d3.scaleOrdinal(d3.schemeCategory10);

  private _svg: d3.Selection<SVGSVGElement, {}, null, undefined> | undefined;
  private _plotLine: d3.Line<[number, number]> | undefined;
  private _plotLineTopFitness: d3.Line<[number, number]> | undefined;
  private _line:
    | d3.Selection<SVGPathElement, { y: number }[], null, undefined>
    | undefined;
  private _lineTopFitness:
    | d3.Selection<SVGPathElement, { y: number }[], null, undefined>
    | undefined;
  private _dot:
    | d3.Selection<SVGCircleElement, { y: number }, SVGGElement, {}>
    | undefined;
  private _dotTopFitness:
    | d3.Selection<SVGCircleElement, { y: number }, SVGGElement, {}>
    | undefined;
  private _xScale: d3.ScaleLinear<number, number> | undefined;
  private _yScale: d3.ScaleLinear<number, number> | undefined;
  private _xAxis: d3.Axis<number | { valueOf(): number }> | undefined;
  private _yAxis: d3.Axis<number | { valueOf(): number }> | undefined;

  private _style = `
    .viz__chart-container {
      display: flex;
      flex-direction: column-reverse;
      
      background: white;
      border-radius: 0.3em;
      border: 1px solid #d0d0d0;
      
      position: relative;
    }
    
    .viz__chart-container .legend-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .viz__chart-container .legend-color {
      height: 0.5em;
      width: 0.5em;
      
      margin: 0 0.45em;
      margin-top: 0.2em;
      margin-left: 1em;
      
      background: red;

      border-radius: 0.15em;
    }
    
    .viz__chart-container .legend-color.yellow {
      background: #f5a623;
    }
    
    .viz__chart-container .legend-color.blue {
      background: #0076ff;
    }

    .viz__chart-container .line {
      fill: none;
      stroke: #ffab00;
      stroke-width: 3;
    }
    
    .viz__chart-container .line.blue {
      stroke: #0076ff;
    }

    .viz__chart-container .overlay {
      fill: none;
      pointer-events: all;
    }
    
    .viz__chart-container .dot {
      fill: #f5a623;
      stroke: #fff;

      transition: 300ms ease;
    }
    
    .viz__chart-container .dot.blue {
      fill: #0076ff;
    }

    .viz__chart-container .dot:hover {
      cursor: pointer;
      fill: #ff0080;
      stroke: #fff;
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

    this._parentElement.classList.add("viz__chart-container");
    injectStylesheet(this._style, this._styleId);

    this._heredity = heredity;

    heredity.addHook("genPopPost", this, this.init);
    heredity.addHook("nextGenPost", this, this.update);
  }

  init() {
    if (this._parentElement.dataset.initialized) {
      this.update();
      return;
    }

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

    this.initd3();

    this._parentElement.dataset.initialized = "true";
  }

  initd3() {
    const padding = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50
    };

    const width =
      this._parentElement.clientWidth - padding.left - padding.right;
    const height =
      this._parentElement.clientHeight - padding.top - padding.bottom;

    this._svg = d3
      .select(this._parentElement)
      .append("svg")
      .attr("width", width + padding.left + padding.right)
      .attr("height", height + padding.top + padding.bottom);
    // .attr("transform", `translate(${padding.left},${padding.top})`);

    this._svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // const zoomWindow = this._svg
    //   .append("rect")
    //   .attr("clip-path", 'url("#clip)')
    //   .attr("transform", `translate(${0},${0})`)
    //   .attr("width", width)
    //   .attr("height", height)
    //   .style("opacity", 1)
    //   .style("fill", "whitesmoke")
    //   .attr("transform", `translate(${padding.left},${padding.top})`);

    // const xExtent = [1, this._data.fitness.values.length];
    // const yExtent = [
    //   this._data.fitness.values.reduce(
    //     (min, p) => (p.y < min ? p.y : min),
    //     this._data.fitness.values[0].y
    //   ),
    //   this._data.fitness.values.reduce(
    //     (max, p) => (p.y > max ? p.y : max),
    //     this._data.fitness.values[0].y
    //   )
    // ];
    const xExtent = [0, 1];
    const yExtent = [0, 100];

    this._xScale = d3
      .scaleLinear()
      .range([0, width])
      .domain(xExtent)
      .nice();

    this._yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain(<any>yExtent)
      .nice();

    this._xAxis = d3.axisBottom(this._xScale);
    this._yAxis = d3.axisLeft(this._yScale);

    this._plotLine = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((d, i) => this._xScale!(i + 1))
      .y((d: any) => this._yScale!(d.y));

    this._plotLineTopFitness = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((d, i) => this._xScale!(i + 1))
      .y((d: any) => this._yScale!(d.y));

    this._svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(${padding.left},${padding.top + height})`)
      .call(this._xAxis);

    this._svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .call(this._yAxis);

    this._line = this._svg
      .append("g")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .append("path")
      .datum(this._data.fitness.values)
      .attr("class", "line")
      .attr("d", <any>this._plotLine);

    this._lineTopFitness = this._svg
      .append("g")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .append("path")
      .datum(this._data.topFitness.values)
      .attr("class", "line blue")
      .attr("d", <any>this._plotLineTopFitness);

    // this._svg
    //   .append("g")
    //   // .attr(
    //   //   "transform",
    //   //   `translate(${padding.left + padding.right},${-height})`
    //   // )
    //   .append("path")
    //   .datum(dataset)
    //   .attr("class", "line")
    //   .attr("d", <any>line);

    this._dot = this._svg
      .append("g")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .selectAll(".dot")
      .data(this._data.fitness.values)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d, i) => {
        return this._xScale!(i + 1);
      })
      .attr("cy", d => this._yScale!(d.y))
      .attr("r", 5);

    this._dotTopFitness = this._svg
      .append("g")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .selectAll(".dot")
      .data(this._data.topFitness.values)
      .enter()
      .append("circle")
      .attr("class", "dot blue")
      .attr("cx", (d, i) => {
        return this._xScale!(i + 1);
      })
      .attr("cy", d => this._yScale!(d.y))
      .attr("r", 5);

    // this._dot = this._svg.selectAll(".dot");
    // .on("mouseover", function(a, b, c) {
    //   d3.select(this).classed("focus", true);
    // })
    // .on("mouseout", function(a, b, c) {
    //   d3.select(this).classed("focus", false);
    // });

    // zoomWindow.call(zoom);

    // this._svg = d3.select(this._parentElement).append("svg");
    // const width =
    //   this._parentElement.clientWidth - padding.left - padding.right;
    // const height =
    //   this._parentElement.clientHeight - padding.top - padding.bottom;
    // this._svg.attr("width", width + padding.left + padding.right);
    // this._svg.attr("height", height + padding.top + padding.bottom);
  }

  update() {
    const latestFitness = this._heredity.history[
      this._heredity.history.length - 1
    ].topChromosome().fitness;

    this._data.fitness.values.push({ y: latestFitness });
    const topFitness =
      this._data.topFitness.values.length === 0
        ? 0
        : this._data.topFitness.values[this._data.topFitness.values.length - 1]
            .y;
    this._data.topFitness.values.push({
      y: Math.max(latestFitness, topFitness)
    });

    this.updated3();
  }

  updated3() {
    const xExtent = [1, this._data.fitness.values.length];
    const yExtent = [
      this._data.fitness.values.reduce(
        (min, p) => (p.y < min ? p.y : min),
        this._data.fitness.values[0].y
      ),
      this._data.fitness.values.reduce(
        (max, p) => (p.y > max ? p.y : max),
        this._data.fitness.values[0].y
      )
    ];

    this._xScale!.domain(xExtent).nice();
    this._yScale!.domain(<any>yExtent).nice();

    this._xAxis!.scale(<any>this._xScale);
    this._yAxis!.scale(<any>this._yScale);

    this._plotLine = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((d, i) => this._xScale!(i + 1))
      .y((d: any) => this._yScale!(d.y));

    this._plotLineTopFitness = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((d, i) => this._xScale!(i + 1))
      .y((d: any) => this._yScale!(d.y));

    const transition = d3.transition().duration(300);
    this._svg!.select(".x")
      .transition(<any>transition)
      .call(<any>this._xAxis);
    this._svg!.select(".y")
      .transition(<any>transition)
      .call(<any>this._yAxis);

    this._line!.datum(this._data.fitness.values)
      // .transition(<any>transition)
      .attr("d", <any>this._plotLine);

    this._lineTopFitness!.datum(this._data.topFitness.values)
      // .transition(<any>transition)
      .attr("d", <any>this._plotLine);

    // this._dot!.data(
    //   this._data.fitness.values.map(i => {
    //     return {
    //       y: i
    //     };
    //   })
    // )
    //   .transition()
    //   .duration(300)
    //   .attr("cx", (d, i) => {
    //     return this._xScale!(i + 1);
    //   })
    //   .attr("cy", d => this._yScale!((<any>d).y));

    this._svg!.selectAll(".dot").remove();

    this._dot!.data(this._data.fitness.values)
      .enter()
      .append("circle")
      .merge(<any>this._dot)
      .attr("class", "dot")
      .attr("cx", (d, i) => {
        return this._xScale!(i + 1);
      })
      .attr("cy", d => this._yScale!(d.y))
      .attr("r", 5)
      .exit()
      .remove();
    // .on("mouseover", function(a, b, c) {
    //   d3.select(this).classed("focus", true);
    // })
    // .on("mouseout", function(a, b, c) {
    //   d3.select(this).classed("focus", false);
    // })
    // .exit()
    // .remove();

    this._dotTopFitness!.data(this._data.topFitness.values)
      .enter()
      .append("circle")
      .merge(<any>this._dotTopFitness)
      .attr("class", "dot blue")
      .attr("cx", (d, i) => {
        return this._xScale!(i + 1);
      })
      .attr("cy", d => this._yScale!(d.y))
      .attr("r", 5)
      .exit()
      .remove();

    // Object.keys(this._data).forEach((d, i) => {
    //   if (d3.select(`#line${i}`).empty()) {
    //     // Add new charts
    //     // Add line plot
    //     console.log(this._plotLine);
    //     this._line!.append("g")
    //       .attr("id", `line-${i}`)
    //       .attr("clip-path", "url(#clip)")
    //       .append("path")
    //       .data([(<any>this._data)[d].values])
    //       .attr("class", "pointlines")
    //       .attr("d", <any>this._plotLine)
    //       .style("fill", "none");
    //     // .style("stroke", () => ((<any>d).color = this._color("3")));
    //   } else {
    //     console.log("TOTES");
    //   }

    // });
  }

  link(toLink: VizClass): boolean {
    return false;
  }
}

interface ChartDataType {
  topFitness: ChartDataFitnessType;
  fitness: ChartDataFitnessType;
}

interface ChartDataFitnessType {
  name: string;
  values: { y: number }[];
}

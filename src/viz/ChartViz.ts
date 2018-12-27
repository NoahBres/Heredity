import Heredity from "../Heredity";
import { default as VizClass, injectStylesheet } from "./VizClass";
import * as d3 from "d3";

export default class ChartViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _topFitnessData: number[] = [];
  private _fitnessData: number[] = [];

  private testData = [
    {
      name: "Top Fitness",
      values: [3, 5, 6, 6, 8]
    },
    {
      name: "Fitness",
      values: [3, 5, 6, 2, 8]
    }
  ];

  private _xScale: d3.ScaleLinear<number, number> | undefined;
  private _yScale: d3.ScaleLinear<number, number> | undefined;
  private _zoomWindow:
    | d3.Selection<SVGRectElement, {}, null, undefined>
    | undefined;

  private _style = `
    .viz__chart-container {
      background: white;
      border-radius: 0.3em;
      border: 1px solid #d0d0d0;

      position: relative;
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

    this.initd3();

    this._parentElement.dataset.initialized = "true";
  }

  initd3() {
    const padding = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 50
    };

    const svg = d3.select(this._parentElement).append("svg");
    const width =
      this._parentElement.clientWidth - padding.left - padding.right;
    const height =
      this._parentElement.clientHeight - padding.top - padding.bottom;
    svg.attr("width", width + padding.left + padding.right);
    svg.attr("height", height + padding.top + padding.bottom);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const zoom = d3.zoom().on("zoom", onZoom);

    const xExtent = this.findExtent(this.testData, "x");
    const yExtent = this.findExtent(this.testData, "y");

    this._xScale = d3
      .scaleLinear()
      .range([0, width])
      .domain(xExtent)
      .nice();
    this._yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain(yExtent)
      .nice();

    const xAxis = d3.axisBottom(this._xScale).ticks(12);
    const yAxis = d3.axisLeft(this._yScale).ticks((12 * height) / width);

    const plotLine = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x(d => this._xScale!((<any>d).x))
      .y(d => this._yScale!((<any>d).y));

    // make a clip path
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    this._zoomWindow = svg
      .append("rect")
      .attr("clip-path", "url(#clip)")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .attr("width", width)
      .attr("height", height)
      .style("opacity", 1)
      .style("fill", "whitesmoke");

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("id", "axis--x")
      .attr("transform", `translate(${padding.left},${height + padding.top})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .attr("id", "axis--y")
      .call(yAxis);

    const line = svg
      .append("g")
      .attr("transform", `translate(${padding.left},${padding.top})`);
    const dot = svg
      .append("g")
      .attr("transform", `translate(${padding.left},${padding.top})`);

    this._zoomWindow.call(<any>zoom);

    function onZoom() {}
  }

  update() {
    const latestFitness = this._heredity.history[
      this._heredity.history.length - 1
    ].topChromosome().fitness;

    this._fitnessData.push(latestFitness);
    const topFitness =
      this._topFitnessData.length === 0
        ? 0
        : this._topFitnessData[this._topFitnessData.length - 1];
    this._topFitnessData.push(Math.max(latestFitness, topFitness));

    this.updated3();
  }

  updated3() {
    const xExtent = this.findExtent(this.testData, "x");
    const yExtent = this.findExtent(this.testData, "y");

    this._xScale!.domain(xExtent).nice();
    this._yScale!.domain(yExtent).nice();

    const t = d3.zoomTransform((<any>this._zoomWindow).node());
  }

  link(toLink: VizClass): boolean {
    return false;
  }

  findExtent(arr: any[], prop: string) {
    const max = parseInt(
      <string>d3.max(arr, array => d3.max(array.values, v => (<any>v)[prop])),
      10
    );
    const min = parseInt(
      <string>d3.min(arr, array => d3.min(array.values, v => (<any>v)[prop])),
      10
    );

    return [min, max];
  }
}

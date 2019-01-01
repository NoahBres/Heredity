import Heredity from "../Heredity";
import { default as VizClass, injectStylesheet } from "./VizClass";
import * as d3 from "d3";

export default class ChartViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _topFitnessData: number[] = [];
  private _fitnessData: number[] = [];

  private _data = [
    {
      name: "Top Fitness",
      values: [3, 5, 6, 6, 8]
    },
    {
      name: "Fitness",
      values: [3, 5, 6, 2, 8]
    }
  ];

  private _svg: d3.Selection<SVGSVGElement, {}, null, undefined> | undefined;
  private _color = d3.scaleOrdinal(d3.schemeCategory10);
  private _line: d3.Selection<SVGGElement, {}, null, undefined> | undefined;
  private _dot: d3.Selection<SVGGElement, {}, null, undefined> | undefined;
  private _xScale: d3.ScaleLinear<number, number> | undefined;
  private _yScale: d3.ScaleLinear<number, number> | undefined;
  private _zoomWindow:
    | d3.Selection<SVGRectElement, {}, null, undefined>
    | undefined;
  private _plotLine: d3.Line<[number, number]> | undefined;
  private _xAxis: d3.Axis<number | { valueOf(): number }> | undefined;
  private _yAxis: d3.Axis<number | { valueOf(): number }> | undefined;

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

    this._svg = d3.select(this._parentElement).append("svg");
    const width =
      this._parentElement.clientWidth - padding.left - padding.right;
    const height =
      this._parentElement.clientHeight - padding.top - padding.bottom;
    this._svg.attr("width", width + padding.left + padding.right);
    this._svg.attr("height", height + padding.top + padding.bottom);

    const zoom = d3.zoom().on("zoom", onZoom);

    const xExtent = this.findExtent(this._data, "x");
    const yExtent = this.findExtent(this._data, "y");

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

    this._xAxis = d3.axisBottom(this._xScale).ticks(12);
    this._yAxis = d3.axisLeft(this._yScale).ticks((12 * height) / width);

    this._plotLine = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x(d => this._xScale!((<any>d).x))
      .y(d => this._yScale!((<any>d).y));

    // make a clip path
    this._svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    this._zoomWindow = this._svg
      .append("rect")
      .attr("clip-path", "url(#clip)")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .attr("width", width)
      .attr("height", height)
      .style("opacity", 1)
      .style("fill", "whitesmoke");

    this._svg
      .append("g")
      .attr("class", "x axis")
      .attr("id", "axis--x")
      .attr("transform", `translate(${padding.left},${height + padding.top})`)
      .call(this._xAxis);

    this._svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .attr("id", "axis--y")
      .call(this._yAxis);

    this._line = this._svg
      .append("g")
      .attr("transform", `translate(${padding.left},${padding.top})`);
    this._dot = this._svg
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
    const remove = (sel: any, index: any, name: any) => {};

    const xExtent = this.findExtent(this._data, "x");
    const yExtent = this.findExtent(this._data, "y");

    this._xScale!.domain(xExtent).nice();
    this._yScale!.domain(yExtent).nice();

    const t = d3.zoomTransform((<any>this._zoomWindow).node());
    const newXScale = t.rescaleY(<any>this._xScale);
    const newYScale = t.rescaleY(<any>this._yScale);

    this._plotLine = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((d: any) => newXScale(d.x))
      .y((d: any) => newYScale(d.y));

    this._xAxis!.scale(newXScale);
    this._yAxis!.scale(newYScale);

    this._svg!.transition()
      .duration(750)
      .select(".x.axis")
      .call(<any>this._xAxis);
    this._svg!.transition()
      .duration(750)
      .select(".y.axis")
      .call(<any>this._yAxis);

    // Add and update to plot data
    this._data.forEach((d, i) => {
      if (d3.select(`#line-${i}`).empty()) {
        // Add new charts
        // Add line plot
        this._line!.append("g")
          .attr("id", `line-${i}`)
          .attr("clip-path", "url(#clip)")
          .append("path")
          .data([d.values])
          .attr("class", "pointlines")
          .attr("d", <any>this._plotLine)
          .style("fill", "none")
          .style("stroke", () => ((<any>d).color = this._color((<any>d).key)));

        // this._dot!.append("g")
        //   .attr("id", `scatter-${i}`)
        //   .attr("clip-path", "url(#clip)")
        //   .selectAll(".dot")
        //   .data(d.values)
        //   .enter()
        //   .append("circle")
        //   .attr("class", "dot")
        //   .attr("r", 5)
        //   .attr("cx", d => newXScale((<any>d).x))
        //   .attr("cy", d => newYScale((<any>d).y))
        //   .attr("stroke", "white")
        //   .attr("stroke-width", "2px")
        //   .style("fill", () => ((<any>d).color = this._color((<any>d).key)))
        //   .on("click", function(d, i) {
        //     const s = d3.select(this);
        //     remove(s, i, (<any>d).name);
        //   });
      } else {
        const lineSelect = this._line!.select(`#line-${i}`)
          .select("path")
          .data([d.values]);

        lineSelect
          .transition()
          .duration(750)
          .attr("d", <any>this._plotLine);

        // const scatterSelect = this._dot!.select(`#scatter-${i}`)
        //   .selectAll("circle")
        //   .data((<any>d).values);

        // scatterSelect
        //   .transition()
        //   .duration(750)
        //   .attr("cx", d => newXScale((<any>d).x))
        //   .attr("cy", d => newYScale((<any>d).y))
        //   .attr("stroke", "white")
        //   .attr("stroke-width", "2px")
        //   .style("fill", () => ((<any>d).color = this._color((<any>d).key)));

        // scatterSelect
        //   .enter()
        //   .append("circle")
        //   .attr("cx", d => newXScale((<any>d).x))
        //   .attr("cy", d => newYScale((<any>d).y))
        //   .attr("r", 5)
        //   .attr("stroke", "white")
        //   .attr("stroke-width", "2px")
        //   .style("fill", () => ((<any>d).color = this._color((<any>d).key)))
        //   .on("click", function(d, i) {
        //     const s = d3.select(this);
        //     remove(s, i, (<any>d).name);
        //   });

        // scatterSelect.exit().remove();
      }
    });
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

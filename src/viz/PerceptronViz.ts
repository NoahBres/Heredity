import Heredity from "../Heredity";
import { default as VizClass, injectStylesheet, DnaPill } from "./VizClass";
import DnaViz from "./DnaViz";
import NeuralChromosome from "../chromosomes/NeuralChromosome";
import * as d3 from "d3";
import GenericChromosome from "../chromosomes/GenericChromosome";

// TODO Optimize by minimizing DOM manipulation
// Don't delete DOM on refresh
// TODO Remove comments. Write TSDoc
// TODO Move DNAPill to separate class

export default class PerceptronViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _chromosome: NeuralChromosome | undefined;
  private _options: {
    index?: number;
    chromosome?: NeuralChromosome;
    threshhold?: (i: number) => boolean;
  } = {};

  private _nodeRadius = 25;
  private _nodeMargin = 10;
  private _padding = 20;

  // private _d3Url = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js";
  // private _d3Initialized = false;
  // private _d3ScriptId = "perceptron-viz-d3-id";

  // private _lastHistoryLength = 0;

  private _graph: GraphInterface = {
    nodes: [],
    links: []
  };

  private _nodeColors = d3.scaleOrdinal(d3.schemeCategory10);

  private _deadIndicatorElement: HTMLElement;

  private _dnaPill: DnaPill | undefined;
  private readonly _dnaPillClassName = "viz__perceptron-viz-dna-pill";

  private _skullSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Your_Icon" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M89.12,85.757c-4.392-1.602-4.796,2.233-12.704-0.645l-15.48-5.634l15.479-5.635c7.911-2.875,8.31,0.957,12.706-0.643  c1.754-0.639,2.875-3.036,2.234-4.796c-0.639-1.757-1.079-1.595-1.716-3.354c-0.642-1.76-0.201-1.918-0.843-3.675  c-0.639-1.761-3.037-2.876-4.794-2.233c-4.394,1.596-2.238,4.793-10.146,7.672L50,75.498l-23.858-8.684  c-7.909-2.878-5.75-6.076-10.145-7.674c-1.756-0.639-4.153,0.478-4.793,2.237c-0.643,1.755-0.202,1.916-0.84,3.674  c-0.64,1.756-1.081,1.6-1.723,3.355c-0.638,1.76,0.481,4.155,2.238,4.796c4.396,1.599,4.794-2.236,12.704,0.642l15.48,5.634  l-15.48,5.635c-7.909,2.879-8.311-0.959-12.704,0.643c-1.756,0.639-2.875,3.035-2.234,4.795c0.636,1.758,1.076,1.598,1.719,3.354  c0.639,1.757,0.2,1.92,0.836,3.679c0.643,1.758,3.039,2.874,4.798,2.235c4.396-1.602,2.235-4.795,10.144-7.675L50,83.459  l23.857,8.683c7.909,2.883,5.751,6.075,10.146,7.676c1.755,0.638,4.154-0.479,4.795-2.238c0.64-1.756,0.198-1.916,0.842-3.673  c0.639-1.76,1.079-1.599,1.717-3.356C91.999,88.791,90.879,86.394,89.12,85.757z"/><path d="M50,0C36.745,0,26,10.745,26,24v21c0,2.2,1.323,5.221,2.939,6.713l7.121,6.574c1.617,1.492,3.39,4.288,3.939,6.213  s2.8,3.5,5,3.5h10c2.2,0,4.45-1.575,5-3.5s2.322-4.721,3.939-6.213l7.121-6.574C72.678,50.221,74,47.2,74,45V24  C74,10.745,63.255,0,50,0z M38.461,49C34.596,49,32,45.768,32,42.455C32,39.141,35.134,37,39,37s7,2.141,7,5.455  C46,45.768,42.328,49,38.461,49z M50,58c-2,0-3-1-3-3s2-6,3-6s3,4,3,6S52,58,50,58z M61.538,49C57.673,49,54,45.768,54,42.455  C54,39.141,57.134,37,61,37s7,2.141,7,5.455C68,45.768,65.404,49,61.538,49z"/></svg>';

  private _style = `
    .viz__perceptron-container {
      background: white;
      border-radius: 0.3em;
      border: 1px solid #d0d0d0;

      position: relative;
    }

    .viz__perceptron-container .dead-indicator svg {
      position: absolute;
      top: 0.5em;
      left: 0.5em;

      height: 1.5em;
      width: 1.5em;
      fill: #d62728;
    }

    .viz__perceptron-container .dead-indicator.hidden {
      display: none;
    }

    .viz__perceptron-container .link line {
      stroke: #999;
      stroke-opacity: 0.6;
    }

    .viz__perceptron-container .link text {
      font-size: 0.8em;
    }

    .viz__perceptron-container .node circle {
      stroke: #fff;
      stroke-width: 3px;
      cursor: pointer;

      transition: 200ms ease;
    }

    .viz__perceptron-container .node circle:hover {
      stroke: rgba(0, 0, 0, 0.4);
    }

    .viz__perceptron-container .node text {
      font-size: 0.8em;
    }

    .viz__perceptron-container .node .output.activated {
      stroke: rgba(0, 0, 0, 0.4);
      stroke-width: 6px;
    }

    .${this._dnaPillClassName} {
      position: absolute;
      top: 50%;
      left: 0.55em;

      border-radius: 0.5em;
      margin: 0.3em;

      transform: translateY(-50%);

      box-shadow: 0px 4px 11px 0px rgba(0, 0, 0, 0.12);    
    
      transition: 300ms ease;
    }
    
    .${this._dnaPillClassName} {
      transform: translateY(-50%)!important;
    }

    .${this._dnaPillClassName} .${this._dnaPillClassName}-gene {
      width: 0.7em!important;
      height: 0.7em!important;
    }
  `;

  private _styleId = "perceptron-viz-style-id";

  constructor(
    parentElement: string | HTMLElement,
    heredity: Heredity,
    options: {
      index?: number;
      chromosome?: NeuralChromosome;
      threshhold?: (i: number) => boolean;
    }
  ) {
    if (parentElement instanceof String) {
      this._parentElement = <HTMLElement>(
        document.getElementById(<string>parentElement)
      );
    } else {
      this._parentElement = <HTMLElement>parentElement;
    }

    this._parentElement.classList.add("viz__perceptron-container");
    injectStylesheet(this._style, this._styleId);

    this._deadIndicatorElement = document.createElement("div");
    this._deadIndicatorElement.classList.add("dead-indicator", "hidden");
    this._deadIndicatorElement.innerHTML = this._skullSvg;
    this._parentElement.appendChild(this._deadIndicatorElement);

    this._options = options;
    this._heredity = heredity;

    heredity.addHook("genPopPost", this, this.init);
    heredity.addHook("nextGenPost", this, this.update);
  }

  init() {
    if (this._parentElement.dataset.initialized) {
      this.update();
      return;
    }

    if (this._options.chromosome !== undefined) {
      this._chromosome = this._options.chromosome;
    } else {
      this._chromosome = <NeuralChromosome>(
        this._heredity.chromosomes[this._options.index!]
      );
    }

    if (!this._chromosome.tags.has("dead")) {
      this._deadIndicatorElement.classList.add("hidden");
    } else {
      this._deadIndicatorElement.classList.remove("hidden");
    }

    this._dnaPill = new DnaPill(this._chromosome, this._dnaPillClassName);
    this._parentElement.appendChild(this._dnaPill.element);

    // this.injectScript(
    //   this._d3Url,
    //   () => {
    //     this._d3Initialized = true;
    //     this.initd3();
    //   },
    //   this._d3ScriptId
    // );
    // Remove the initialized tag later
    // this._d3Initialized = true;
    this.initd3();

    this._chromosome!.onCompute(this._chromosome, () => {
      this.updated3();
    });

    this.updated3();

    this._parentElement.dataset.initialized = "true";
  }

  initd3() {
    // const graph = {
    //   nodes: [
    //     { id: "input1", group: 1 },
    //     { id: "input2", group: 1 },
    //     { id: "hidden1", group: 2 },
    //     { id: "hidden2", group: 2 },
    //     { id: "output1", group: 3 }
    //   ],
    //   links: [
    //     { source: "input1", target: "hidden1", value: 6 },
    //     { source: "input1", target: "hidden2", value: 3 },
    //     { source: "input2", target: "hidden1", value: 4 },
    //     { source: "input2", target: "hidden2", value: 1 },
    //     { source: "hidden1", target: "output1", value: 9 },
    //     { source: "hidden2", target: "output1", value: 4 }
    //   ]
    // };
    let graphCoords = [];

    if (this._chromosome !== undefined) {
      graphCoords = this.genGraphCoords(this._chromosome);
      this._graph = this.buildGraph(this._chromosome, graphCoords);
    }

    const svg = d3.select(this._parentElement).append("svg");
    const width = this._parentElement.clientWidth;
    const height = this._parentElement.clientHeight;
    svg.attr("width", width);
    svg.attr("height", height);

    // const simulation = d3
    //   .forceSimulation()
    //   .force("link", d3.forceLink().id(d => (<any>d).id))
    //   .force("charge", d3.forceManyBody().strength(-900))
    //   .force("center", d3.forceCenter(width / 2, height / 2));

    const midpoint = (gl: GraphLinkInterface) => {
      const x1 = this._graph.nodes.find(x => x.id === (<any>gl).source)!.x;
      const y1 = this._graph.nodes.find(x => x.id === (<any>gl).source)!.y;
      const x2 = this._graph.nodes.find(x => x.id === (<any>gl).target)!.x;
      const y2 = this._graph.nodes.find(x => x.id === (<any>gl).target)!.y;

      return [(x1 + x2) / 2, (y1 + y2) / 2];
    };

    const rotate = (gl: GraphLinkInterface) => {
      const x1 = this._graph.nodes.find(x => x.id === (<any>gl).source)!.x;
      const y1 = this._graph.nodes.find(x => x.id === (<any>gl).source)!.y;
      const x2 = this._graph.nodes.find(x => x.id === (<any>gl).target)!.x;
      const y2 = this._graph.nodes.find(x => x.id === (<any>gl).target)!.y;

      return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI - 180;
    };

    const link = svg
      .selectAll("line")
      .data(this._graph.links)
      .enter()
      .append("g")
      .attr("class", "link");
    // .append("line")
    // .attr("x1", d => this._graph.nodes.find(x => x.id === (<any>d).source)!.x)
    // .attr("y1", d => this._graph.nodes.find(x => x.id === (<any>d).source)!.y)
    // .attr("x2", d => this._graph.nodes.find(x => x.id === (<any>d).target)!.x)
    // .attr("y2", d => this._graph.nodes.find(x => x.id === (<any>d).target)!.y)
    // .attr("stroke-width", 3);
    // .attr("stroke-width", d => Math.sqrt(d.value))

    // Optimize it by not repeating the find function
    const linkLine = link
      .append("line")
      .attr("x1", d => this._graph.nodes.find(x => x.id === (<any>d).source)!.x)
      .attr("y1", d => this._graph.nodes.find(x => x.id === (<any>d).source)!.y)
      .attr("x2", d => this._graph.nodes.find(x => x.id === (<any>d).target)!.x)
      .attr("y2", d => this._graph.nodes.find(x => x.id === (<any>d).target)!.y)
      .attr("stroke-width", 3);

    link
      .append("text")
      .attr("class", "link-text")
      .attr("dx", d => `${midpoint(d)[0]}px`)
      .attr("dy", d => `${midpoint(d)[1]}px`)
      .attr(
        "transform",
        d => `rotate(${rotate(d)},${midpoint(d)[0]},${midpoint(d)[1]})`
      )
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle")
      .text((d: any) => d.value);
    // For some reason this function doesn't even do anything
    // .text((d: any) => "yes");
    // .text((d: any) => `${d.value.toString().substring(0, 5)}...`);

    const node = svg
      .selectAll("node")
      .data(this._graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
    // .call(
    //   (<any>d3)
    //     .drag()
    //     .on("start", dragstarted)
    //     .on("drag", dragged)
    //     .on("end", dragended)
    // );

    const circle = node
      .append("circle")
      // .enter()
      .attr("r", this._nodeRadius)
      .attr("class", d => (d.id.indexOf("output") !== -1 ? "output" : ""))
      .attr("fill", d => this._nodeColors(String(d.group)));

    // const node = svg
    //   .append("g")
    //   .attr("class", "nodes")
    //   .selectAll("circle")
    //   .data(graph.nodes)
    //   .enter()
    //   .append("circle")
    //   .attr("r", this._nodeRadius)
    //   .attr("fill", d => color(String(d.group)));

    // node.attr("transform", d => `translate(${d.x}, ${d.y})`);

    // const labels = node
    //   .append("text")
    //   .text(d => d.value)
    //   .attr("x", 13)
    //   .attr("y", 5);

    node
      .append("text")
      .attr("class", "node-text")
      .attr("dx", `0px`)
      .attr("dy", `0.07em`)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle")
      .text((d: any) => d.value);

    // simulation.nodes(graph.nodes).on("tick", ticked);

    // (<any>simulation).force("link").links(graph.links);

    // function ticked() {
    //   link
    //     .attr("x1", d => (<any>d.source).x)
    //     .attr("y1", d => (<any>d.source).y)
    //     .attr("x2", d => (<any>d.target).x)
    //     .attr("y2", d => (<any>d.target).y);

    //   node.attr("transform", d => `translate(${(<any>d).x},${(<any>d).y})`);
    // }

    // function dragstarted(d: any) {
    //   if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    //   d.fx = d.x;
    //   d.fy = d.y;
    // }

    // function dragged(d: any) {
    //   d.fx = d3.event.x;
    //   d.fy = d3.event.y;
    // }

    // function dragended(d: any) {
    //   if (!d3.event.active) simulation.alphaTarget(0);
    //   d.fx = null;
    //   d.fy = null;
    // }
  }

  update(): void {
    // To be removed
    // if (!this._d3Initialized) {
    //   return;
    // }

    // if (this._heredity.history.length !== this._lastHistoryLength) {
    if (this._options.chromosome !== undefined) {
      this._chromosome = this._options.chromosome;
      this._options.chromosome = undefined;
    } else {
      this._chromosome = <NeuralChromosome>(
        this._heredity.chromosomes[this._options.index!]
      );
    }

    if (!this._chromosome.tags.has("dead")) {
      this._deadIndicatorElement.classList.add("hidden");
    } else {
      this._deadIndicatorElement.classList.remove("hidden");
    }

    this._dnaPill!.setChromosome(this._chromosome);
    this._dnaPill!.update();

    this._chromosome!.onCompute(this._chromosome, () => {
      this.updated3();
    });

    // this._lastHistoryLength = this._heredity.history.length;
    // }

    const graphCoords = this.genGraphCoords(this._chromosome!);
    // this._graph = this.buildGraph(this._chromosome!, graphCoords);
    this.updated3();
  }

  updated3() {
    // this._graph.nodes[0].value = Math.random() * 50;
    // const text = d3.selectAll("text");
    // text.text((d: any) => d.value);
    // console.log(this._graph);
    // console.log(text);
    const links = d3.selectAll(".link-text").data(this._graph.links);
    // links.text((d: any) => d.value);
    links.exit().remove();
    links
      .enter()
      .append("text")
      .merge(<any>links)
      .text((d: any) => `${d.value.toString().substring(0, 11)}`);

    this._graph = this.buildGraph(
      this._chromosome!,
      this.genGraphCoords(this._chromosome!)
    );

    const nodes = d3.selectAll(".node-text").data(this._graph.nodes);
    // links.text((d: any) => d.value);
    nodes.exit().remove();
    nodes
      .enter()
      .append("text")
      .merge(<any>nodes)
      .text((d: any) => {
        let value = d.value;
        value = value === 0 ? `0` : `${value.toString().substring(0, 5)}...`;
        return value;
      });

    if (this._options.threshhold) {
      const outputNeuronCount = this._chromosome!.cerebrum.layers[
        this._chromosome!.cerebrum.layers.length - 1
      ].neurons.length;
      const outputs = d3
        .selectAll(".output")
        .data(
          this._graph.nodes.slice(this._graph.nodes.length - outputNeuronCount)
        );
      outputs.attr("fill", d =>
        this._options.threshhold!.apply(null, [(<any>d).value])
          ? this._nodeColors(String(d.group + 1))
          : this._nodeColors(String(d.group))
      );
      outputs.attr("class", d =>
        this._options.threshhold!.apply(null, [(<any>d).value])
          ? "output activated"
          : "output"
      );
    }
  }

  // Fancy wobbly touchy display. Didn't work
  // initd3() {
  //   const graph = {
  //     nodes: [
  //       { id: "input1", group: 1 },
  //       { id: "input2", group: 1 },
  //       { id: "hidden1", group: 2 },
  //       { id: "hidden2", group: 2 },
  //       { id: "output1", group: 3 }
  //     ],
  //     links: [
  //       { source: "input1", target: "hidden1", value: 6 },
  //       { source: "input1", target: "hidden2", value: 3 },
  //       { source: "input2", target: "hidden1", value: 4 },
  //       { source: "input2", target: "hidden2", value: 1 },
  //       { source: "hidden1", target: "output1", value: 9 },
  //       { source: "hidden2", target: "output1", value: 4 }
  //     ]
  //   };

  //   const svg = d3.select(this._parentElement).append("svg");
  //   // const width = +svg.attr("width");
  //   // const height = +svg.attr("height");
  //   const width = this._parentElement.clientWidth;
  //   const height = this._parentElement.clientHeight;
  //   svg.attr("width", width);
  //   svg.attr("height", height);

  //   const color = d3.scaleOrdinal(d3.schemeCategory10);

  //   const simulation = d3
  //     .forceSimulation()
  //     .force("link", d3.forceLink().id(d => (<any>d).id))
  //     .force("charge", d3.forceManyBody())
  //     .force("center", d3.forceCenter(width / 2, height / 2));

  //   const link = svg
  //     .append("g")
  //     .attr("class", "links")
  //     .selectAll("line")
  //     .data(graph.links)
  //     .enter()
  //     .append("line")
  //     .attr("stroke-width", d => Math.sqrt(d.value));

  //   const node = svg
  //     .append("g")
  //     .attr("class", "nodes")
  //     .selectAll("circle")
  //     .data(graph.nodes)
  //     .enter()
  //     .append("circle")
  //     .attr("r", 30)
  //     .attr("fill", d => color(String(d.group)))
  //     .call(
  //       (<any>d3)
  //         .drag()
  //         .on("start", dragstarted)
  //         .on("drag", dragged)
  //         .on("end", dragended)
  //     );

  //   const labels = node
  //     .append("text")
  //     .text(d => d.id)
  //     .attr("x", 13)
  //     .attr("y", 5);

  //   node.append("title").text(d => d.id);

  //   simulation.nodes(graph.nodes).on("tick", ticked);

  //   (<any>simulation).force("link").links(graph.links);

  //   // const node = svg
  //   //   .append("g")
  //   //   .attr("class", "nodes")
  //   //   .selectAll("g")
  //   //   .data(graph.nodes)
  //   //   .enter()
  //   //   .append("g");

  //   // const circles = node
  //   //   .append("circle")
  //   //   .attr("r", 10)
  //   //   .attr("fill", d => color(String(d.group)))
  //   //   .call(
  //   //     (<any>d3)
  //   //       .drag()
  //   //       .on("start", dragstarted)
  //   //       .on("drag", dragged)
  //   //       .on("end", dragended)
  //   //   );

  //   // const labels = node
  //   //   .append("text")
  //   //   .text(d => d.id)
  //   //   .attr("x", 13)
  //   //   .attr("y", 5);

  //   // node.append("title").text(d => d.id);

  //   // simulation.nodes(graph.nodes).on("tick", ticked);

  //   // (<any>simulation.force("link")).links(graph.links);

  //   function ticked() {
  //     link
  //       .attr("x1", d => (<any>d.source).x)
  //       .attr("y1", d => (<any>d.source).y)
  //       .attr("x2", d => (<any>d.target).x)
  //       .attr("y2", d => (<any>d.target).y);

  //     node.attr("transform", d => `translate(${(<any>d).x},${(<any>d).y})`);
  //   }

  //   function dragstarted(d: any) {
  //     if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  //     d.fx = d.x;
  //     d.fy = d.y;
  //   }

  //   function dragged(d: any) {
  //     d.fx = d3.event.x;
  //     d.fy = d3.event.y;
  //   }

  //   function dragended(d: any) {
  //     if (!d3.event.active) simulation.alphaTarget(0);
  //     d.fx = null;
  //     d.fy = null;
  //   }
  // }

  buildGraph(chrom: NeuralChromosome, graphCoords: number[][]): GraphInterface {
    const graph: GraphInterface = {
      nodes: [],
      links: []
    };

    let neuronCount = 0;
    chrom.cerebrum.layers.forEach((l, layerIndex) => {
      // Build nodes
      if (layerIndex === 0) {
        l.neurons.forEach((n, neuronIndex) => {
          graph.nodes.push({
            id: `input${neuronIndex}`,
            group: layerIndex + 1,
            value: n.value,
            x: graphCoords[neuronCount][0],
            y: graphCoords[neuronCount][1]
          });

          neuronCount += 1;
        });
      } else if (layerIndex === chrom.cerebrum.layers.length - 1) {
        l.neurons.forEach((n, neuronIndex) => {
          const thisId = `output${neuronIndex}`;

          graph.nodes.push({
            id: thisId,
            group: layerIndex + 1,
            value: n.value,
            x: graphCoords[neuronCount][0],
            y: graphCoords[neuronCount][1]
          });

          neuronCount += 1;

          // Build links
          n.weights.forEach((e, weightIndex) => {
            graph.links.push({
              target: `hidden${weightIndex}L${layerIndex - 1}`,
              source: thisId,
              value: e // .toString().substring(0, 9)
            });
          });
        });
      } else {
        l.neurons.forEach((n, neuronIndex) => {
          const thisId = `hidden${neuronIndex}L${layerIndex}`;

          graph.nodes.push({
            id: thisId,
            group: layerIndex + 1,
            value: n.value,
            x: graphCoords[neuronCount][0],
            y: graphCoords[neuronCount][1]
          });

          neuronCount += 1;

          // Build links
          n.weights.forEach((e, weightIndex) => {
            let target = "";

            if (layerIndex === 1) {
              target = `input${weightIndex}`;
            } else {
              target = `hidden${weightIndex}L${layerIndex - 1}`;
            }

            graph.links.push({
              target,
              source: thisId,
              value: e // .toString().substring(0, 9)
            });
          });
        });
      }
    });

    // console.log(graph);

    return graph;
  }

  genGraphCoords(chrom: NeuralChromosome): number[][] {
    const coords: number[][] = [];

    // const inputNodeLength = chrom.cerebrum.layers[0].neurons.length;
    let maxNodeLength = 0;
    chrom.cerebrum.layers.forEach(l => {
      maxNodeLength = Math.max(l.neurons.length, maxNodeLength);
    });
    const minHeight =
      maxNodeLength * (this._nodeRadius * 2) +
      this._padding * 2 +
      (this._nodeMargin * maxNodeLength - 1);
    if (this._parentElement.clientHeight < minHeight) {
      this._parentElement.style.height = `${minHeight}px`;
    }
    const elementHeight = this._parentElement.clientHeight;
    const elementWidth = this._parentElement.clientWidth;

    chrom.cerebrum.layers.forEach((l, layerIndex) => {
      const sectionHeight = elementHeight / l.neurons.length;
      const sectionWidth = elementWidth / chrom.cerebrum.layers.length;

      l.neurons.forEach((n, neuronIndex) => {
        coords.push([
          (layerIndex + 1) * sectionWidth - sectionWidth / 2,
          (neuronIndex + 1) * sectionHeight - sectionHeight / 2
        ]);
      });
    });

    return coords;
  }

  // private injectScript(url: string, callback: () => void, scriptId: string) {
  //   const existingScript = document.getElementById(scriptId);

  //   if (!existingScript) {
  //     const script = document.createElement("script");
  //     script.src = url;
  //     script.id = scriptId;

  //     document.body.appendChild(script);

  //     script.onload = () => {
  //       if (callback) callback();
  //     };
  //   }

  //   if (existingScript && callback) callback();
  // }

  link(toLink: VizClass): boolean {
    if (toLink instanceof DnaViz) {
      toLink.onPillHover(this, (chrom: GenericChromosome<any>) => {
        this._options.chromosome = <NeuralChromosome>chrom;
        // this._options.index = undefined;
        this.init();
        this._chromosome!.onCompute(this._chromosome, () => {
          this.updated3();
        });
      });

      return true;
    }
    return false;
  }
}

interface GraphNodeInterface {
  id: string;
  value: number;
  group: number;
  x: number;
  y: number;
}

interface GraphLinkInterface {
  source: string;
  target: string;
  value: number;
}

interface GraphInterface {
  nodes: GraphNodeInterface[];
  links: GraphLinkInterface[];
}

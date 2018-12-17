import Heredity from "../Heredity";
import VizClass from "./VizClass";
import DnaViz from "./DnaViz";
import NeuralChromosome from "../chromosomes/NeuralChromosome";
import * as d3 from "d3";
import { GenericChromosome } from "..";

// TODO Optimize by minimizing DOM manipulation
// Don't delete DOM on refresh

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

  private _d3Url = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js";
  private _d3Initialized = false;
  private _d3ScriptId = "perceptron-viz-d3-id";

  private _lastHistoryLength = 0;

  private _graph: GraphInterface = {
    nodes: [],
    links: []
  };

  private _nodeColors = d3.scaleOrdinal(d3.schemeCategory10);

  private _style = `
    .viz__perceptron-container {
      background: white;
      border-radius: 0.3em;
      border: 1px solid #d0d0d0;
    }

    .viz__perceptron-canvas {

    }

    .link line {
      stroke: #999;
      stroke-opacity: 0.6;
    }

    .link text {
      font-size: 0.8em;
    }

    .node circle {
      stroke: #fff;
      stroke-width: 3px;
      cursor: pointer;

      transition: 200ms ease;
    }

    .node circle:hover {
      stroke: rgba(0, 0, 0, 0.4);
    }

    .node text {
      font-size: 0.8em;
    }

    .node .output.activated {
      stroke: rgba(0, 0, 0, 0.4);
      stroke-width: 6px;
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

    this.injectStylesheet(this._style, this._styleId);
    // this.injectScript(
    //   this._d3Url,
    //   () => {
    //     this._d3Initialized = true;
    //     this.initd3();
    //   },
    //   this._d3ScriptId
    // );
    // Remove the initialized tag later
    this._d3Initialized = true;
    this.initd3();

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

    this._chromosome!.onCompute(this._chromosome, () => {
      this.updated3();
    });
  }

  update(): void {
    if (!this._d3Initialized) {
      return;
    }

    if (this._heredity.history.length !== this._lastHistoryLength) {
      if (this._options.chromosome !== undefined) {
        this._chromosome = this._options.chromosome;
      } else {
        this._chromosome = <NeuralChromosome>(
          this._heredity.chromosomes[this._options.index!]
        );
      }

      this._chromosome!.onCompute(this._chromosome, () => {
        this.updated3();
      });

      this._lastHistoryLength = this._heredity.history.length;
    }

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

    const constraints = {
      top: this._padding + this._nodeRadius,
      right: this._parentElement.clientWidth - this._padding - this._nodeRadius,
      bottom:
        this._parentElement.clientHeight - this._padding - this._nodeRadius,
      left: this._padding + this._nodeRadius
    };

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

  private injectScript(url: string, callback: () => void, scriptId: string) {
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = url;
      script.id = scriptId;

      document.body.appendChild(script);

      script.onload = () => {
        if (callback) callback();
      };
    }

    if (existingScript && callback) callback();
  }

  link(toLink: VizClass): boolean {
    if (toLink instanceof DnaViz) {
      toLink.onPillHover(this, (chrom: GenericChromosome<any>) => {
        console.log("Test");
        this._chromosome = <NeuralChromosome>chrom;
        this.init();
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

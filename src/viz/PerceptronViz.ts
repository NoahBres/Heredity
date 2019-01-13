import Heredity from "../Heredity";
import {
  default as VizClass,
  cssPrefix,
  injectStylesheet,
  DnaPill
} from "./VizClass";
import DnaViz from "./DnaViz";
import NeuralChromosome from "../chromosomes/NeuralChromosome";
import GenericChromosome from "../chromosomes/GenericChromosome";
import * as SVG from "svg.js";

export default class PerceptronViz implements VizClass {
  _heredity: Heredity;
  _parentElement: HTMLElement;

  private _chromosome?: NeuralChromosome;
  private _lastChromosome?: NeuralChromosome;
  private _options: {
    index?: number;
    chromosome?: NeuralChromosome;
    threshhold?: (i: number) => boolean;
  } = {};

  private _nodeRadius = 50;
  private _nodeMargin = 0;
  private _padding = 20;

  private _graph: GraphInterface = {
    nodes: [],
    links: []
  };

  private _deadIndicatorElement: HTMLElement;

  private _dnaPill?: DnaPill;
  private readonly _dnaPillClassName = `${cssPrefix}perceptron-viz-dna-pill`;

  private readonly _containerClassName = "perceptron-container";

  private _canvas?: SVG.Doc;
  private readonly _canvasId = `${cssPrefix}perceptron-viz-canvas`;

  private _drawingNodes: NeuralNode[] = [];
  private _drawingLinks: NeuralNodeLink[] = [];

  private _skullSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Your_Icon" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M89.12,85.757c-4.392-1.602-4.796,2.233-12.704-0.645l-15.48-5.634l15.479-5.635c7.911-2.875,8.31,0.957,12.706-0.643  c1.754-0.639,2.875-3.036,2.234-4.796c-0.639-1.757-1.079-1.595-1.716-3.354c-0.642-1.76-0.201-1.918-0.843-3.675  c-0.639-1.761-3.037-2.876-4.794-2.233c-4.394,1.596-2.238,4.793-10.146,7.672L50,75.498l-23.858-8.684  c-7.909-2.878-5.75-6.076-10.145-7.674c-1.756-0.639-4.153,0.478-4.793,2.237c-0.643,1.755-0.202,1.916-0.84,3.674  c-0.64,1.756-1.081,1.6-1.723,3.355c-0.638,1.76,0.481,4.155,2.238,4.796c4.396,1.599,4.794-2.236,12.704,0.642l15.48,5.634  l-15.48,5.635c-7.909,2.879-8.311-0.959-12.704,0.643c-1.756,0.639-2.875,3.035-2.234,4.795c0.636,1.758,1.076,1.598,1.719,3.354  c0.639,1.757,0.2,1.92,0.836,3.679c0.643,1.758,3.039,2.874,4.798,2.235c4.396-1.602,2.235-4.795,10.144-7.675L50,83.459  l23.857,8.683c7.909,2.883,5.751,6.075,10.146,7.676c1.755,0.638,4.154-0.479,4.795-2.238c0.64-1.756,0.198-1.916,0.842-3.673  c0.639-1.76,1.079-1.599,1.717-3.356C91.999,88.791,90.879,86.394,89.12,85.757z"/><path d="M50,0C36.745,0,26,10.745,26,24v21c0,2.2,1.323,5.221,2.939,6.713l7.121,6.574c1.617,1.492,3.39,4.288,3.939,6.213  s2.8,3.5,5,3.5h10c2.2,0,4.45-1.575,5-3.5s2.322-4.721,3.939-6.213l7.121-6.574C72.678,50.221,74,47.2,74,45V24  C74,10.745,63.255,0,50,0z M38.461,49C34.596,49,32,45.768,32,42.455C32,39.141,35.134,37,39,37s7,2.141,7,5.455  C46,45.768,42.328,49,38.461,49z M50,58c-2,0-3-1-3-3s2-6,3-6s3,4,3,6S52,58,50,58z M61.538,49C57.673,49,54,45.768,54,42.455  C54,39.141,57.134,37,61,37s7,2.141,7,5.455C68,45.768,65.404,49,61.538,49z"/></svg>';

  private _style = `
    .${cssPrefix}${this._containerClassName} {
      background: white;
      border-radius: 0.3em;
      border: 1px solid #d0d0d0;

      position: relative;
    }

    .${cssPrefix}${this._containerClassName} .dead-indicator svg {
      position: absolute;
      top: 0.5em;
      left: 0.5em;

      height: 1.5em;
      width: 1.5em;
      fill: #d62728;
    }

    .${cssPrefix}${this._containerClassName} .dead-indicator.hidden {
      display: none;
    }

    .${cssPrefix}${this._containerClassName} .link line {
      stroke: #999;
      stroke-opacity: 0.6;
    }

    .${cssPrefix}${this._containerClassName} .link text {
      font-size: 0.8em;
    }

    .${cssPrefix}${this._containerClassName} .node circle {
      stroke: #fff;
      stroke-width: 3px;
      cursor: pointer;

      transition: 200ms ease;
    }

    .${cssPrefix}${this._containerClassName} .node circle:hover {
      stroke: rgba(0, 0, 0, 0.4);
    }

    .${cssPrefix}${this._containerClassName} .node text {
      font-size: 0.8em;
    }

    .${cssPrefix}${this._containerClassName} .node .output.activated {
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

    this._parentElement.classList.add(
      `${cssPrefix}${this._containerClassName}`
    );
    injectStylesheet(this._style, this._styleId);

    this._deadIndicatorElement = document.createElement("div");
    this._deadIndicatorElement.classList.add("dead-indicator", "hidden");
    this._deadIndicatorElement.innerHTML = this._skullSvg;
    this._parentElement.appendChild(this._deadIndicatorElement);

    const canvas = document.createElement("div");
    canvas.id = this._canvasId;
    this._parentElement.appendChild(canvas);

    window.addEventListener("resize", () => {
      this.resize();
    });

    this._options = options;
    this._heredity = heredity;

    heredity.addHook("genPopPost", this, this.init);
    heredity.addHook("nextGenPost", this, this.update);
  }

  init() {
    // Main initialize
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

    this._lastChromosome = this._chromosome;

    if (!this._chromosome.tags.has("dead")) {
      this._deadIndicatorElement.classList.add("hidden");
    } else {
      this._deadIndicatorElement.classList.remove("hidden");
    }

    this._dnaPill = new DnaPill(this._chromosome, this._dnaPillClassName);
    this._parentElement.appendChild(this._dnaPill.element);

    this._chromosome.onCompute(this._chromosome, () => {
      this.updateSVG();
    });

    this._chromosome.tags.onChange(this._chromosome, () => {
      this.update();
    });

    // Drawing Initialize
    let graphCoords: number[][] = [];

    if (this._chromosome !== undefined) {
      graphCoords = this.genGraphCoords(this._chromosome);
      this._graph = this.buildGraph(this._chromosome, graphCoords);
    }

    this._canvas = SVG(this._canvasId);

    // Links must be declared before nodes since they're drawn in the constructor
    // TODO Optimize this by moving this to buildGraph()
    this._graph.links.forEach(n => {
      const target = this._graph.nodes.find(e => e.id === n.target);
      const source = this._graph.nodes.find(e => e.id === n.source);
      this._drawingLinks.push(
        new NeuralNodeLink({
          x1: target!.x,
          y1: target!.y,
          x2: source!.x,
          y2: source!.y,
          strokeWidth: 2,
          color: "#999",
          draw: this._canvas!
        })
      );
    });

    // TODO Optimize and move this to buildGraph()
    this._graph.nodes.forEach((n, i) => {
      let color: string = "#000";

      switch (n.group) {
        case 1:
          color = "#ff0080";
          break;
        case 2:
          color = "#f5a623";
          break;
        case 3:
          color = "#0076ff";
          break;
      }

      this._drawingNodes.push(
        new NeuralNode({
          color,
          x: graphCoords[i][0],
          y: graphCoords[i][1],
          radius: this._nodeRadius,
          draw: this._canvas!
        })
      );
    });

    this.updateSVG();

    this._parentElement.dataset.initialized = "true";
  }

  update() {
    if (this._options.chromosome !== undefined) {
      this._chromosome = this._options.chromosome;
      this._options.chromosome = undefined;
    } else {
      this._chromosome = <NeuralChromosome>(
        this._heredity.chromosomes[this._options.index!]
      );
    }

    if (this._lastChromosome !== this._chromosome) {
      this._chromosome!.onCompute(this._chromosome, () => {
        this.updateSVG();
      });

      this._chromosome.tags.onChange(this._chromosome, () => {
        this.update();
      });
    }

    if (!this._chromosome.tags.has("dead")) {
      this._deadIndicatorElement.classList.add("hidden");
    } else {
      this._deadIndicatorElement.classList.remove("hidden");
    }

    this._dnaPill!.setChromosome(this._chromosome);
    this._dnaPill!.update();

    this.updateSVG();
  }

  updateSVG() {
    this._graph = this.buildGraph(
      this._chromosome!,
      this.genGraphCoords(this._chromosome!)
    );

    this._graph.nodes.forEach((n, i) => {
      this._drawingNodes[i].value = n.value;
    });

    if (this._options.threshhold) {
      const outputNeuronCount = this._chromosome!.cerebrum.layers[
        this._chromosome!.cerebrum.layers.length - 1
      ].neurons.length;

      // Move this to the for loop 10 lines up to optimize so there isn't an extra loop
      this._graph.nodes
        .slice(this._graph.nodes.length - outputNeuronCount)
        .forEach((n, i) => {
          const index = this._graph.nodes.length - outputNeuronCount + i;
          const threshold = this._options.threshhold!.apply(null, [n.value]);
          this._drawingNodes[index].strokeColor = threshold
            ? "#660090"
            : "#fff";
          this._drawingNodes[index].strokeWidth = threshold ? 2 : 4;
        });
    }

    this._graph.links.forEach((n, i) => {
      this._drawingLinks[i].value = n.value;
    });
  }

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

  resize() {
    let graphCoords: number[][] = [];

    if (this._chromosome !== undefined) {
      graphCoords = this.genGraphCoords(this._chromosome);
      this._graph = this.buildGraph(this._chromosome, graphCoords);
    }

    this._graph.links.forEach((n, i) => {
      const target = this._graph.nodes.find(e => e.id === n.target);
      const source = this._graph.nodes.find(e => e.id === n.source);
      this._drawingLinks[i].setCoords(
        target!.x,
        target!.y,
        source!.x,
        source!.y
      );
    });

    // TODO Optimize and move this to buildGraph()
    this._graph.nodes.forEach((n, i) => {
      this._drawingNodes[i].x = graphCoords[i][0];
      this._drawingNodes[i].y = graphCoords[i][1];
    });
  }

  link(toLink: VizClass): boolean {
    if (toLink instanceof DnaViz) {
      toLink.onPillHover(this, (chrom: GenericChromosome<any>) => {
        this._options.chromosome = <NeuralChromosome>chrom;
        // this._options.index = undefined;
        this.init();
        this._chromosome!.onCompute(this._chromosome, () => {
          this.updateSVG();
        });
      });

      return true;
    }

    return false;
  }
}

class NeuralNode {
  private _x: number;
  private _y: number;
  private _radius: number;
  private _color: string;
  private _strokeColor: string;
  private _strokeWidth: number;

  private _group: SVG.G;
  private _draw: SVG.Doc;
  private _text: SVG.Text;
  private _node: SVG.Circle;

  private _value = 0;

  private truncateLength = 5;

  constructor({
    x,
    y,
    radius,
    color,
    draw
  }: {
    x: number;
    y: number;
    radius: number;
    color: string;
    draw: SVG.Doc;
  }) {
    this._x = x;
    this._y = y;
    this._radius = radius;
    this._color = color;
    this._draw = draw;

    this._strokeColor = "#fff";
    this._strokeWidth = 4;

    // this.draw();
    // this._draw
    //   .circle(this._radius)
    //   .fill(this._color)
    //   // .stroke({ color: "#f06", opacity: 0.6, width: 5 })
    //   .move(this._x - this._radius / 2, this._y - this._radius / 2);

    // this._draw
    //   .text("Test")
    //   .font({ size: 15, anchor: "middle" })
    //   .move(this._x, this._y - 7.5);

    // this._draw
    //   .rect(3, 3)
    //   .fill("#000")
    //   .move(this._x - 1, this._y - 1);

    this._group = this._draw.group();
    this._group.move(this._x, this._y);

    this._node = this._draw
      .circle(this._radius)
      .fill(this._color)
      .stroke({
        color: this._strokeColor,
        opacity: 1,
        width: this._strokeWidth
      })
      .move(-this._radius / 2, -this._radius / 2);

    this._text = this._draw
      .plain("test")
      .font({ size: 12, anchor: "middle" })
      .cy(0);
    this._group.add(this._node);
    this._group.add(this._text);
  }

  set value(value: number) {
    const lastVal = this._value;
    this._value = value;
    if (lastVal !== value) {
      this._text.plain(
        `${this._value.toString().substring(0, this.truncateLength)}...`
      );
    }
  }

  set strokeColor(color: string) {
    const lastColor = this._strokeColor;
    this._strokeColor = color;
    if (lastColor !== color) {
      this._node.animate(80).attr({ stroke: color });
    }
  }

  set strokeWidth(width: number) {
    const lastWidth = this._strokeWidth;
    this._strokeWidth = width;
    if (lastWidth !== width) {
      this._node.animate(80).attr({ "stroke-width": width });
    }
  }

  set x(x: number) {
    this._x = x;
    this._group.x(this._x);
  }

  set y(y: number) {
    this._y = y;
    this._group.y(this._y);
  }
}

class NeuralNodeLink {
  private _x1: number;
  private _x2: number;
  private _y1: number;
  private _y2: number;
  private _strokeWidth: number;
  private _color: string;

  private _draw: SVG.Doc;
  private _line: SVG.Line;
  private _text: SVG.Text;

  private _value = 0;

  private _truncateLength = 10;

  constructor({
    x1,
    y1,
    x2,
    y2,
    strokeWidth,
    color,
    draw
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    strokeWidth: number;
    color: string;
    draw: SVG.Doc;
  }) {
    this._x1 = x1;
    this._y1 = y1;
    this._x2 = x2;
    this._y2 = y2;
    this._strokeWidth = strokeWidth;
    this._color = color;
    this._draw = draw;

    // this.draw();

    const midpoint = {
      x: (this._x1 + this._x2) / 2,
      y: (this._y1 + this._y2) / 2
    };

    const rotate =
      (Math.atan2(this._y2 - this._y1, this._x2 - this._x1) * 180) / Math.PI;

    // const group = this._draw.group().move(this._x1, this._y1);
    // .move(Math.min(this._x1, this._x2), Math.min(this._y1, this._y2));

    this._line = this._draw
      .line(this._x1, this._y1, this._x2, this._y2)
      // .line(0, 0, this._x2 - this._x1, this._y2 - this._y1)
      .stroke({ color: this._color, width: this._strokeWidth, opacity: 0.6 });

    // console.log({ x1: this._x1, x2: this._x2, y1: this._y1, y2: this._y2 });

    this._text = this._draw
      .plain("test 2")
      .font({ size: 13, anchor: "middle" })
      .move(midpoint.x, midpoint.y - 8)
      .rotate(rotate, midpoint.x, midpoint.y);

    // .x(Math.abs(this._x1 - this._x2) / 2);

    // group.add(line);
    // group.add(text);
  }

  setCoords(x1: number, y1: number, x2: number, y2: number) {
    this._x1 = x1;
    this._x2 = x2;
    this._y1 = y1;
    this._y2 = y2;

    const midpoint = {
      x: (this._x1 + this._x2) / 2,
      y: (this._y1 + this._y2) / 2
    };

    const rotate =
      (Math.atan2(this._y2 - this._y1, this._x2 - this._x1) * 180) / Math.PI;

    this._line.plot(this._x1, this._y1, this._x2, this._y2);

    this._text
      .x(midpoint.x)
      .y(midpoint.y - 8)
      .attr("transform", `rotate(${rotate} ${midpoint.x},${midpoint.y})`);
  }

  set value(value: number) {
    const lastVal = this._value;
    this._value = value;
    if (lastVal !== value) {
      this._text.plain(
        `${this._value.toString().substring(0, this._truncateLength)}...`
      );
    }
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

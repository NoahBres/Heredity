import Layer from "./Layer";
import CerebrumData from "./CerebrumData";

export default class Cerebrum {
  private _layers: Layer[] = [];

  private _activation: (arg1: number) => number;

  constructor(
    inputsLength: number,
    hiddenLength: number[],
    outputLength: number,
    activation = Cerebrum.prototype.sigmoid
  ) {
    const inputLayer = new Layer().randomize(inputsLength, 0);
    this._layers.push(inputLayer);

    let previousLayerSize = inputsLength;
    for (let i = 0; i < hiddenLength.length; i++) {
      const layer = new Layer().randomize(hiddenLength[i], previousLayerSize);
      previousLayerSize = hiddenLength[i];
      this._layers.push(layer);
    }

    const outputLayer = new Layer().randomize(outputLength, previousLayerSize);
    this._layers.push(outputLayer);

    this._activation = activation;
  }

  export(): CerebrumData {
    const data: CerebrumData = {
      neuronsInLayer: [],
      neuronWeights: []
    };

    for (let i = 0; i < this._layers.length; i++) {
      data.neuronsInLayer.push(this._layers[i].neurons.length);
      for (let j = 0; j < this._layers[i].neurons.length; j++) {
        for (let k = 0; k < this._layers[i].neurons[j].weights.length; k++) {
          data.neuronWeights.push(this._layers[i].neurons[j].weights[k]);
        }
      }
    }

    return data;
  }

  import(data: CerebrumData) {
    this._layers = [];

    let previousNeurons = 0;
    let indexWeights = 0;
    const layers: Layer[] = [];

    for (let i = 0; i < data.neuronsInLayer.length; i++) {
      const layer = new Layer().randomize(
        data.neuronsInLayer[i],
        previousNeurons
      );

      for (let j = 0; j < layer.neurons.length; j++) {
        for (let k = 0; k < layer.neurons[j].weights.length; k++) {
          layer.neurons[j].weights[k] = data.neuronWeights[indexWeights++];
        }
      }

      previousNeurons = data.neuronsInLayer[i];
      this._layers.push(layer);
    }
  }

  compute(inputs: number[]): number[] {
    for (let i = 0; i < inputs.length; i++) {
      /* istanbul ignore next */
      if (this._layers[0] && this._layers[0].neurons[i]) {
        this._layers[0].neurons[i].value = inputs[i];
      }
    }

    let previousLayer = this._layers[0];
    for (let i = 1; i < this._layers.length; i++) {
      for (let j = 0; j < this._layers[i].neurons.length; j++) {
        let sum = 0;

        for (let k = 0; k < previousLayer.neurons.length; k++) {
          sum +=
            previousLayer.neurons[k].value *
            this._layers[i].neurons[j].weights[k];
        }

        this._layers[i].neurons[j].value = this._activation.call(this, sum);
      }

      previousLayer = this._layers[i];
    }

    const output: number[] = [];
    const lastLayer = this._layers[this._layers.length - 1];
    for (let i = 0; i < lastLayer.neurons.length; i++) {
      output.push(lastLayer.neurons[i].value);
    }

    return output;
  }

  sigmoid(i: number): number {
    return 1 / (1 + Math.exp(-i));
  }

  tanh(i: number): number {
    return Math.tanh(i);
  }

  setWeights(weights: number[]): Cerebrum {
    let weightsIndex = 0;

    for (let i = 1; i < this._layers.length; i++) {
      for (let j = 0; j < this._layers[i].neurons.length; j++) {
        const d = [];
        for (let k = 0; k < this._layers[i].neurons[j].weights.length; k++) {
          d[k] = weights[weightsIndex++];
        }
        this._layers[i].neurons[j].weights = d;
      }
    }

    return this;
  }

  getWeights(): number[] {
    const d = [];

    for (let i = 1; i < this._layers.length; i++) {
      for (let j = 0; j < this._layers[i].neurons.length; j++) {
        for (let k = 0; k < this._layers[i].neurons[j].weights.length; k++) {
          d.push(this._layers[i].neurons[j].weights[k]);
        }
      }
    }

    return d;
  }

  set layers(layers: Layer[]) {
    this._layers = layers;
  }

  get layers(): Layer[] {
    return this._layers;
  }

  get activation(): (arg1: number) => void {
    return this._activation;
  }
}

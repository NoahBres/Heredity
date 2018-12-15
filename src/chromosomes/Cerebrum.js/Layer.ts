import Neuron from "./Neuron";

export default class Layer {
  private _neurons: Neuron[] = [];

  constructor(neurons: Neuron[] = []) {
    this._neurons = neurons;
  }

  randomize(neuronsLength: number, inputsLength: number) {
    for (let i = 0; i < neuronsLength; i++) {
      const neuron = new Neuron().randomize(inputsLength);
      this._neurons.push(neuron);
    }

    return this;
  }

  set neurons(neurons: Neuron[]) {
    this._neurons = neurons;
  }

  get neurons(): Neuron[] {
    return this._neurons;
  }
}

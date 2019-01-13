import NumberChromosome from "./NumberChromosome";
import Cerebrum from "./Cerebrum.js/Cerebrum";
import CerebrumData from "./Cerebrum.js/CerebrumData";

export default class NeuralChromosome extends NumberChromosome {
  private _cerebrum: Cerebrum;
  private _cerebrumOptions: ConstructorOptions;

  private _computeListenerList: ComputeListenerObject[] = [];

  constructor(
    { inputLength, hiddenLength, outputLength, activation }: ConstructorOptions,
    length: number,
    genes: number[] = [],
    score: number = 0,
    cerebrum?: Cerebrum
  ) {
    super(
      {
        lowerBound: 0,
        upperBound: 1,
        round: false,
        clamp: false
      },
      length,
      genes,
      score
    );

    this._cerebrumOptions = {
      inputLength,
      hiddenLength,
      outputLength,
      activation
    };

    if (cerebrum) {
      this._cerebrum = cerebrum;
    } else {
      this._cerebrum = new Cerebrum(
        inputLength,
        hiddenLength,
        outputLength,
        activation
      );
    }
  }

  generate(): NeuralChromosome {
    return <NeuralChromosome>super.generate();
  }

  duplicate(): NeuralChromosome {
    return new NeuralChromosome(
      this._cerebrumOptions,
      this._length,
      this._genes,
      this._fitness,
      this._cerebrum
    );
  }

  // Expose cerebrum functions
  export(): CerebrumData {
    return this._cerebrum.export();
  }

  import(data: CerebrumData) {
    this._cerebrum.import(data);
  }

  compute(inputs: number[]): number[] {
    this._computeListenerList.forEach(l => l.listener.apply(l.thisVal, []));

    return this._cerebrum.compute(inputs);
  }

  setWeights(weights: number[]) {
    this._cerebrum.setWeights(weights);
  }

  getWeights(): number[] {
    return this._cerebrum.getWeights();
  }

  onCompute(thisVal: any, listener: () => void) {
    this._computeListenerList.push({ thisVal, listener });
  }

  static sigmoid(i: number): number {
    return 1 / (1 + Math.exp(-i));
  }

  static tanh(i: number): number {
    return Math.tanh(i);
  }

  get cerebrum(): Cerebrum {
    return this._cerebrum;
  }
}

interface ConstructorOptions {
  inputLength: number;
  hiddenLength: number[];
  outputLength: number;
  activation: (input: number) => number;
}

interface ComputeListenerObject {
  thisVal: any;
  listener: () => void;
}

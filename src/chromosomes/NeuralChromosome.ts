import NumberChromosome from "./NumberChromosome";
import Cerebrum from "./Cerebrum.js/Cerebrum";
import CerebrumData from "./Cerebrum.js/CerebrumData";

/**
 * ## NeuralChromosome
 * A chromosome that also packs a simple neural network (perceptron).
 *
 * Extends the NumberChromosome.
 *
 * #### Basic usage
 * @example
 * ```typescript
 *
 * import { NeuralChromsome } from "heredity";
 *
 * // Initialize a NeuralChromsome with 6 genes
 * // Creates a neural net with 2 input neurons, 1 hidden layer with 2 neurons, and 1 output neuron
 * const n = new NeuralChromosome(
 *   {
 *     inputLength: 2,
 *     hiddenLength: [2],
 *     outputLength: 1
 *   },
 *   6
 * );
 *
 * // Generate a chromosome with randomized numbers
 * n.generate();
 *
 * n.genes
 * // [ 0.454719, 0.003408, 0.924876 ]
 *
 * // Sets the weights of the neural network connections
 * n.setWeights([0.473456, 0.234625, 0.2346234]);
 *
 * // Get weights of the neural network connections
 * n.getWeights();
 * // [ 0.473456, 0.234625, 0.2346234 ]
 *
 * // Compute the neural net output nodes
 * n.compute([0.237145, 0.614527]);
 * // [0.3452765]
 * ```
 */
export default class NeuralChromosome extends NumberChromosome {
  /** Cerebrum (Perceptron) of the NueralChromosome */
  private _cerebrum: Cerebrum;
  /** Options for Cerebrum */
  private _cerebrumOptions: ConstructorOptions;

  /** List of onCompute listeners */
  private _computeListenerList: ComputeListenerObject[] = [];

  /**
   * @example
   * ```typescript
   *
   * // Initialize a NeuralChromsome with 6 genes
   * // Creates a neural net with 2 input neurons, 1 hidden layer with 2 neurons, and 1 output neuron
   * // Length of the chromosome will be set to the number of weights in the neural net
   * const n = new NeuralChromosome(
   *   {
   *     inputLength: 2,       // Number of neural net input nodes
   *     hiddenLength: [2],    // Hidden layers of the neural net
   *     outputLength: 1,      // Number of neural net output nodes
   *     activation: NeuralChromosome.sigmoid // (optional) Activation function of the neural net
   *   },
   *   [0.5324, 0.652354, 0.362345, 0.12346, 0.948532, 0.572834], // (optional) Manually set the gene values
   *   45, // (optional) Fitness of the chromosome
   * );
   * ```
   *
   * @param param0 Options for Cerebrum
   * @param genes Array of gene values
   * @param score Fitness of the chromosome
   * @param cerebrum Cerebrum to manualyl set
   */
  constructor(
    { inputLength, hiddenLength, outputLength, activation }: ConstructorOptions,
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
      0,
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

    this._length = this._cerebrum.getWeights().length;
    // Fixes super length being a 0
    if (!this._genes) this._genes = Array(this._length);
  }

  /** Generate random weights for the chromsome */
  generate(): NeuralChromosome {
    return <NeuralChromosome>super.generate();
  }

  /** Returns a duplicated chromosome. */
  duplicate(): NeuralChromosome {
    return new NeuralChromosome(
      this._cerebrumOptions,
      this._genes,
      this._fitness,
      this._cerebrum
    );
  }

  /** Export Cerebrum data */
  export(): CerebrumData {
    return this._cerebrum.export();
  }

  /**
   * Import Cerebrum data
   * @param data Data to import
   */
  import(data: CerebrumData) {
    this._cerebrum.import(data);
  }

  /**
   * Compute the feed forward output of the neural network.
   *
   * @example
   * ```typescript
   * const n = new NeuralChromosome(
   *   {
   *     inputLength: 2,
   *     hiddenLength: [2],
   *     outputLength: 2
   *   }
   * );
   *
   * n.generate();
   *
   * n.compute([0.23457, 0.976143])
   * // [ 0.349453, 0.869145 ]
   * // The number of outputs matches the outputLength
   * ```
   *
   * @param inputs Array of input values
   */
  compute(inputs: number[]): number[] {
    this._computeListenerList.forEach(l => l.listener.apply(l.thisVal, []));

    return this._cerebrum.compute(inputs);
  }

  /**
   *
   * @param weights
   */
  setWeights(weights: number[]) {
    this._cerebrum.setWeights(weights);
  }

  getWeights(): number[] {
    return this._cerebrum.getWeights();
  }

  onCompute(listener: () => void, thisVal?: any) {
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

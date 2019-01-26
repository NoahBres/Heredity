import GenericChromosome from "./GenericChromosome";

/**
 * ## NumberChromosome
 * A chromosome consisting of number gene values
 *
 * #### Basic usage
 * @example
 * ```typescript
 *
 * import { NumberChromosome } from "heredity";
 *
 * // Initialize a NumberChromosome with 5 genes
 * const n = new NumberChromosome({}, 5);
 *
 * // Generate a chromosome with randomized numbers
 * n.generate();
 *
 * n.genes
 * // [ 0.454719, 0.003408, 0.924876 ]
 * ```
 */
export default class NumberChromosome extends GenericChromosome<number> {
  /** Maximum value of number */
  protected _upperBound: number;
  /** Minimum value of number */
  protected _lowerBound: number;
  /** Whether or not to keep the numbers rounded (integers) */
  protected _round: boolean;
  /** (not actually implemented) Whether to clamp the number during mutations */
  protected _clamp: boolean;

  /**
   * @example
   * ```typescript
   *
   * // Initialize a chromosome with 3 genes and a fitness of 45
   * const n = new NumberChromosome(
   *    {
   *      lowerBound: 0,
   *      upperBound: 10,
   *      round: false,
   *    },
   *    3,
   *    [ 9.76315, 2.87543, 6.034597 ],
   *    45
   * )
   * ```
   * @param param0 Options for the number generation
   * @param length Length of chromosomes
   * @param genes Array of gene values
   * @param score Fitness
   */
  constructor(
    {
      lowerBound = 0,
      upperBound = 1,
      round = false,
      clamp = false
    }: ConstructorOptions,
    length: number,
    genes: number[] = [],
    score: number = 0
  ) {
    super(length, genes, score);

    this._upperBound = upperBound;
    this._lowerBound = lowerBound;
    this._round = round;
    this._clamp = clamp;

    if (this._lowerBound > this._upperBound) {
      [this._lowerBound, this._upperBound] = [
        this._upperBound,
        this._lowerBound
      ];
    }
  }

  /** Generate random gene values based on options passed in constructor. */
  generate(): NumberChromosome {
    this._genes = [];

    for (let i = 0; i < this._length; i++) {
      let min = this._lowerBound;
      let max = this._upperBound;

      if (this._round) {
        min = Math.ceil(this._lowerBound);
        max = Math.floor(this._upperBound);
      }

      let value = Math.random() * (max - min + (this._round ? 1 : 0)) + min;
      value = this._round ? Math.floor(value) : value;

      this._genes.push(value);
    }

    return this;
  }

  /** Returns an array of hue values (integers from 0-255) based on the value of the genes */
  getColorsHue(): number[] {
    const colors = this._genes.map(x => {
      function map(
        i: number,
        inMin: number,
        inMax: number,
        outMin: number,
        outMax: number
      ): number {
        return ((i - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
      }

      return map(x, this._lowerBound, this._upperBound, 0, 255);
    });

    return colors;
  }

  /** Returns a duplicated chromosome. */
  duplicate(): NumberChromosome {
    return new NumberChromosome(
      {
        lowerBound: this._lowerBound,
        upperBound: this._upperBound,
        round: this._round,
        clamp: this._clamp
      },
      this._length,
      this._genes,
      this._fitness
    );
  }
}

interface ConstructorOptions {
  lowerBound?: number;
  upperBound?: number;
  round?: boolean;
  clamp?: boolean;
}

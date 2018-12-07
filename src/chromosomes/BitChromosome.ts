import GenericChromosome from "./GenericChromosome";

/**
 * ## BitChromosome
 * A chromosome consisting of single bits (true/false or 1/0) as genes
 *
 * #### Basic usage
 * @example
 * ```typescript
 *
 * import { BitChromosome } from "heredity";
 *
 * // Initilaize a BitChromosome with 5 genes
 * const b = new BitChromosome(5);
 *
 * // Generate a chromosome with randomized bits
 * b.generate();
 *
 * b.genes
 * // [ true, false, false, true, true ]
 * ```
 *<p><br></p>
 *
 * BitChromosome will return a set of booleans rather than bits.
 * If you'd rather have bits (1's and 0's) here are two options:
 *
 * @example
 * ```typescript
 *
 * // Example 1 - Use map
 * const genes = b.genes;
 * const bits = genes.map(e => e === 1);
 * // [ 1, 1, 0, 1, 0 ]
 *
 * // Example 2 - Use NumberChromosome and round
 * const chromosome = new NumberChromosome({
 *    lowerBound: 0,
 *    upperBound: 1,
 *    round: true
 * }, 5);
 * chromosome.generate();
 *
 * chromosome.genes;
 * // [ 0, 0, 1, 0, 1 ]
 * ```
 */
export default class BitChromosome extends GenericChromosome<boolean> {
  /**
   * Generates a random set of bits (booleans).
   */
  generate(): BitChromosome {
    this._genes = [];

    for (let i = 0; i < this._length; i++) {
      const value = Math.floor(Math.random() * 2) === 0;
      this._genes.push(value);
    }

    return this;
  }

  /** Returns duplicated BitChromosome */
  duplicate(): BitChromosome {
    return new BitChromosome(this._length, this._genes, this._fitness);
  }
}

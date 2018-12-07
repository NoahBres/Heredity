import GenericChromosome from "./chromosomes/GenericChromosome";

/**
 * ####  Bit Flip Mutate
 * (Only mutates boolean chromosomes like BitChromosomes)
 * ([Explanation](http://www.obitko.com/tutorials/genetic-algorithms/crossover-mutation.php))
 *
 * Goes down the chromosomes and randomly flips the bit.
 *
 * @param chromosomes Array of chromosomes
 * @param chance The chance that the bit will be flipped
 * @param options Unused
 * @returns Returns an array of of mutated chromosomes
 */
export function bitFlipMutate(
  chromosomes: GenericChromosome<boolean>[],
  chance: number,
  options: any
): GenericChromosome<boolean>[] {
  const chromes: GenericChromosome<boolean>[] = [];

  for (let i = 0; i < chromosomes.length; i++) {
    const chrome = chromosomes[i].duplicate();

    for (let j = 0; j < chromosomes[i].genes.length; j++) {
      const rand = Math.random();

      if (rand <= chance) {
        const genes = [...chrome.genes];
        genes[j] = !genes[j];

        chrome.genes = genes;
      }
    }

    chromes.push(chrome);
  }

  return chromes;
}

/**
 * #### Addition Mutate
 * (Only mutates NumberChromosome)
 * ([Explanation](http://www.obitko.com/tutorials/genetic-algorithms/crossover-mutation.php))
 *
 * Goes down the chromosomes and will add or subtract a random amount within <code>mutationRange</code>
 *
 * @param chromosomes Array of chromosomes
 * @param chance The chance that the gene will have its value changed
 * @param options { mutationRange: 0.5 } Takes in an object that has the property mutationRange
 * @returns Returns an array of of mutated chromosomes
 */
export function additionMutate(
  chromosomes: GenericChromosome<number>[],
  chance: number,
  options: any
): GenericChromosome<number>[] {
  const mutationRange = options.mutationRange || 0.5;

  const chromes: GenericChromosome<number>[] = [];

  for (let i = 0; i < chromosomes.length; i++) {
    const chrome = chromosomes[i].duplicate();

    for (let j = 0; j < chromosomes[i].genes.length; j++) {
      const rand = Math.random();

      if (rand <= chance) {
        const genes = [...chrome.genes];
        const randPlus = Math.random() * mutationRange * 2 - mutationRange;

        genes[j] = genes[j] + randPlus;

        chrome.genes = genes;
      }
    }

    chromes.push(chrome);
  }

  return chromes;
}

/**
 * #### No Mutate
 *
 * Returns the array of chromosomes. Applies no mutations.
 *
 * @param chromosomes Array of chromosomes
 * @param chance Unused
 * @param options Unused
 * @returns Returns the chromosomes that is passed in
 */
export function noMutate(
  chromosomes: GenericChromosome<any>[],
  chance: number,
  options: any
): GenericChromosome<any>[] {
  return chromosomes;
}

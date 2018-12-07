import GenericChromosome from "./chromosomes/GenericChromosome";

/**
 * #### Single point crossover
 * ([Explanation](https://en.wikipedia.org/wiki/Crossover_(genetic_algorithm)#Single-point_crossover))
 *
 * Swaps the genes to the right of the point between the two parent chromosomes.
 *
 * @param parent1 Parent 1 of the crossover
 * @param parent2 Parent 2 of the crossover
 * @param index Index of the crossover
 * @returns An array of two of the children chromosomes
 */
export function singlePoint(
  parent1: GenericChromosome<any>,
  parent2: GenericChromosome<any>,
  index: number
): GenericChromosome<any>[] {
  const child1 = parent1.duplicate();
  const child2 = parent2.duplicate();

  const crossoverPoint = index;

  child1.genes = [
    ...parent1.genes.slice(0, crossoverPoint),
    ...parent2.genes.slice(crossoverPoint)
  ];
  child2.genes = [
    ...parent2.genes.slice(0, crossoverPoint),
    ...parent1.genes.slice(crossoverPoint)
  ];

  return [child1, child2];
}

/**
 * #### Single point cross
 * Picks a random point in the two parent chromosomes to cross.
 * Then passes it in to SinglePoint.
 *
 * @param parent1 Parent 1 of the crossover
 * @param parent2 Parent 2 of the crossover
 * @returns An array of two of the children chromosomes
 */
export function singlePointCross(
  parent1: GenericChromosome<any>,
  parent2: GenericChromosome<any>
): GenericChromosome<any>[] {
  return singlePoint(
    parent1,
    parent2,
    Math.floor(Math.random() * parent1.genes.length)
  );
}

/**
 * #### Two point crossover
 * ([Explanation](https://en.wikipedia.org/wiki/Crossover_(genetic_algorithm)#Two-point_and_k-point_crossover))
 *
 * Swaps the bits between the two selected points.
 *
 * @param parent1 Parent 1 of the crossover
 * @param parent2 Parent 2 of the crossover
 * @param index1 Index of the crossover
 * @param index2 Index 2 of the crossover
 * @returns An array of two of the children chromosomes
 */
export function twoPoint(
  parent1: GenericChromosome<any>,
  parent2: GenericChromosome<any>,
  index1: number,
  index2: number
): GenericChromosome<any>[] {
  const child1 = parent1.duplicate();
  const child2 = parent2.duplicate();

  let crossoverPoint1 = index1;
  let crossoverPoint2 = index2;

  if (crossoverPoint1 > crossoverPoint2) {
    [crossoverPoint1, crossoverPoint2] = [crossoverPoint2, crossoverPoint1];
  }

  child1.genes = [
    ...parent1.genes.slice(0, crossoverPoint1),
    ...parent2.genes.slice(crossoverPoint1, crossoverPoint2),
    ...parent1.genes.slice(crossoverPoint2)
  ];
  child2.genes = [
    ...parent2.genes.slice(0, crossoverPoint1),
    ...parent1.genes.slice(crossoverPoint1, crossoverPoint2),
    ...parent2.genes.slice(crossoverPoint2)
  ];

  return [child1, child2];
}

/**
 * #### Two point cross
 * Picks two random points in the two parent chromosomes to cross.
 * Then passes it in to TwoPoint.
 *
 * @param parent1 Parent 1 of the crossover
 * @param parent2 Parent 2 of the crossover
 * @returns An array of two of the children chromosomes
 */
export function twoPointCross(
  parent1: GenericChromosome<any>,
  parent2: GenericChromosome<any>
): GenericChromosome<any>[] {
  return twoPoint(
    parent1,
    parent2,
    Math.floor(Math.random() * parent1.genes.length),
    Math.floor(Math.random() * parent2.genes.length)
  );
}

/**
 * #### Uniform cross
 * ([Explanation](https://en.wikipedia.org/wiki/Crossover_(genetic_algorithm)#Uniform_crossover))
 *
 * Goes down the chromosome and randomly switches gene values between the parents.
 *
 * @param parent1 Parent 1 of the crossover
 * @param parent2 Parent 2 of the crossover
 * @returns An array of two of the children chromosome
 */
export function uniformCross(
  parent1: GenericChromosome<any>,
  parent2: GenericChromosome<any>
): GenericChromosome<any>[] {
  const genes1 = [...parent1.genes];
  const genes2 = [...parent2.genes];

  const child1 = parent1.duplicate();
  const child2 = parent2.duplicate();

  for (let i = 0; i < genes1.length; i++) {
    if (Math.random() >= 0.5) {
      const temp = genes1[i];
      genes1[i] = genes2[i];
      genes2[i] = temp;
    }
  }

  child1.genes = genes1;
  child2.genes = genes2;

  return [child1, child2];
}

/**
 * #### Arithmetic Blend
 * (only works for NumberChromosome)
 * ([Explanation](https://www.tutorialspoint.com/genetic_algorithms/genetic_algorithms_crossover.htm))
 *
 * Averages the value between genes and returns the children.
 *
 * @param parent1 Parent 1 of the crossover
 * @param parent2 Parent 2 of the crossover
 * @returns An array of two of the children chromosome
 */
export function arithmeticBlend(
  parent1: GenericChromosome<number>,
  parent2: GenericChromosome<number>
): GenericChromosome<any>[] {
  const child1 = parent1.duplicate();
  const child2 = parent2.duplicate();

  const newGenes = [];

  for (let i = 0; i < child1.length; i++) {
    newGenes[i] = (child1.genes[i] + child2.genes[i]) / 2;
  }

  child1.genes = newGenes;
  child2.genes = newGenes;

  return [child1, child2];
}

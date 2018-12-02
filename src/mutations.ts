import GenericChromosome from "./chromosomes/GenericChromosome";

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

export function noMutate(
  chromosomes: GenericChromosome<any>[],
  chance: number,
  options: any
): GenericChromosome<any>[] {
  return chromosomes;
}

import GenericChromosome from "./chromosomes/generic_chromosome";

export function BitFlipMutate(chromosomes: GenericChromosome<boolean>[], chance: number, options: any): GenericChromosome<boolean>[] {
  let chromes: GenericChromosome<boolean>[] = [];

  for(let i = 0; i < chromosomes.length; i++) {
    let chrome = chromosomes[i].duplicate();

    for(let j = 0; j < chromosomes[i].genes.length; j++) {
      let rand = Math.random();

      if(rand <= chance) {
        let genes = [...chrome.genes];
        genes[j] = !genes[j];

        chrome.genes = genes;
      }
    }

    chromes.push(chrome);
  }

  return chromes;
}

export function AdditionMutate(chromosomes: GenericChromosome<number>[], chance: number, options: any): GenericChromosome<number>[] {
  let mutationRange = options.mutationRange || 0.5;

  let chromes: GenericChromosome<number>[] = [];

  for(let i = 0; i < chromosomes.length; i++) {
    let chrome = chromosomes[i].duplicate();

    for(let j = 0; j < chromosomes[i].genes.length; j++) {
      let rand = Math.random();

      if(rand <= chance) {
        let genes = [...chrome.genes];
        let randPlus = Math.random() * mutationRange * 2 - mutationRange;

        genes[j] = genes[j] + randPlus;

        chrome.genes = genes;
      }
    }

    chromes.push(chrome);
  }

  return chromes;
}

export function NoMutate(chromosomes: GenericChromosome<any>[], chance: number, options: any): GenericChromosome<any>[] {
  return chromosomes;
}
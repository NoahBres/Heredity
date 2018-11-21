import GenericChromosome from "./chromosomes/generic_chromosome";

export function RouletteWheelSelect(
  chromosomes: GenericChromosome<any>[],
  num: number
): GenericChromosome<any>[] {
  let selections = [];

  let totalFitness = chromosomes.reduce((acc, curr) => acc + curr.fitness, 0);

  while (selections.length < num) {
    // let value = Math.random() * totalFitness;
    // for(let i = 0; i < chromosomes.length; i++) {
    //   value -= chromosomes[i].fitness;

    //   if(value < 0) {
    //     selections.push(chromosomes[j].duplicate());
    //   }
    // }
    let goal = Math.random() * totalFitness;

    let sum = 0;
    for (let j = 0; j < chromosomes.length; j++) {
      sum += chromosomes[j].fitness;

      if (sum >= goal) {
        selections.push(chromosomes[j].duplicate());
        break;
      }
    }
  }

  return selections;
}

export function RankSelect(
  chromosomes: GenericChromosome<any>[],
  num: number
): GenericChromosome<any>[] {
  let selections = [];

  let totalRank = chromosomes.reduce((acc, curr, currI) => acc + currI, 0);

  while (selections.length < num) {
    let goal = Math.random() * totalRank;

    let sum = 0;
    for (let j = 0; j < chromosomes.length; j++) {
      sum += chromosomes.length - j;

      /* istanbul ignore next */
      if (sum >= goal) {
        selections.push(chromosomes[j].duplicate());
        break;
      }
    }
  }

  return selections;
}

export function TopSelect(
  chromosomes: GenericChromosome<any>[],
  num: number
): GenericChromosome<any>[] {
  let selections = [];

  for (let i = 0; i < num; i++) {
    selections.push(chromosomes[i].duplicate());
  }

  return selections;
}

export function RandomSelect(
  chromosomes: GenericChromosome<any>[],
  num: number
): GenericChromosome<any>[] {
  let selections = [];

  for (let i = 0; i < num; i++) {
    let random = Math.floor(Math.random() * chromosomes.length);
    selections.push(chromosomes[random].duplicate());
  }

  return selections;
}

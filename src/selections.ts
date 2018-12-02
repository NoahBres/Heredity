import GenericChromosome from "./chromosomes/GenericChromosome";

export function rouletteWheelSelect(
  chromosomes: GenericChromosome<any>[],
  num: number
): GenericChromosome<any>[] {
  const selections = [];

  const totalFitness = chromosomes.reduce((acc, curr) => acc + curr.fitness, 0);

  while (selections.length < num) {
    // let value = Math.random() * totalFitness;
    // for(let i = 0; i < chromosomes.length; i++) {
    //   value -= chromosomes[i].fitness;

    //   if(value < 0) {
    //     selections.push(chromosomes[j].duplicate());
    //   }
    // }
    const goal = Math.random() * totalFitness;

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

export function rankSelect(
  chromosomes: GenericChromosome<any>[],
  num: number
): GenericChromosome<any>[] {
  const selections = [];

  const totalRank = chromosomes.reduce((acc, curr, currI) => acc + currI, 0);

  while (selections.length < num) {
    const goal = Math.random() * totalRank;

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

export function topSelect(
  chromosomes: GenericChromosome<any>[],
  num: number
): GenericChromosome<any>[] {
  const selections = [];

  for (let i = 0; i < num; i++) {
    selections.push(chromosomes[i].duplicate());
  }

  return selections;
}

export function randomSelect(
  chromosomes: GenericChromosome<any>[],
  num: number
): GenericChromosome<any>[] {
  const selections = [];

  for (let i = 0; i < num; i++) {
    const random = Math.floor(Math.random() * chromosomes.length);
    selections.push(chromosomes[random].duplicate());
  }

  return selections;
}

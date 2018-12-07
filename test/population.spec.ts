import Population from "../src/Population";
import NumberChromosome from "../src/chromosomes/NumberChromosome";

describe("Population", () => {
  let pop: Population;

  beforeEach(() => {
    pop = new Population(5);
  });

  test("Check if population is initiated", () => {
    expect(pop).toBeInstanceOf(Population);
  });

  test("Chromosome array is initialized properly", () => {
    expect(pop.size).toBe(5);
  });

  test("Duplicate population", () => {
    const dupe = pop.duplicate();
    expect(dupe).toEqual(pop);
  });

  test("Generate population", () => {
    pop.generate(new NumberChromosome({}, 5));
    expect(pop.getGenesFlat().length).toBe(25);
    expect(pop.getGenes().length).toBe(5);
  });

  test("Get top chromosome", () => {
    pop.generate(new NumberChromosome({}, 5));
    // pop.setFitness([5, 10, 50, 6, 99])
    pop.setFitness(250, 3);
    expect(pop.topChromosome().index).toBe(3);
  });

  test("Get lowest chromosome", () => {
    pop.generate(new NumberChromosome({}, 5));
    pop.setFitness([6, 10, 50, 5, 99]);
    expect(pop.lowestChromosome().index).toBe(3);
  });

  test("Set fitness", () => {
    pop.generate(new NumberChromosome({}, 5));
    pop.setFitness([5, 10, 50, 6, 99]);
    expect(pop.chromosomes[2].fitness).toBe(50);
  });

  test("Sort population", () => {
    pop.generate(new NumberChromosome({}, 5));
    pop.setFitness([6, 10, 50, 5, 99]);
    pop.sort();
    expect(pop.topChromosome().index).toBe(0);
    expect(pop.lowestChromosome().index).toBe(4);
  });
});

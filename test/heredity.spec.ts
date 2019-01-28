import { Heredity } from "../src/index";
import NumberChromosome from "../src/chromosomes/NumberChromosome";
import GenericChromosome from "../src/chromosomes/GenericChromosome";
import Population from "../src/Population";

describe("Heredity", () => {
  let d: Heredity;

  beforeEach(() => {
    d = new Heredity({
      populationSize: 5,
      templateChromosome: new NumberChromosome({}, 5)
    });
  });

  test("Check if Heredity is initiated", () => {
    expect(d).toBeInstanceOf(Heredity);
  });

  test("Check if population is initiated correctly", () => {
    d.generatePopulation();
    expect(d.getGenes().length).toBe(5);
    expect(d.getGenesFlat().length).toBe(25);
  });

  test("Get top chromosome", () => {
    d.generatePopulation();
    d.setFitness(250, 3);
    expect(d.topChromosome().index).toBe(3);
  });

  test("Get lowest chromosome", () => {
    d.generatePopulation();
    d.setFitness(250, 3);
    d.setFitness([6, 10, 50, 5, 99]);
    expect(d.lowestChromosome().index).toBe(3);
  });

  test("Get history", () => {
    expect(d.history.length).toBe(0);
  });

  test("Set fitness", () => {
    d.generatePopulation();
    d.setFitness([5, 10, 50, 6, 99]);
    expect(d.chromosomes[2].fitness).toBe(50);
  });

  test("Set population", () => {
    const p = new Population(6);
    d.population = p;
    expect(p).toStrictEqual(d.population);
  });

  test("Next generation", () => {
    d = new Heredity({
      populationSize: 50,
      templateChromosome: new NumberChromosome({}, 5)
    });
    d.generatePopulation();
    d.setFitness(
      Array(50)
        .fill(1)
        .map(() => Math.floor(Math.random() * 500))
    );
    const p = d.population.duplicate();
    d.nextGeneration();

    expect(d.getGenesFlat()).not.toStrictEqual(p.getGenesFlat());
  });

  test("Generate Population PreHook", () => {
    const hook = jest.fn();

    d.addHook("genPopPre", hook);
    d.generatePopulation();

    expect(hook).toBeCalled();
  });

  test("Generate Population PostHook", () => {
    const hook = jest.fn();

    d.addHook("genPopPost", hook);
    d.generatePopulation();

    expect(hook).toBeCalled();
  });

  test("Next Generation PreHook", () => {
    const hook = jest.fn();

    d.addHook("nextGenPre", hook);
    d.generatePopulation();
    d.nextGeneration();

    expect(hook).toBeCalled();
  });

  test("Next Generation PostHook", () => {
    const hook = jest.fn();

    d.addHook("nextGenPost", hook);
    d.generatePopulation();
    d.nextGeneration();

    expect(hook).toBeCalled();
  });
});

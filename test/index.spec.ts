import Darwin from "../src/index";
import { GenericChromosome, NumberChromosome } from "../src/chromosomes";

describe("Darwin", () => {
  let d: Darwin;

  beforeEach(() => {
    d = new Darwin({
      populationSize: 5,
      templateChromosome: new NumberChromosome({}, 5)
    });
  });

  test("Check if Darwin is initiated", () => {
    expect(d).toBeInstanceOf(Darwin);
  });

  test("Check if population is initiated correctly", () => {
    d.generatePopulation();
    expect(d.population.size).toBe(5);
    expect(d.population.getGenesFlat().length).toBe(25);
  });

  test("Get top chromosome", () => {
    d.generatePopulation();
    d.setFitness(250, 3);
    expect(d.topChromosome().index).toBe(3);
  });

  test("Get lowest chromosome", () => {
    d.generatePopulation();
    d.setFitness(250, 3);
    d.setFitness([6, 10, 50, 5, 99])
    expect(d.lowestChromosome().index).toBe(3);
  });

  test("Set fitness", () => {
    d.generatePopulation();
    d.setFitness([5, 10, 50, 6, 99]);
    expect(d.chromosomes[2].fitness).toBe(50);
  });
});


import {
  RouletteWheelSelect,
  RankSelect,
  TopSelect,
  RandomSelect
} from "../src/selections";
import Population from "../src/population";
import { NumberChromosome } from "../src/chromosomes";

describe("Selection suite", () => {
  let pop: Population;

  beforeEach(() => {
    pop = new Population(20);
    pop.generate(new NumberChromosome({}, 5));
    pop.setFitness(new Array(20).fill(1).map(() => Math.random() * 300));
  });

  test("Roulette Wheel Selection", () => {
    let chosenOnes = RouletteWheelSelect(pop.chromosomes, 5);
    expect(chosenOnes.length).toBe(5);
  });

  test("Rank Selection", () => {
    let chosenOnes = RankSelect(pop.chromosomes, 5);
    expect(chosenOnes.length).toBe(5);
  });

  test("Top Selection", () => {
    let chosenOnes = TopSelect(pop.chromosomes, 5);
    expect(chosenOnes.length).toBe(5);
  });

  test("Random Selection", () => {
    let chosenOnes = RandomSelect(pop.chromosomes, 5);
    expect(chosenOnes.length).toBe(5);
  });
});

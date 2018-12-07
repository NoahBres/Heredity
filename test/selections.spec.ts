import {
  rouletteWheelSelect,
  rankSelect,
  topSelect,
  randomSelect
} from "../src/selections";
import Population from "../src/Population";
import NumberChromosome from "../src/chromosomes/NumberChromosome";

describe("Selection suite", () => {
  let pop: Population;

  beforeEach(() => {
    pop = new Population(20);
    pop.generate(new NumberChromosome({}, 5));
    pop.setFitness(
      Array(20)
        .fill(1)
        .map(() => Math.random() * 300)
    );
  });

  test("Roulette Wheel Selection", () => {
    const chosenOnes = rouletteWheelSelect(pop.chromosomes, 5);
    expect(chosenOnes.length).toBe(5);
  });

  test("Rank Selection", () => {
    const chosenOnes = rankSelect(pop.chromosomes, 5);
    expect(chosenOnes.length).toBe(5);
  });

  test("Top Selection", () => {
    const chosenOnes = topSelect(pop.chromosomes, 5);
    expect(chosenOnes.length).toBe(5);
  });

  test("Random Selection", () => {
    const chosenOnes = randomSelect(pop.chromosomes, 5);
    expect(chosenOnes.length).toBe(5);
  });
});

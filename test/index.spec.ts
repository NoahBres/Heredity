import Darwin from "../src/index";
import { GenericChromosome } from "../src/chromosomes";

// jest.mock('../src/index');

describe("Darwin", () => {
  // test("d1", () => {
  //   const d = new Darwin({
  //     populationSize: 50,
  //     templateChromosome: new GenericChromosome()
  //   });

  //   expect(d).toHaveBeenCalled();
  // });

  let d: Darwin;

  beforeEach(() => {
    d = new Darwin({
      populationSize: 50,
      templateChromosome: new GenericChromosome()
    });
  });

  test("Check if Darwin has been called", () => {
    expect(d).toBeInstanceOf(Darwin);
  });
});

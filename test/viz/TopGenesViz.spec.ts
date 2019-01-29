import Heredity from "../../src/Heredity";
import NumberChromosome from "../../src/chromosomes/NumberChromosome";
import TopGenesViz from "../../src/viz/TopGenesViz";

describe("Top Genes Viz", () => {
  let heredity: Heredity;
  let viz: TopGenesViz;

  const initSpy: jest.SpyInstance = jest.spyOn(TopGenesViz.prototype, "init");
  const updateSpy: jest.SpyInstance = jest.spyOn(
    TopGenesViz.prototype,
    "update"
  );

  beforeEach(() => {
    heredity = new Heredity({
      populationSize: 10,
      templateChromosome: new NumberChromosome({}, 5)
    });

    document.body.innerHTML = `
      <div id="top-genes-viz"></div>
    `;

    initSpy.mockClear();
    updateSpy.mockClear();
  });

  test("Initialize with id", () => {
    viz = new TopGenesViz("top-genes-viz", heredity);

    expect(
      document.getElementById("top-genes-viz")!.childElementCount
    ).not.toBe(0);
  });

  test("Initialize with dom object", () => {
    viz = new TopGenesViz(
      <HTMLElement>document.getElementById("top-genes-viz"),
      heredity
    );

    expect(
      document.getElementById("top-genes-viz")!.childElementCount
    ).not.toBe(0);
  });

  test("Generate Population Hook", () => {
    viz = new TopGenesViz("top-genes-viz", heredity);

    heredity.generatePopulation();

    expect(initSpy).toHaveBeenCalled();
  });

  test("Next Generation Hook", () => {
    viz = new TopGenesViz("top-genes-viz", heredity);

    heredity.generatePopulation();
    heredity.nextGeneration();

    expect(updateSpy).toHaveBeenCalled();
  });

  test("Disable hook", () => {
    viz = new TopGenesViz("top-genes-viz", heredity, true);

    heredity.generatePopulation();
    heredity.nextGeneration();

    expect(initSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  test("Link", () => {
    viz = new TopGenesViz("top-genes-viz", heredity);

    expect(viz.link(viz)).toBeFalsy();
  });
});

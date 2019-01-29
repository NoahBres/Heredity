import Heredity from "../../src/Heredity";
import ChartViz from "../../src/viz/ChartViz";
import NumberChromosome from "../../src/chromosomes/NumberChromosome";

describe("Char Viz", () => {
  let heredity: Heredity;
  let viz: ChartViz;

  let initSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    heredity = new Heredity({
      populationSize: 10,
      templateChromosome: new NumberChromosome({}, 5)
    });

    document.body.innerHTML = `
      <div id="chart-viz"></div>
    `;

    initSpy = jest.spyOn(ChartViz.prototype, "init");
    updateSpy = jest.spyOn(ChartViz.prototype, "update");

    viz = new ChartViz(
      <HTMLElement>document.getElementById("chart-viz"),
      heredity
    );
  });

  test("Initialize with id", () => {
    viz = new ChartViz("chart-viz", heredity);
    expect(document.getElementById("chart-viz-style-id")).not.toBeUndefined();
  });

  test("Initialize with dom object", () => {
    expect(document.getElementById("chart-viz-style-id")).not.toBeUndefined();
  });

  test("Generate Population Hook", () => {
    heredity.generatePopulation();

    expect(initSpy).toHaveBeenCalled();
  });

  test("Next Generation Hook", () => {
    heredity.generatePopulation();
    heredity.nextGeneration();

    expect(updateSpy).toHaveBeenCalled();
  });

  test("Disable hook", () => {
    viz = new ChartViz("chart-viz", heredity, true);

    heredity.generatePopulation();
    heredity.nextGeneration();

    expect(initSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  test("Link", () => {
    expect(viz.link(viz)).toBeFalsy();
  });

  test("Already initialized test", () => {
    heredity.generatePopulation();
    heredity.generatePopulation();

    expect(updateSpy).toHaveBeenCalled();
  });
});

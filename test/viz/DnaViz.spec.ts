import Heredity from "../../src/Heredity";
import NumberChromosome from "../../src/chromosomes/NumberChromosome";
import DnaViz from "../../src/viz/DnaViz";
import PerceptronViz from "../../src/viz/PerceptronViz";

describe("DNA Viz", () => {
  let heredity: Heredity;
  let viz: DnaViz;

  let initSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    heredity = new Heredity({
      populationSize: 10,
      templateChromosome: new NumberChromosome({}, 5)
    });

    document.body.innerHTML = `
      <div id="dna-viz"></div>
    `;

    initSpy = jest.spyOn(DnaViz.prototype, "init");
    updateSpy = jest.spyOn(DnaViz.prototype, "update");

    viz = new DnaViz(<HTMLElement>document.getElementById("dna-viz"), heredity);
  });

  test("Initialize with id", () => {
    viz = new DnaViz("dna-viz", heredity);
    expect(document.getElementById("dna-viz-style-id")).not.toBeUndefined();
  });

  test("Initialize with dom object", () => {
    expect(document.getElementById("dna-viz-style-id")).not.toBeUndefined();
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

  test("Link", () => {
    expect(viz.link(viz)).toBeFalsy();
  });

  test("Link with PerceptronViz", () => {
    document.body.innerHTML += '<div id="perceptron-viz"></div>';

    const perceptronViz = new PerceptronViz(
      document.getElementById("perceptron-viz")!,
      heredity,
      {
        index: 0,
        threshhold: (i: number) => i > 0.5
      }
    );
    expect(viz.link(perceptronViz)).toBeTruthy();
  });

  test("Already initialized test", () => {
    heredity.generatePopulation();
    heredity.generatePopulation();

    expect(updateSpy).toHaveBeenCalled();
  });

  test("Init Tags OnChange", () => {
    heredity.generatePopulation();
    heredity.population.chromosomes[0].tags.add("dead");

    expect(document.querySelector(".dead")).not.toBeUndefined();
  });

  test("Update Tags OnChange", () => {
    heredity.generatePopulation();
    heredity.nextGeneration();
    heredity.population.chromosomes[0].tags.add("dead");

    expect(document.querySelector(".dead")).not.toBeUndefined();
  });

  test("Update Chromosome hasn't changed branch", () => {
    heredity.generatePopulation();
    viz.update();
    viz.update();
  });

  test("Pill hover test", () => {
    heredity.generatePopulation();

    const event = new MouseEvent("mouseover", {
      view: window,
      bubbles: true,
      cancelable: true
    });

    const hook = jest.fn();

    viz.onPillHover(null, hook);

    let pickPill = document.querySelector(".viz__base-dna-pill");
    pickPill!.dispatchEvent(event);

    expect(hook).toBeCalled();

    // Test update loop run
    heredity.generatePopulation();

    pickPill = document.querySelector(".viz__base-dna-pill");
    pickPill!.dispatchEvent(event);

    expect(hook).toBeCalledTimes(2);
  });

  test("Pill hover leave test", () => {
    heredity.generatePopulation();

    const event = new MouseEvent("mouseleave", {
      view: window,
      bubbles: true,
      cancelable: true
    });

    const hook = jest.fn();

    viz.onPillHoverLeave(null, hook);

    let pickPill = document.querySelector(".viz__base-dna-pill");
    pickPill!.dispatchEvent(event);

    expect(hook).toBeCalled();

    // Test update loop run
    heredity.generatePopulation();

    pickPill = document.querySelector(".viz__base-dna-pill");
    pickPill!.dispatchEvent(event);

    expect(hook).toBeCalledTimes(2);
  });
});

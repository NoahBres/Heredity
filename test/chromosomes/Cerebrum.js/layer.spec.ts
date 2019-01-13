import Layer from "../../../src/chromosomes/Cerebrum.js/Layer";

describe("Layer", () => {
  let layer: Layer;

  beforeEach(() => {
    layer = new Layer([]);
  });

  test("Set neurons", () => {
    layer.neurons = [];
    expect(layer.neurons).toEqual([]);
  });
});

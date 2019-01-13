import Cerebrum from "../../../src/chromosomes/Cerebrum.js/Cerebrum";

describe("Cerebrum", () => {
  let cerebrum: Cerebrum;
  const activation = Cerebrum.prototype.sigmoid;

  beforeEach(() => {
    cerebrum = new Cerebrum(2, [2], 1, activation);
  });

  test("Sigmoid activation", () => {
    const input = Cerebrum.prototype.sigmoid(0.5);
    expect(input).toEqual(0.6224593312018546);
  });

  test("Tanh Acivation", () => {
    const input = Cerebrum.prototype.tanh(0.5);
    expect(input).toEqual(0.46211715726000974);
  });

  test("Layers Get/Set", () => {
    const layers = cerebrum.layers;
    cerebrum.layers = layers;

    expect(cerebrum.layers).toEqual(layers);
  });

  test("Get Activation", () => {
    expect(cerebrum.activation).toEqual(activation);
  });

  test("Cover default parameter branch", () => {
    cerebrum = new Cerebrum(2, [2], 1);
  });
});

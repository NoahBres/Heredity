import GenericChromosome from "./chromosomes/GenericChromosome";
import NumberChromosome from "./chromosomes/NumberChromosome";
import BitChromosome from "./chromosomes/BitChromosome";

import * as Selection from "./selections";
import * as Mutation from "./mutations";
import * as Crossover from "./crossovers";

export { default as Heredity } from "./heredity";

export { Selection };
export { Mutation };
export { Crossover };

export { NumberChromosome };
export { GenericChromosome };
export { BitChromosome };

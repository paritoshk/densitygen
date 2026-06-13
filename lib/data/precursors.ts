import type { CandidateInput } from "../engine/types";
import { elementsOf } from "./ald";

// Candidate precursor sets for the films the backend scores for real.
// Known names (TEMAH, TMA, WF6 …) resolve in the backend's precursor DB;
// novel ones carry an explicit formula.
interface FilmScreen {
  film: string;
  coReactant?: string;
  candidates: CandidateInput[];
}

const SUPPORTED: Record<string, FilmScreen> = {
  HfO2: {
    film: "HfO2",
    coReactant: "H2O",
    candidates: [
      { name: "TEMAH" },
      { name: "HfCl4", formula: "HfCl4" },
      { name: "TDMAH", formula: "Hf[N(CH3)2]4" },
      { name: "Hf(OtBu)4", formula: "Hf(OC4H9)4" },
    ],
  },
  Al2O3: {
    film: "Al2O3",
    coReactant: "H2O",
    candidates: [
      { name: "TMA" },
      { name: "AlCl3", formula: "AlCl3" },
      { name: "Al(OtBu)3", formula: "Al(OC4H9)3" },
    ],
  },
  TiO2: {
    film: "TiO2",
    coReactant: "H2O",
    candidates: [
      { name: "TiCl4" },
      { name: "TDMAT", formula: "Ti[N(CH3)2]4" },
      { name: "TTIP", formula: "Ti(OC3H7)4" },
      { name: "TEMAT", formula: "Ti[N(CH3)(C2H5)]4" },
    ],
  },
  W: {
    film: "W",
    coReactant: "B2H6",
    candidates: [
      { name: "WF6" },
      { name: "WCl6", formula: "WCl6" },
      { name: "WCl5", formula: "WCl5" },
      { name: "W(CO)6", formula: "W(CO)6" },
    ],
  },
  Ru: {
    film: "Ru",
    coReactant: "O2",
    candidates: [
      { name: "Ru(EtCp)2", formula: "Ru(C2H5C5H4)2" },
      { name: "RuO4", formula: "RuO4" },
      { name: "Ru3(CO)12", formula: "Ru3(CO)12" },
    ],
  },
};

// Map a material's chemistry to a backend-supported film (exact, else by the
// defining cation). Returns null when the engine has no real recipe for it.
const ELEMENT_FILM: Array<[string, string]> = [
  ["Hf", "HfO2"],
  ["Al", "Al2O3"],
  ["Ti", "TiO2"],
  ["W", "W"],
  ["Ru", "Ru"],
];

export function resolveFilm(formula: string): FilmScreen | null {
  if (SUPPORTED[formula]) return SUPPORTED[formula];
  const els = new Set(elementsOf(formula));
  for (const [el, film] of ELEMENT_FILM) {
    if (els.has(el)) return SUPPORTED[film];
  }
  return null;
}

export const SUPPORTED_FILMS = Object.keys(SUPPORTED);

import type { CandidateInput } from "../engine/types";

// Screening presets — each is a real fab material-selection problem the backend
// can rank live. The Mo interconnect case is the pitch's centerpiece
// (Cu → Mo, MoO₂Cl₂ vs Mo(CO)₆).
export interface Scenario {
  key: string;
  label: string;
  sub: string;
  film: string;
  coReactant: string;
  candidates: CandidateInput[];
}

export const SCENARIOS: Scenario[] = [
  {
    key: "mo-interconnect",
    label: "Mo interconnect",
    sub: "Cu → Mo · 2nm node / 3D NAND wordline",
    film: "Mo",
    coReactant: "H2 plasma",
    candidates: [
      { name: "MoO2Cl2", formula: "MoO2Cl2" },
      { name: "Mo(CO)6", formula: "Mo(CO)6" },
      { name: "MoCl5", formula: "MoCl5" },
      { name: "MoF6", formula: "MoF6" },
      { name: "Mo(NMe2)4", formula: "Mo[N(CH3)2]4" },
    ],
  },
  {
    key: "hfo2-highk",
    label: "HfO₂ high-κ gate",
    sub: "SiO₂ → HfO₂ · logic transistor gate dielectric",
    film: "HfO2",
    coReactant: "H2O",
    candidates: [
      { name: "TEMAH" },
      { name: "HfCl4", formula: "HfCl4" },
      { name: "TDMAH", formula: "Hf[N(CH3)2]4" },
      { name: "Hf(OtBu)4", formula: "Hf(OC4H9)4" },
    ],
  },
  {
    key: "w-contact",
    label: "W contact fill",
    sub: "low-resistance fill · contacts / vias / wordlines",
    film: "W",
    coReactant: "B2H6",
    candidates: [
      { name: "WF6" },
      { name: "WCl6", formula: "WCl6" },
      { name: "WCl5", formula: "WCl5" },
      { name: "W(CO)6", formula: "W(CO)6" },
    ],
  },
  {
    key: "ru-liner",
    label: "Ru liner",
    sub: "scaled interconnect liner · barrierless",
    film: "Ru",
    coReactant: "O2 plasma",
    candidates: [
      { name: "Ru(EtCp)2", formula: "Ru(C2H5C5H4)2" },
      { name: "RuCl3", formula: "RuCl3" },
      { name: "RuO4", formula: "RuO4" },
      { name: "Ru3(CO)12", formula: "Ru3(CO)12" },
    ],
  },
];

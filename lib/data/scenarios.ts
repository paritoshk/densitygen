import type { CandidateInput } from "../engine/types";

// Backend-supported films + co-reactants (from /api/meta) for the form dropdowns.
export const FILMS = [
  "Mo", "Ru", "W", "Co", "HfO2", "Al2O3", "TiO2", "TiN", "Ta2O5", "RuO2", "Ir", "NbP", "NbAs", "MoP", "CoSi",
];
export const CO_REACTANTS = ["H2 plasma", "O2 plasma", "H2O", "O3", "NH3", "N2 plasma", "H2", "SiH4", "B2H6"];

// Screening presets — the Mo interconnect case is the pitch's centerpiece and
// the default. Candidate field is free text ("name" or "name|formula").
export interface Scenario {
  key: string;
  label: string;
  sub: string;
  film: string;
  coReactant: string;
  temp: number;
  forbidden?: string;
  candsText: string;
}

export const SCENARIOS: Scenario[] = [
  {
    key: "mo-interconnect",
    label: "Mo interconnect",
    sub: "Cu → Mo · 2nm node / 3D NAND wordline",
    film: "Mo",
    coReactant: "H2 plasma",
    temp: 400,
    candsText: "MoO2Cl2, Mo(CO)6, MoF6, MoCl5, Mo[N(CH3)2]4",
  },
  {
    key: "ru-interconnect",
    label: "Ru interconnect",
    sub: "scaled liner · barrierless Cu-replacement",
    film: "Ru",
    coReactant: "O2 plasma",
    temp: 325,
    candsText: "Ru(EtCp)2|Ru(C2H5C5H4)2, RuCl3, RuO4, Ru3(CO)12",
  },
  {
    key: "hfo2-highk",
    label: "HfO₂ high-k (no Cl)",
    sub: "SiO₂ → HfO₂ · logic gate dielectric",
    film: "HfO2",
    coReactant: "H2O",
    temp: 300,
    forbidden: "Cl",
    candsText: "TEMAH, HfCl4, TDMAH|Hf[N(CH3)2]4, Hf(OtBu)4|Hf(OC4H9)4",
  },
  {
    key: "wf6-w",
    label: "WF₆ → W demo",
    sub: "low-resistance contact / via fill",
    film: "W",
    coReactant: "B2H6",
    temp: 350,
    candsText: "WF6, WCl6, WCl5, W(CO)6",
  },
];

/** Parse the comma-separated candidate field; each item is "name" or "name|formula". */
export function parseCandidates(text: string): CandidateInput[] {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const [name, formula] = t.split("|").map((s) => s.trim());
      return formula ? { name, formula } : { name };
    });
}

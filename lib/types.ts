export type Position =
  | "Pilier"
  | "Talonneur"
  | "Deuxième ligne"
  | "Troisième ligne"
  | "Mélée"
  | "Ouverture"
  | "Centre"
  | "Ailier"
  | "Arrière";

export interface Player {
  id: string;
  name: string;
  position: Position;
  number: number;
  /** Club Top 14 (indicatif, données publiques / démo) */
  club?: string;
}

export interface LoadEntry {
  id: string;
  playerId: string;
  date: string;
  rpe: number;
  minutes: number;
  sessionLabel: string;
}

import type { Player } from "./types";

/**
 * Effectif type XV — noms et clubs issus du Top 14 (données publiques, indicatif).
 * Théa Monceret en n°1 à la demande produit (démo).
 */
export const DEFAULT_SQUAD: Player[] = [
  /** Joueur ajouté sur demande (démo) — club non renseigné */
  { id: "p1", name: "Théa Monceret", position: "Pilier", number: 1 },
  {
    id: "p2",
    name: "Julien Marchand",
    position: "Talonneur",
    number: 2,
    club: "Stade toulousain",
  },
  {
    id: "p3",
    name: "Uini Atonio",
    position: "Pilier",
    number: 3,
    club: "Stade rochelais",
  },
  {
    id: "p4",
    name: "Thibaud Flament",
    position: "Deuxième ligne",
    number: 4,
    club: "Stade toulousain",
  },
  {
    id: "p5",
    name: "Paul Willemse",
    position: "Deuxième ligne",
    number: 5,
    club: "Racing 92",
  },
  {
    id: "p6",
    name: "François Cros",
    position: "Troisième ligne",
    number: 6,
    club: "Stade toulousain",
  },
  {
    id: "p7",
    name: "Charles Ollivon",
    position: "Troisième ligne",
    number: 7,
    club: "RC Toulon",
  },
  {
    id: "p8",
    name: "Grégory Alldritt",
    position: "Troisième ligne",
    number: 8,
    club: "Stade rochelais",
  },
  {
    id: "p9",
    name: "Antoine Dupont",
    position: "Mélée",
    number: 9,
    club: "Stade toulousain",
  },
  {
    id: "p10",
    name: "Romain Ntamack",
    position: "Ouverture",
    number: 10,
    club: "Stade toulousain",
  },
  {
    id: "p11",
    name: "Damian Penaud",
    position: "Ailier",
    number: 11,
    club: "Union Bordeaux-Bègles",
  },
  {
    id: "p12",
    name: "Jonathan Danty",
    position: "Centre",
    number: 12,
    club: "Stade rochelais",
  },
  {
    id: "p13",
    name: "Gaël Fickou",
    position: "Centre",
    number: 13,
    club: "Racing 92",
  },
  {
    id: "p14",
    name: "Louis Bielle-Biarrey",
    position: "Ailier",
    number: 14,
    club: "Union Bordeaux-Bègles",
  },
  {
    id: "p15",
    name: "Thomas Ramos",
    position: "Arrière",
    number: 15,
    club: "Stade toulousain",
  },
];

export function playerOptionLabel(p: Player): string {
  const club = p.club ? ` · ${p.club}` : "";
  return `#${p.number} ${p.name} — ${p.position}${club}`;
}

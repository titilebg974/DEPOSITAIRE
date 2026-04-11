"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_SQUAD } from "@/lib/squad";
import type { LoadEntry, Player, Position } from "@/lib/types";
import {
  averageRpeLastDays,
  lastEntryForPlayer,
  loadZone,
  parseEntries,
} from "@/lib/load-utils";

const STORAGE_KEY = "charge-joueur-tracker-entries";

const SESSION_OPTIONS = [
  "Terrain — vitesse",
  "Terrain — contact",
  "Musculation",
  "Préparation physique",
  "Vidéo / tactique",
  "Récupération active",
] as const;

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function zoneStyles(zone: ReturnType<typeof loadZone>): string {
  switch (zone) {
    case "basse":
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30";
    case "modérée":
      return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/35";
    case "élevée":
      return "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/35";
  }
}

export function ChargeTracker() {
  const [entries, setEntries] = useState<LoadEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filterPoste, setFilterPoste] = useState<Position | "Tous">("Tous");
  const [playerId, setPlayerId] = useState(DEFAULT_SQUAD[0]?.id ?? "");
  const [date, setDate] = useState(todayIso);
  const [rpe, setRpe] = useState(6);
  const [minutes, setMinutes] = useState(45);
  const [sessionLabel, setSessionLabel] = useState<string>(SESSION_OPTIONS[0]);

  useEffect(() => {
    setEntries(parseEntries(localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  const persist = useCallback((next: LoadEntry[]) => {
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const players = DEFAULT_SQUAD;
  const filteredPlayers = useMemo(() => {
    if (filterPoste === "Tous") return players;
    return players.filter((p) => p.position === filterPoste);
  }, [players, filterPoste]);

  const stats = useMemo(() => {
    const isoToday = todayIso();
    const todayCount = entries.filter((e) => e.date === isoToday).length;
    const last7 = entries.filter((e) => {
      const t = new Date(e.date).getTime();
      const now = new Date(isoToday).getTime();
      return now - t <= 6 * 86_400_000;
    });
    const avgTeam =
      last7.length === 0
        ? null
        : Math.round(
            (last7.reduce((a, e) => a + e.rpe, 0) / last7.length) * 10,
          ) / 10;
    const highLoad = last7.filter((e) => e.rpe >= 8).length;
    return { todayCount, avgTeam, highLoad, total7: last7.length };
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) return;
    const entry: LoadEntry = {
      id: newId(),
      playerId,
      date,
      rpe,
      minutes: Math.max(0, Math.min(240, minutes)),
      sessionLabel,
    };
    persist([entry, ...entries]);
  };

  const resetDemo = () => {
    persist([]);
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[#8fa396]">
        Chargement…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-[#24332b] pb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-[#2d8f5c]">
          Démonstration
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#e8f0ec] sm:text-4xl">
          Charge joueur tracker
        </h1>
        <p className="mt-3 max-w-2xl text-[#8fa396]">
          Enregistrez la charge perçue (RPE 1–10) et le volume (minutes) par
          séance. Les données restent dans votre navigateur (localStorage) — idéal
          pour une maquette sans serveur.
        </p>
      </header>

      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Saisies aujourd’hui"
          value={String(stats.todayCount)}
          hint="Nombre d’entrées datées du jour"
        />
        <StatCard
          label="RPE moyen équipe (7 j.)"
          value={stats.avgTeam === null ? "—" : String(stats.avgTeam)}
          hint={`Sur ${stats.total7} séance(s) enregistrée(s)`}
        />
        <StatCard
          label="Séances RPE ≥ 8 (7 j.)"
          value={String(stats.highLoad)}
          hint="Charge perçue élevée — à contextualiser avec le staff"
        />
      </section>

      <form
        onSubmit={handleSubmit}
        className="mb-10 rounded-2xl border border-[#24332b] bg-[#141c18] p-6 shadow-xl shadow-black/20"
      >
          <h2 className="text-lg font-semibold text-[#e8f0ec]">
            Nouvelle séance
          </h2>
          <p className="mt-1 text-sm text-[#8fa396]">
            RPE : effort perçu sur l’échelle Borg modifiée (1 = très léger, 10 =
            maximal).
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-[#c5d4cb]">
              Joueur
              <select
                value={playerId}
                onChange={(ev) => setPlayerId(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#24332b] bg-[#0c1210] px-3 py-2.5 text-[#e8f0ec] outline-none ring-[#2d8f5c] focus:ring-2"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name} — {p.position}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-[#c5d4cb]">
              Date
              <input
                type="date"
                value={date}
                onChange={(ev) => setDate(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#24332b] bg-[#0c1210] px-3 py-2.5 text-[#e8f0ec] outline-none focus:ring-2 focus:ring-[#2d8f5c]"
              />
            </label>

            <label className="block text-sm font-medium text-[#c5d4cb]">
              Type de séance
              <select
                value={sessionLabel}
                onChange={(ev) => setSessionLabel(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#24332b] bg-[#0c1210] px-3 py-2.5 text-[#e8f0ec] outline-none focus:ring-2 focus:ring-[#2d8f5c]"
              >
                {SESSION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="flex items-center justify-between text-sm font-medium text-[#c5d4cb]">
                <span>RPE</span>
                <span className="tabular-nums text-[#2d8f5c]">{rpe} / 10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={rpe}
                onChange={(ev) => setRpe(Number(ev.target.value))}
                className="mt-2 h-2 w-full cursor-pointer accent-[#2d8f5c]"
              />
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8fa396]">
                <span>Zone actuelle :</span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${zoneStyles(loadZone(rpe))}`}
                >
                  {loadZone(rpe)}
                </span>
              </p>
            </div>

            <label className="block text-sm font-medium text-[#c5d4cb]">
              Durée (minutes)
              <input
                type="number"
                min={0}
                max={240}
                value={minutes}
                onChange={(ev) => setMinutes(Number(ev.target.value))}
                className="mt-1.5 w-full rounded-lg border border-[#24332b] bg-[#0c1210] px-3 py-2.5 text-[#e8f0ec] outline-none focus:ring-2 focus:ring-[#2d8f5c]"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-[#1f5c3f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d8f5c] focus:outline-none focus:ring-2 focus:ring-[#2d8f5c] focus:ring-offset-2 focus:ring-offset-[#141c18]"
            >
              Enregistrer la charge
            </button>
            <button
              type="button"
              onClick={resetDemo}
              className="rounded-lg border border-[#24332b] px-4 py-2.5 text-sm font-medium text-[#8fa396] transition hover:border-[#2d8f5c]/50 hover:text-[#e8f0ec]"
            >
              Réinitialiser les données
            </button>
          </div>
      </form>

      <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#e8f0ec]">
                Effectif & dernières charges
              </h2>
              <p className="text-sm text-[#8fa396]">
                Filtrez par poste ; moyenne RPE sur 7 jours glissants.
              </p>
            </div>
            <label className="text-sm font-medium text-[#c5d4cb]">
              Poste
              <select
                value={filterPoste}
                onChange={(ev) =>
                  setFilterPoste(ev.target.value as Position | "Tous")
                }
                className="ml-0 mt-1.5 block w-full rounded-lg border border-[#24332b] bg-[#141c18] px-3 py-2 text-[#e8f0ec] outline-none focus:ring-2 focus:ring-[#2d8f5c] sm:ml-2 sm:mt-0 sm:inline-block sm:w-auto"
              >
                <option value="Tous">Tous les postes</option>
                {(
                  [
                    "Pilier",
                    "Talonneur",
                    "Deuxième ligne",
                    "Troisième ligne",
                    "Mélée",
                    "Ouverture",
                    "Centre",
                    "Ailier",
                    "Arrière",
                  ] as const
                ).map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#24332b] bg-[#141c18] shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#24332b] bg-[#0c1210]/80 text-xs uppercase tracking-wide text-[#8fa396]">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Joueur</th>
                    <th className="px-4 py-3 font-medium">Poste</th>
                    <th className="px-4 py-3 font-medium">Dernier RPE</th>
                    <th className="px-4 py-3 font-medium">Zone</th>
                    <th className="px-4 py-3 font-medium">RPE moy. 7j</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24332b]">
                  {filteredPlayers.map((p) => (
                    <PlayerRow key={p.id} player={p} entries={entries} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {entries.length > 0 && (
            <RecentEntries entries={entries} players={players} />
          )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[#24332b] bg-[#141c18] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[#8fa396]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-[#e8f0ec]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[#6b7d72]">{hint}</p>
    </div>
  );
}

function PlayerRow({
  player,
  entries,
}: {
  player: Player;
  entries: LoadEntry[];
}) {
  const last = lastEntryForPlayer(entries, player.id);
  const avg7 = averageRpeLastDays(entries, player.id, 7);
  const zone = last ? loadZone(last.rpe) : null;

  return (
    <tr className="transition hover:bg-[#0c1210]/50">
      <td className="px-4 py-3 font-mono text-[#8fa396]">{player.number}</td>
      <td className="px-4 py-3 font-medium text-[#e8f0ec]">{player.name}</td>
      <td className="px-4 py-3 text-[#c5d4cb]">{player.position}</td>
      <td className="px-4 py-3 tabular-nums text-[#e8f0ec]">
        {last ? (
          <>
            {last.rpe}
            <span className="ml-2 text-xs text-[#6b7d72]">
              ({last.date})
            </span>
          </>
        ) : (
          <span className="text-[#6b7d72]">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {zone ? (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${zoneStyles(zone)}`}
          >
            {zone}
          </span>
        ) : (
          <span className="text-[#6b7d72]">—</span>
        )}
      </td>
      <td className="px-4 py-3 tabular-nums text-[#c5d4cb]">
        {avg7 === null ? "—" : avg7}
      </td>
    </tr>
  );
}

function RecentEntries({
  entries,
  players,
}: {
  entries: LoadEntry[];
  players: Player[];
}) {
  const sorted = [...entries].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.id.localeCompare(a.id);
  });
  const slice = sorted.slice(0, 8);
  const map = new Map(players.map((p) => [p.id, p]));

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-[#e8f0ec]">
        Dernières saisies
      </h3>
      <ul className="mt-3 space-y-2">
        {slice.map((e) => {
          const pl = map.get(e.playerId);
          return (
            <li
              key={e.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-[#24332b] bg-[#0c1210]/60 px-4 py-3 text-sm"
            >
              <span className="text-[#e8f0ec]">
                <span className="font-medium">
                  {pl ? `${pl.name}` : "Joueur inconnu"}
                </span>
                <span className="text-[#8fa396]"> · {e.sessionLabel}</span>
              </span>
              <span className="tabular-nums text-[#c5d4cb]">
                {e.date} · RPE {e.rpe} · {e.minutes} min
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

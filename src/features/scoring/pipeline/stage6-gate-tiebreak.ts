import type { AttributeVector, PositionCode, PositionScore, RoleCode, RoleScore } from '../types';
import { ROLE_GATE_THRESHOLDS } from '../config/gate-thresholds';
import { ROLE_METADATA, POSITION_RARITY } from '../config/role-metadata';
import { GATE_GAMMA, FLEXIBILITY_BONUS, OSCILLATION_DAMPING_THRESHOLD, TIE_BREAKER_THRESHOLD } from '../config/global-constants';
import type { MatchRecord } from './match-stats-conversion';

/**
 * Tahap 6 — Gate: `Gate_r = Π min(1, Ã_j/τ_rj)^γ` untuk setiap prasyarat
 * role `r`. Bernilai 1 saat semua prasyarat terpenuhi, turun mulus (bukan
 * nol mendadak) saat ada yang kurang.
 */
export function computeGate(attributes: AttributeVector, role: RoleCode): number {
  const thresholds = ROLE_GATE_THRESHOLDS[role] ?? [];
  if (thresholds.length === 0) return 1;

  let gate = 1;
  for (const { attribute, minValue } of thresholds) {
    const value = attributes[attribute] ?? 0;
    gate *= Math.min(1, value / minValue) ** GATE_GAMMA;
  }
  return gate;
}

/** `Fit_r = Base_r · Gate_r`. */
export function computeRoleScores(
  attributes: AttributeVector,
  baseScores: Record<RoleCode, number>,
): RoleScore[] {
  return (Object.keys(baseScores) as RoleCode[]).map((role) => {
    const base = baseScores[role];
    const gate = computeGate(attributes, role);
    return { role, base, gate, fit: base * gate };
  });
}

function positiveExcess(value: number, baseline: number): number {
  return Math.max(0, value - baseline);
}

/**
 * `Pos_p = max_{r∈p} Fit_r + 0,15 · (second_{r∈p} Fit_r - 50)⁺` — skor
 * posisi dari role terbaik, dengan bonus fleksibilitas jika ada role kedua
 * kuat di posisi yang sama.
 */
export function computePositionScores(roleScores: RoleScore[]): PositionScore[] {
  const byPosition = new Map<PositionCode, RoleScore[]>();

  for (const score of roleScores) {
    const position = ROLE_METADATA[score.role].position;
    const list = byPosition.get(position) ?? [];
    list.push(score);
    byPosition.set(position, list);
  }

  const positionScores: PositionScore[] = [];
  for (const [position, scores] of byPosition) {
    const sorted = [...scores].sort((a, b) => b.fit - a.fit);
    const best = sorted[0];
    const second = sorted[1] ?? null;
    const bonus = second ? FLEXIBILITY_BONUS * positiveExcess(second.fit, 50) : 0;

    positionScores.push({
      position,
      score: best.fit + bonus,
      bestRole: best.role,
      secondRole: second?.role ?? null,
    });
  }

  return positionScores;
}

export interface TieBreakContext {
  roleScores: RoleScore[];
  usualPosition: PositionCode | null;
  /** Riwayat pertandingan pemain — dipakai di langkah 2 (kesesuaian dengan posisi yang pernah dimainkan). Opsional: `undefined`/kosong berarti langkah 2 selalu seri dan lanjut ke langkah 3. */
  matches?: MatchRecord[];
}

function gateMarginOf(position: PositionScore, ctx: TieBreakContext): number {
  const role = ctx.roleScores.find((r) => r.role === position.bestRole);
  return role?.gate ?? 0;
}

function matchCountAt(position: PositionCode, ctx: TieBreakContext): number {
  return (ctx.matches ?? []).filter((match) => match.posisiDimainkan === position).length;
}

/**
 * Tie-breaker berurutan (PRD Tahap 6) dipakai saat selisih dua posisi
 * teratas < 3,0 poin: (1) gate margin terbesar, (2) kesesuaian dengan
 * posisi yang pernah dimainkan pemain (jumlah pertandingan di `ctx.matches`
 * pada posisi kandidat masing-masing), (3) kelangkaan posisi di populasi,
 * (4) preferensi eksplisit saat onboarding.
 */
export function pickMainPosition(
  positionScores: PositionScore[],
  ctx: TieBreakContext,
): PositionScore {
  const sorted = [...positionScores].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const runnerUp = sorted[1];

  if (!runnerUp || top.score - runnerUp.score >= TIE_BREAKER_THRESHOLD) {
    return top;
  }

  const candidates = [top, runnerUp];

  const byGateMargin = [...candidates].sort((a, b) => gateMarginOf(b, ctx) - gateMarginOf(a, ctx));
  if (gateMarginOf(byGateMargin[0], ctx) !== gateMarginOf(byGateMargin[1], ctx)) {
    return byGateMargin[0];
  }

  const byMatchCount = [...candidates].sort(
    (a, b) => matchCountAt(b.position, ctx) - matchCountAt(a.position, ctx),
  );
  if (matchCountAt(byMatchCount[0].position, ctx) !== matchCountAt(byMatchCount[1].position, ctx)) {
    return byMatchCount[0];
  }

  const byRarity = [...candidates].sort(
    (a, b) => POSITION_RARITY[b.position] - POSITION_RARITY[a.position],
  );
  if (POSITION_RARITY[byRarity[0].position] !== POSITION_RARITY[byRarity[1].position]) {
    return byRarity[0];
  }

  const preferred = candidates.find((c) => c.position === ctx.usualPosition);
  return preferred ?? top;
}

/**
 * Peredam osilasi (PRD "Blending Kuesioner + Statistik"): posisi utama
 * hanya berganti jika kandidat baru unggul ≥ 4 poin selama dua rekalkulasi
 * berturut-turut. Fase 1 hanya menghitung sekali sehingga fungsi ini belum
 * dipanggil dari UI manapun — disiapkan agar Fase 3 (rekalkulasi berulang
 * setelah input pertandingan) tidak perlu menulis ulang Tahap 6.
 */
export function shouldSwitchMainPosition(
  currentMainPosition: PositionCode,
  recentCandidateScores: [PositionScore[], PositionScore[]],
  threshold = OSCILLATION_DAMPING_THRESHOLD,
): boolean {
  return recentCandidateScores.every((scores) => {
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const top = sorted[0];
    const current = scores.find((s) => s.position === currentMainPosition);
    if (!current) return true;
    return top.position !== currentMainPosition && top.score - current.score >= threshold;
  });
}

import { UMA_VALUES } from '../types';
import type { Player, UmaOption } from '../types';

export type CalcSuccess = { success: true; scores: Player[] };
export type CalcError = { success: false; total: number };
export type CalcResult = CalcSuccess | CalcError;

export function calculateFinalScores(
  players: Player[],
  tobiSho: boolean[],
  umaOption: UmaOption
): CalcResult {
  const totalScore = players.reduce((sum, player) => sum + player.score, 0);
  if (totalScore !== 100000) {
    return { success: false, total: totalScore };
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const uma = UMA_VALUES[umaOption];
  const oka = 20;
  const negativeScorePlayersCount = players.filter(p => p.score < 0).length;

  const playerUma = new Map<number, number>();
  let i = 0;
  while (i < sortedPlayers.length) {
    let j = i;
    while (j < sortedPlayers.length && sortedPlayers[j].score === sortedPlayers[i].score) {
      j++;
    }
    const tiedCount = j - i;
    const umaSlice = uma.slice(i, j);
    const totalUma = umaSlice.reduce((acc, val) => acc + val, 0);
    const avgUma = totalUma / tiedCount;
    for (let k = i; k < j; k++) {
      playerUma.set(sortedPlayers[k].id, avgUma);
    }
    i = j;
  }

  const topScore = sortedPlayers[0].score;
  const topPlayers = sortedPlayers.filter(p => p.score === topScore);
  const okaPerPlayer = oka / topPlayers.length;

  const scores = players.map((player, index) => {
    let finalScore = (player.score - 30000) / 1000;
    finalScore += playerUma.get(player.id)!;
    if (player.score === topScore) {
      finalScore += okaPerPlayer;
    }
    if (tobiSho[index]) {
      finalScore += 10 * negativeScorePlayersCount;
    }
    if (player.score < 0) {
      finalScore -= 10;
    }
    return { ...player, score: Math.round(finalScore * 10) / 10 };
  });

  return { success: true, scores };
}

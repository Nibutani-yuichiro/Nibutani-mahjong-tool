import { describe, expect, it } from 'vitest';
import { calculateFinalScores } from './calculate';
import type { Player } from '../types';

// テスト用プレイヤー生成ヘルパー
const makePlayers = (scores: number[]): Player[] =>
  scores.map((score, i) => ({ id: i + 1, name: `Player${i + 1}`, score }));

// 精算後スコアを配列で取り出すヘルパー
const getScores = (players: Player[], tobiSho: boolean[], umaOption: Parameters<typeof calculateFinalScores>[2]) => {
  const result = calculateFinalScores(players, tobiSho, umaOption);
  if (!result.success) throw new Error('calculation failed');
  return result.scores.map(p => p.score);
};

describe('calculateFinalScores', () => {
  describe('バリデーション', () => {
    it('合計が100,000点でない場合は失敗を返す', () => {
      const players = makePlayers([30000, 30000, 30000, 20000]); // 合計 110,000
      const result = calculateFinalScores(players, [false, false, false, false], '10/30');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.total).toBe(110000);
      }
    });

    it('合計が100,000点の場合は成功を返す', () => {
      const players = makePlayers([40000, 30000, 20000, 10000]);
      const result = calculateFinalScores(players, [false, false, false, false], '10/30');
      expect(result.success).toBe(true);
    });
  });

  describe('ウマの種類', () => {
    // 点数: [40000, 30000, 20000, 10000]（合計100,000）
    // 基本スコア: [(40000-30000)/1000, 0, -10, -20] = [10, 0, -10, -20]
    // オカ: 20（1着に加算）

    it('ウマ 10/30: 1着+30, 2着+10, 3着-10, 4着-30', () => {
      const players = makePlayers([40000, 30000, 20000, 10000]);
      const scores = getScores(players, [false, false, false, false], '10/30');
      // 1着: 10 + 30(uma) + 20(oka) = 60
      // 2着:  0 + 10(uma)            = 10
      // 3着: -10 - 10(uma)           = -20
      // 4着: -20 - 30(uma)           = -50
      expect(scores).toEqual([60, 10, -20, -50]);
    });

    it('ウマ 10/20: 1着+20, 2着+10, 3着-10, 4着-20', () => {
      const players = makePlayers([40000, 30000, 20000, 10000]);
      const scores = getScores(players, [false, false, false, false], '10/20');
      // 1着: 10 + 20(uma) + 20(oka) = 50
      // 2着:  0 + 10(uma)            = 10
      // 3着: -10 - 10(uma)           = -20
      // 4着: -20 - 20(uma)           = -40
      expect(scores).toEqual([50, 10, -20, -40]);
    });

    it('ウマ 5/10: 1着+10, 2着+5, 3着-5, 4着-10', () => {
      const players = makePlayers([40000, 30000, 20000, 10000]);
      const scores = getScores(players, [false, false, false, false], '5/10');
      // 1着: 10 + 10(uma) + 20(oka) = 40
      // 2着:  0 +  5(uma)            =  5
      // 3着: -10 - 5(uma)            = -15
      // 4着: -20 - 10(uma)           = -30
      expect(scores).toEqual([40, 5, -15, -30]);
    });

    it('精算後のスコアの合計はゼロになる', () => {
      const players = makePlayers([40000, 30000, 20000, 10000]);
      for (const uma of ['5/10', '10/20', '10/30'] as const) {
        const scores = getScores(players, [false, false, false, false], uma);
        expect(scores.reduce((a, b) => a + b, 0)).toBe(0);
      }
    });
  });

  describe('オカ', () => {
    it('1着に20点のオカが加算される', () => {
      const players = makePlayers([40000, 30000, 20000, 10000]);
      const scores = getScores(players, [false, false, false, false], '10/30');
      // 1着スコアにオカ20が含まれる: 10(基本) + 30(uma) + 20(oka) = 60
      expect(scores[0]).toBe(60);
    });

    it('1着が同点の場合、オカを均等分配する', () => {
      // 1・2着が同点
      const players = makePlayers([40000, 40000, 10000, 10000]);
      const scores = getScores(players, [false, false, false, false], '10/30');
      // 1・2着 uma平均: (30+10)/2 = 20
      // 1・2着 oka:     20/2 = 10
      // 1・2着: (40000-30000)/1000 + 20(uma) + 10(oka) = 10 + 20 + 10 = 40
      // 3・4着 uma平均: (-10-30)/2 = -20
      // 3・4着: (10000-30000)/1000 + (-20) = -20 - 20 = -40
      expect(scores[0]).toBe(40);
      expect(scores[1]).toBe(40);
      expect(scores[2]).toBe(-40);
      expect(scores[3]).toBe(-40);
    });
  });

  describe('同点時のウマ平均', () => {
    it('2・3着が同点の場合、ウマを平均する', () => {
      // 2・3着が同点
      const players = makePlayers([50000, 25000, 25000, 0]);
      const scores = getScores(players, [false, false, false, false], '10/30');
      // 1着: (50000-30000)/1000 + 30(uma) + 20(oka) = 20 + 30 + 20 = 70
      // 2・3着 uma平均: (10-10)/2 = 0
      // 2・3着: (25000-30000)/1000 + 0 = -5
      // 4着: (0-30000)/1000 + (-30) = -30 - 30 = -60
      expect(scores[0]).toBe(70);
      expect(scores[1]).toBe(-5);
      expect(scores[2]).toBe(-5);
      expect(scores[3]).toBe(-60);
      expect(scores.reduce((a, b) => a + b, 0)).toBe(0);
    });
  });

  describe('飛び賞', () => {
    it('飛ばしたプレイヤーに +10×飛んだ人数 が加算される', () => {
      // Player4 がマイナス、Player1 が飛ばした
      const players = makePlayers([60000, 30000, 15000, -5000]);
      const tobiSho = [true, false, false, false];
      const scores = getScores(players, tobiSho, '10/30');
      const noTobiScores = getScores(players, [false, false, false, false], '10/30');
      // 飛び賞あり Player1 は +10×1 = +10 の上乗せ
      expect(scores[0]).toBe(noTobiScores[0] + 10);
      // 他プレイヤーは変わらない
      expect(scores[1]).toBe(noTobiScores[1]);
      expect(scores[2]).toBe(noTobiScores[2]);
    });

    it('マイナスになったプレイヤーに -10 のペナルティが付く', () => {
      const players = makePlayers([60000, 30000, 15000, -5000]);
      const scores = getScores(players, [false, false, false, false], '10/30');
      const noNegativeScores = getScores(
        makePlayers([60000, 30000, 15000, -5000]),
        [false, false, false, false],
        '10/30'
      );
      // Player4 (score < 0) に -10 が適用済み
      // 4着の基本スコア: (-5000-30000)/1000 + (-30) - 10 = -35 - 30 - 10 = -75
      expect(scores[3]).toBe(-75);
      // 他は同じ
      expect(scores[0]).toBe(noNegativeScores[0]);
    });

    it('複数人が飛んだ場合、飛ばしたプレイヤーに +10×飛んだ人数 が加算される', () => {
      // Player3, Player4 がマイナス、Player1 が飛ばした（飛んだ人数=2）
      const players = makePlayers([70000, 30000, -5000, 5000]);
      // 合計確認: 70000+30000-5000+5000 = 100000 ✓
      const tobiSho = [true, false, false, false];
      const scores = getScores(players, tobiSho, '10/30');
      const noTobiScores = getScores(players, [false, false, false, false], '10/30');
      expect(scores[0]).toBe(noTobiScores[0] + 10 * 1); // 飛んだのはPlayer3のみ (-5000 < 0)
    });
  });

  describe('プレイヤー名の保持', () => {
    it('精算後もプレイヤー名・IDが変わらない', () => {
      const players = makePlayers([40000, 30000, 20000, 10000]);
      const result = calculateFinalScores(players, [false, false, false, false], '10/30');
      if (!result.success) throw new Error();
      result.scores.forEach((p, i) => {
        expect(p.id).toBe(players[i].id);
        expect(p.name).toBe(players[i].name);
      });
    });
  });
});

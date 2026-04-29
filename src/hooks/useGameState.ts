import { useState } from 'react';
import type { Player, UmaOption } from '../types';
import { calculateFinalScores } from '../utils/calculate';

const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: 'プレイヤー1', score: 25000 },
  { id: 2, name: 'プレイヤー2', score: 25000 },
  { id: 3, name: 'プレイヤー3', score: 25000 },
  { id: 4, name: 'プレイヤー4', score: 25000 },
];

export function useGameState() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [tobiSho, setTobiSho] = useState<boolean[]>(INITIAL_PLAYERS.map(() => false));
  const [isCalculated, setIsCalculated] = useState(false);
  const [scoresBeforeCalc, setScoresBeforeCalc] = useState<Player[] | null>(null);
  const [umaOption, setUmaOption] = useState<UmaOption>('10/30');

  const handleNameChange = (index: number, newName: string) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, name: newName } : p));
  };

  const handleScoreChange = (index: number, newScore: number) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, score: newScore } : p));
  };

  const updateScore = (index: number, amount: number) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, score: p.score + amount } : p));
  };

  const handleTobiShoChange = (index: number) => {
    setTobiSho(prev => prev.map((v, i) => i === index ? !v : v));
  };

  const handleCalculate = (): boolean => {
    const result = calculateFinalScores(players, tobiSho, umaOption);
    if (!result.success) {
      alert(`合計点数が100,000点になるように入力してください（現在: ${result.total}点）`);
      return false;
    }
    setScoresBeforeCalc(players.map(p => ({ ...p })));
    setPlayers(result.scores);
    setIsCalculated(true);
    return true;
  };

  const handleCorrection = () => {
    if (scoresBeforeCalc) {
      setPlayers(scoresBeforeCalc);
    }
    setIsCalculated(false);
  };

  // ゲーム登録後にスコアをリセット（プレイヤー名は維持）
  const resetGame = () => {
    setPlayers(prev => prev.map(p => ({ ...p, score: 25000 })));
    setTobiSho(prev => prev.map(() => false));
    setIsCalculated(false);
    setScoresBeforeCalc(null);
  };

  return {
    players,
    tobiSho,
    isCalculated,
    umaOption,
    setUmaOption,
    handleNameChange,
    handleScoreChange,
    updateScore,
    handleTobiShoChange,
    handleCalculate,
    handleCorrection,
    resetGame,
  };
}

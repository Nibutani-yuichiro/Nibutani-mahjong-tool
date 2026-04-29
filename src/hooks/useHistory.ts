import { useEffect, useState } from 'react';
import type { Player } from '../types';

const STORAGE_KEY = 'mahjong-history';

export function useHistory() {
  const [history, setHistory] = useState<Record<string, Player[][]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    // 旧フォーマット（配列）との後方互換
    if (Array.isArray(parsed)) {
      const today = new Date().toISOString().slice(0, 10);
      return { [today]: parsed };
    }
    return parsed;
  });

  useEffect(() => {
    if (Object.keys(history).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  const addGame = (players: Player[]) => {
    const today = new Date().toISOString().slice(0, 10);
    setHistory(prev => ({
      ...prev,
      [today]: [...(prev[today] ?? []), players],
    }));
  };

  const clearHistory = () => {
    if (window.confirm('履歴をすべて削除しますか？')) {
      setHistory({});
    }
  };

  return { history, addGame, clearHistory };
}

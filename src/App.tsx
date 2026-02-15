import { useEffect, useState } from 'react';
import './App.css';

type Player = {
  id: number;
  name: string;
  score: number;
};

export default function App() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', score: 25000 },
    { id: 2, name: 'Player 2', score: 25000 },
    { id: 3, name: 'Player 3', score: 25000 },
    { id: 4, name: 'Player 4', score: 25000 },
  ]);
  const [history, setHistory] = useState<Record<string, Player[][]>>(() => {
    const savedHistory = localStorage.getItem('mahjong-history');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      // Check if the saved history is in the old array format
      if (Array.isArray(parsedHistory)) {
        const today = new Date().toISOString().slice(0, 10);
        return { [today]: parsedHistory };
      }
      return parsedHistory;
    }
    return {};
  });
  const [view, setView] = useState<'main' | 'history'>('main');
  const [isCalculated, setIsCalculated] = useState(false);
  const [tobiSho, setTobiSho] = useState<boolean[]>(players.map(() => false));
  const [scoresBeforeCalc, setScoresBeforeCalc] = useState<Player[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    localStorage.setItem('mahjong-history', JSON.stringify(history));
  }, [history]);

  const handleNameChange = (index: number, newName: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = newName;
    setPlayers(newPlayers);
  };

  const handleScoreChange = (index: number, newScore: number) => {
    const newPlayers = [...players];
    newPlayers[index].score = newScore;
    setPlayers(newPlayers);
  };

  const updateScore = (index: number, amount: number) => {
    const newPlayers = [...players];
    newPlayers[index].score += amount;
    setPlayers(newPlayers);
  };

  const handleTobiShoChange = (index: number) => {
    const newTobiSho = [...tobiSho];
    newTobiSho[index] = !newTobiSho[index];
    setTobiSho(newTobiSho);
  };

  const calculateFinalScores = () => {
    const totalScore = players.reduce((sum, player) => sum + player.score, 0);
    if (totalScore !== 100000) {
      alert(`The total score must be 100,000, but it is ${totalScore}.`);
      return;
    }

    setScoresBeforeCalc(players.map(p => ({ ...p }))); // Deep copy

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const uma = [30, 10, -10, -30];
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

    // Oka calculation
    const topScore = sortedPlayers[0].score;
    const topPlayers = sortedPlayers.filter(p => p.score === topScore);
    const okaPerPlayer = oka / topPlayers.length;


    const finalScores = players.map((originalPlayer, index) => {
      let finalScore = (originalPlayer.score - 30000) / 1000;
      finalScore += playerUma.get(originalPlayer.id)!;
      if (originalPlayer.score === topScore) {
          finalScore += okaPerPlayer;
      }

      if (tobiSho[index]) {
        finalScore += 10 * negativeScorePlayersCount;
      }
      if (originalPlayer.score < 0) {
        finalScore -= 10;
      }
      return { ...originalPlayer, score: finalScore };
    });

    setPlayers(finalScores);
    setIsCalculated(true);
  };

  const registerGame = () => {
    const today = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
    const updatedHistory = { ...history };
    if (!updatedHistory[today]) {
      updatedHistory[today] = [];
    }
    updatedHistory[today].push(players);
    setHistory(updatedHistory);
    setPlayers(players.map(p => ({ ...p, score: 25000 })));
    setTobiSho(players.map(() => false));
    setIsCalculated(false);
    setScoresBeforeCalc(null);
    setView('history'); // Navigate to history view
  };

  const handleCorrection = () => {
    if (scoresBeforeCalc) {
      setPlayers(scoresBeforeCalc);
    }
    setIsCalculated(false);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory({});
      localStorage.removeItem('mahjong-history');
    }
  };

  if (view === 'history') {
    const allPlayerNamesInHistory = new Set<string>();
    Object.values(history).forEach(dailyGames => {
      dailyGames.forEach(game => {
        game.forEach(player => {
          allPlayerNamesInHistory.add(player.name);
        });
      });
    });
    players.forEach(player => {
      allPlayerNamesInHistory.add(player.name);
    });
    const masterPlayerNameList = Array.from(allPlayerNamesInHistory);

    if (Object.keys(history).length === 0) {
      return (
        <div className="App">
          <h1>History</h1>
          <button onClick={() => setView('main')}>メインに戻る</button>
          <button onClick={clearHistory} style={{ marginLeft: '10px' }}>履歴をリセット</button>
          <p>No games recorded yet.</p>
        </div>
      );
    }

    const allDates = Object.keys(history).sort(); // All available dates in ascending order
    const selectedDateIndex = allDates.indexOf(selectedDate);
    const hasPreviousDay = selectedDateIndex > 0;
    const hasNextDay = selectedDateIndex < allDates.length - 1;

    const handlePreviousDay = () => {
      if (hasPreviousDay) {
        setSelectedDate(allDates[selectedDateIndex - 1]);
      }
    };

    const handleNextDay = () => {
      if (hasNextDay) {
        setSelectedDate(allDates[selectedDateIndex + 1]);
      }
    };

    const gamesForSelectedDate = history[selectedDate] || [];

    return (
      <div className="App">
        <h1>History</h1>
        <button onClick={() => setView('main')}>Back to Main</button>
        <button onClick={clearHistory} style={{ marginLeft: '10px' }}>Reset History</button>
        <div style={{ margin: '20px 0' }}>
          <button onClick={handlePreviousDay} disabled={!hasPreviousDay}>Previous Day</button>
          <span style={{ margin: '0 10px', fontSize: '1.2em' }}>{selectedDate}</span>
          <button onClick={handleNextDay} disabled={!hasNextDay}>Next Day</button>
        </div>

        {gamesForSelectedDate.length === 0 ? (
          <p>No games recorded for this date.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Game</th>
                {masterPlayerNameList.map((name, idx) => <th key={idx}>{name}</th>)}
              </tr>
            </thead>
            <tbody>
              {gamesForSelectedDate.map((game, gameIndex) => (
                <tr key={gameIndex}>
                  <td>{gameIndex + 1}</td>
                  {masterPlayerNameList.map((name, idx) => {
                    const playerInGame = game.find(p => p.name === name);
                    return <td key={idx}>{playerInGame ? playerInGame.score : 'ー'}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Total row, calculated across ALL games, not just selected date */}
        <table>
          <tfoot>
            <tr>
              <td>Total</td>
              {masterPlayerNameList.map((name, idx) => {
                const totalScore = Object.values(history).reduce((acc, dailyGames) => {
                  return acc + dailyGames.reduce((dayAcc, game) => {
                    const playerInGame = game.find(p => p.name === name);
                    return dayAcc + (playerInGame ? playerInGame.score : 0);
                  }, 0);
                }, 0);
                return <td key={idx}>{totalScore}</td>;
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>麻雀点数記録</h1>
      <button onClick={() => setView('history')}>履歴を見る</button>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>{isCalculated ? 'Final Score' : 'Final Points'}</th>
            <th>飛び賞</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id}>
              <td>
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  readOnly={isCalculated}
                />
              </td>
              <td>
                {isCalculated ? (
                  player.score
                ) : (
                  <div className="score-input-container">
                    <button onClick={() => updateScore(index, -10000)}>-10000</button>
                    <button onClick={() => updateScore(index, -1000)}>-1000</button>
                    <button onClick={() => updateScore(index, -100)}>-100</button>
                    <input
                      type="number"
                      value={player.score}
                      onChange={(e) => handleScoreChange(index, parseInt(e.target.value || '0'))}
                    />
                    <button onClick={() => updateScore(index, 100)}>+100</button>
                    <button onClick={() => updateScore(index, 1000)}>+1000</button>
                    <button onClick={() => updateScore(index, 10000)}>+10000</button>
                  </div>
                )}
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={tobiSho[index]}
                  onChange={() => handleTobiShoChange(index)}
                  disabled={isCalculated}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '20px' }}>
        {isCalculated ? (
          <>
            <button onClick={registerGame}>ゲームを登録</button>
            <button onClick={handleCorrection} style={{ marginLeft: '10px' }}>
              修正
            </button>
          </>
        ) : (
          <button onClick={calculateFinalScores}>最終結果を計算</button>
        )}
      </div>
    </div>
  );
}
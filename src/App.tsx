import { useEffect, useState } from 'react';
import './App.css';
import type { Player, UmaOption } from './types';
import { calculateFinalScores } from './utils/calculate';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'プレイヤー1', score: 25000 },
    { id: 2, name: 'プレイヤー2', score: 25000 },
    { id: 3, name: 'プレイヤー3', score: 25000 },
    { id: 4, name: 'プレイヤー4', score: 25000 },
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
  const [view, setView] = useState<'main' | 'history' | 'help'>('main');
  const [isCalculated, setIsCalculated] = useState(false);
  const [tobiSho, setTobiSho] = useState<boolean[]>(players.map(() => false));
  const [scoresBeforeCalc, setScoresBeforeCalc] = useState<Player[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [umaOption, setUmaOption] = useState<UmaOption>('10/30');

  useEffect(() => {
    localStorage.setItem('mahjong-history', JSON.stringify(history));
  }, [history]);

  const handleNameChange = (index: number, newName: string) => {
    setPlayers(players.map((p, i) => i === index ? { ...p, name: newName } : p));
  };

  const handleScoreChange = (index: number, newScore: number) => {
    setPlayers(players.map((p, i) => i === index ? { ...p, score: newScore } : p));
  };

  const updateScore = (index: number, amount: number) => {
    setPlayers(players.map((p, i) => i === index ? { ...p, score: p.score + amount } : p));
  };

  const handleTobiShoChange = (index: number) => {
    const newTobiSho = [...tobiSho];
    newTobiSho[index] = !newTobiSho[index];
    setTobiSho(newTobiSho);
  };

  const handleCalculate = () => {
    const result = calculateFinalScores(players, tobiSho, umaOption);
    if (!result.success) {
      alert(`合計点数が100,000点になるように入力してください（現在: ${result.total}点）`);
      return;
    }
    setScoresBeforeCalc(players.map(p => ({ ...p })));
    setPlayers(result.scores);
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
    if (window.confirm('履歴をすべて削除しますか？')) {
      setHistory({});
      localStorage.removeItem('mahjong-history');
    }
  };

  if (view === 'help') {
    return (
      <div className="App">
        <h1>使い方</h1>
        <button onClick={() => setView('main')}>メインに戻る</button>
        <div className="help-content">
          <section className="help-section">
            <h2>1. プレイヤー名の入力</h2>
            <p>各プレイヤーの名前欄をクリックして名前を入力してください。</p>
          </section>

          <section className="help-section">
            <h2>2. 最終点数の入力</h2>
            <p>
              ゲーム終了時の点数（持ち点）を入力します。
              直接数値を入力するか、<strong>-10000 / -1000 / -100 / +100 / +1000 / +10000</strong> のボタンで調整できます。
            </p>
            <p className="help-note">4人の点数の合計が <strong>100,000点</strong> になるように入力してください。</p>
          </section>

          <section className="help-section">
            <h2>3. 飛び賞</h2>
            <p>
              相手の点数をマイナスにする上がりをしたプレイヤー（飛ばした人）の「飛び賞」チェックボックスにチェックを入れてください。
            </p>
            <p className="help-note">
              飛ばしたプレイヤーには <strong>+10点 × 飛んだ人数</strong> が加算されます。
              また、点数がマイナスになったプレイヤーには自動的に <strong>-10点</strong> のペナルティが付きます。
            </p>
          </section>

          <section className="help-section">
            <h2>4. 最終結果の計算</h2>
            <p>「最終結果を計算」ボタンを押すと、以下のルールで精算点数を計算します。</p>
            <ul className="help-list">
              <li><strong>基準点：</strong> 30,000点</li>
              <li><strong>ウマ：</strong> メイン画面で選択した設定に従って加算
                <ul className="help-list">
                  <li>5/10 ― 1着 +10 / 2着 +5 / 3着 -5 / 4着 -10</li>
                  <li>10/20 ― 1着 +20 / 2着 +10 / 3着 -10 / 4着 -20</li>
                  <li>10/30 ― 1着 +30 / 2着 +10 / 3着 -10 / 4着 -30</li>
                </ul>
              </li>
              <li><strong>オカ：</strong> 全員の基準点超過分（20点）が1着に加算</li>
              <li><strong>同点時：</strong> 該当順位のウマを平均して分配</li>
            </ul>
            <p>計算式：<code>(最終点数 - 30,000) ÷ 1,000 + ウマ + オカ + 飛び賞</code></p>
          </section>

          <section className="help-section">
            <h2>5. 修正・登録</h2>
            <p>計算後に点数を確認し、問題なければ「ゲームを登録」で履歴に保存します。</p>
            <p>入力ミスがあった場合は「修正」ボタンで入力画面に戻れます。</p>
          </section>

          <section className="help-section">
            <h2>6. 履歴</h2>
            <p>「履歴を見る」ボタンから過去のゲーム結果を確認できます。</p>
            <p>日付ごとに切り替えて表示でき、全ゲームの累計スコアも確認できます。</p>
          </section>
        </div>
      </div>
    );
  }

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
          <h1>履歴</h1>
          <button onClick={() => setView('main')}>メインに戻る</button>
          <button onClick={clearHistory} style={{ marginLeft: '10px' }}>履歴をリセット</button>
          <p>まだゲームが登録されていません。</p>
        </div>
      );
    }

    const allDates = Object.keys(history).sort(); // All available dates in ascending order
    // selectedDate が履歴に存在しない場合（例：翌日にアプリを開いた場合）は最新日付にフォールバック
    const effectiveDate = allDates.includes(selectedDate) ? selectedDate : allDates[allDates.length - 1];
    const selectedDateIndex = allDates.indexOf(effectiveDate);
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

    const gamesForSelectedDate = history[effectiveDate] || [];

    return (
      <div className="App">
        <h1>履歴</h1>
        <button onClick={() => setView('main')}>メインに戻る</button>
        <button onClick={clearHistory} style={{ marginLeft: '10px' }}>履歴をリセット</button>
        <div style={{ margin: '20px 0' }}>
          <button onClick={handlePreviousDay} disabled={!hasPreviousDay}>前の日</button>
          <span style={{ margin: '0 10px', fontSize: '1.2em' }}>{effectiveDate}</span>
          <button onClick={handleNextDay} disabled={!hasNextDay}>次の日</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ゲーム</th>
              {masterPlayerNameList.map((name, idx) => <th key={idx}>{name}</th>)}
            </tr>
          </thead>
          <tbody>
            {gamesForSelectedDate.length === 0 ? (
              <tr>
                <td colSpan={masterPlayerNameList.length + 1}>この日のゲームはありません。</td>
              </tr>
            ) : (
              gamesForSelectedDate.map((game, gameIndex) => (
                <tr key={gameIndex}>
                  <td>{gameIndex + 1}</td>
                  {masterPlayerNameList.map((name, idx) => {
                    const playerInGame = game.find(p => p.name === name);
                    return <td key={idx}>{playerInGame ? playerInGame.score.toFixed(1) : 'ー'}</td>;
                  })}
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>合計</td>
              {masterPlayerNameList.map((name, idx) => {
                const totalScore = gamesForSelectedDate.reduce((acc, game) => {
                  const playerInGame = game.find(p => p.name === name);
                  return acc + (playerInGame ? playerInGame.score : 0);
                }, 0);
                return <td key={idx} className="score-cell">{totalScore.toFixed(1)}</td>;
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
      <button onClick={() => setView('help')} style={{ marginLeft: '10px' }}>使い方</button>
      <div className="uma-selector">
        <span className="uma-label">ウマ：</span>
        {(['5/10', '10/20', '10/30'] as UmaOption[]).map((option) => (
          <button
            key={option}
            className={`uma-option${umaOption === option ? ' uma-option--active' : ''}`}
            onClick={() => setUmaOption(option)}
            disabled={isCalculated}
          >
            {option}
          </button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>プレイヤー</th>
            <th>{isCalculated ? '精算点' : '持ち点'}</th>
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
                  player.score.toFixed(1)
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
          <button onClick={handleCalculate}>最終結果を計算</button>
        )}
      </div>
    </div>
  );
}
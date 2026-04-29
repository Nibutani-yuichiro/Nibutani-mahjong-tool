import type { Player } from '../types';

type Props = {
  history: Record<string, Player[][]>;
  currentPlayerNames: string[];
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  onBack: () => void;
  onClearHistory: () => void;
};

export default function HistoryView({ history, currentPlayerNames, selectedDate, onSelectedDateChange, onBack, onClearHistory }: Props) {

  // 全履歴 + 現在のプレイヤー名を結合してマスターリストを構築
  const allPlayerNamesInHistory = new Set<string>();
  Object.values(history).forEach(dailyGames =>
    dailyGames.forEach(game =>
      game.forEach(player => allPlayerNamesInHistory.add(player.name))
    )
  );
  currentPlayerNames.forEach(name => allPlayerNamesInHistory.add(name));
  const masterPlayerNameList = Array.from(allPlayerNamesInHistory);

  if (Object.keys(history).length === 0) {
    return (
      <div className="App">
        <h1>履歴</h1>
        <button onClick={onBack}>メインに戻る</button>
        <button onClick={onClearHistory} style={{ marginLeft: '10px' }}>履歴をリセット</button>
        <p>まだゲームが登録されていません。</p>
      </div>
    );
  }

  const allDates = Object.keys(history).sort();
  // selectedDate が履歴に存在しない場合は最新日付にフォールバック
  const effectiveDate = allDates.includes(selectedDate) ? selectedDate : allDates[allDates.length - 1];
  const selectedDateIndex = allDates.indexOf(effectiveDate);
  const hasPreviousDay = selectedDateIndex > 0;
  const hasNextDay = selectedDateIndex < allDates.length - 1;

  const handlePreviousDay = () => {
    if (hasPreviousDay) onSelectedDateChange(allDates[selectedDateIndex - 1]);
  };
  const handleNextDay = () => {
    if (hasNextDay) onSelectedDateChange(allDates[selectedDateIndex + 1]);
  };

  const gamesForSelectedDate = history[effectiveDate] ?? [];

  return (
    <div className="App">
      <h1>履歴</h1>
      <button onClick={onBack}>メインに戻る</button>
      <button onClick={onClearHistory} style={{ marginLeft: '10px' }}>履歴をリセット</button>
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

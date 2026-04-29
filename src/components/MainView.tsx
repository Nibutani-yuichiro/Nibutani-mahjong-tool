import type { Player, UmaOption } from '../types';

type Props = {
  players: Player[];
  tobiSho: boolean[];
  isCalculated: boolean;
  umaOption: UmaOption;
  onUmaOptionChange: (option: UmaOption) => void;
  onNameChange: (index: number, name: string) => void;
  onScoreChange: (index: number, score: number) => void;
  onUpdateScore: (index: number, amount: number) => void;
  onTobiShoChange: (index: number) => void;
  onCalculate: () => void;
  onCorrection: () => void;
  onRegister: () => void;
  onNavigateHistory: () => void;
  onNavigateHelp: () => void;
};

export default function MainView({
  players,
  tobiSho,
  isCalculated,
  umaOption,
  onUmaOptionChange,
  onNameChange,
  onScoreChange,
  onUpdateScore,
  onTobiShoChange,
  onCalculate,
  onCorrection,
  onRegister,
  onNavigateHistory,
  onNavigateHelp,
}: Props) {
  return (
    <div className="App">
      <h1>麻雀点数記録</h1>
      <button onClick={onNavigateHistory}>履歴を見る</button>
      <button onClick={onNavigateHelp} style={{ marginLeft: '10px' }}>使い方</button>
      <div className="uma-selector">
        <span className="uma-label">ウマ：</span>
        {(['5/10', '10/20', '10/30'] as UmaOption[]).map(option => (
          <button
            key={option}
            className={`uma-option${umaOption === option ? ' uma-option--active' : ''}`}
            onClick={() => onUmaOptionChange(option)}
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
                  onChange={e => onNameChange(index, e.target.value)}
                  readOnly={isCalculated}
                />
              </td>
              <td>
                {isCalculated ? (
                  player.score.toFixed(1)
                ) : (
                  <div className="score-input-container">
                    <button onClick={() => onUpdateScore(index, -10000)}>-10000</button>
                    <button onClick={() => onUpdateScore(index, -1000)}>-1000</button>
                    <button onClick={() => onUpdateScore(index, -100)}>-100</button>
                    <input
                      type="number"
                      value={player.score}
                      onChange={e => onScoreChange(index, parseInt(e.target.value || '0'))}
                    />
                    <button onClick={() => onUpdateScore(index, 100)}>+100</button>
                    <button onClick={() => onUpdateScore(index, 1000)}>+1000</button>
                    <button onClick={() => onUpdateScore(index, 10000)}>+10000</button>
                  </div>
                )}
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={tobiSho[index]}
                  onChange={() => onTobiShoChange(index)}
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
            <button onClick={onRegister}>ゲームを登録</button>
            <button onClick={onCorrection} style={{ marginLeft: '10px' }}>修正</button>
          </>
        ) : (
          <button onClick={onCalculate}>最終結果を計算</button>
        )}
      </div>
    </div>
  );
}

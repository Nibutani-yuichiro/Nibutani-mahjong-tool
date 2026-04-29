type Props = {
  onBack: () => void;
};

export default function HelpView({ onBack }: Props) {
  return (
    <div className="App">
      <h1>使い方</h1>
      <button onClick={onBack}>メインに戻る</button>
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

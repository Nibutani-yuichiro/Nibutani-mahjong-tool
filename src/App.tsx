import { useState } from 'react';
import './App.css';
import { useGameState } from './hooks/useGameState';
import { useHistory } from './hooks/useHistory';
import HelpView from './components/HelpView';
import HistoryView from './components/HistoryView';
import MainView from './components/MainView';

type View = 'main' | 'history' | 'help';

export default function App() {
  const [view, setView] = useState<View>('main');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const { history, addGame, clearHistory } = useHistory();
  const {
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
  } = useGameState();

  const handleRegister = () => {
    addGame(players);
    resetGame();
    setView('history');
  };

  if (view === 'help') {
    return <HelpView onBack={() => setView('main')} />;
  }

  if (view === 'history') {
    return (
      <HistoryView
        history={history}
        currentPlayerNames={players.map(p => p.name)}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        onBack={() => setView('main')}
        onClearHistory={clearHistory}
      />
    );
  }

  return (
    <MainView
      players={players}
      tobiSho={tobiSho}
      isCalculated={isCalculated}
      umaOption={umaOption}
      onUmaOptionChange={setUmaOption}
      onNameChange={handleNameChange}
      onScoreChange={handleScoreChange}
      onUpdateScore={updateScore}
      onTobiShoChange={handleTobiShoChange}
      onCalculate={handleCalculate}
      onCorrection={handleCorrection}
      onRegister={handleRegister}
      onNavigateHistory={() => setView('history')}
      onNavigateHelp={() => setView('help')}
    />
  );
}

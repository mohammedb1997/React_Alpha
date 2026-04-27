import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { randLetters, pickQuestion, resetUsedQuestions, checkWin, spawnConfetti, N } from '@/lib/gameData';
import HexBoard from '@/components/game/HexBoard';
import QuestionModal from '@/components/game/QuestionModal';
import WinnerOverlay from '@/components/game/WinnerOverlay';
import TeamScorePanel from '@/components/game/TeamScorePanel';

const ROUND_NAMES = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state || {
    teamA: 'الفريق الأحمر',
    teamB: 'الفريق الأخضر',
    roundsToWin: 2,
    difficulty: 'all',
    category: 'all',
    timerDuration: 20,
  };

  const [round, setRound] = useState(1);
  const [letters, setLetters] = useState(() => randLetters());
  const [owner, setOwner] = useState(() => Array(N).fill(null));
  const [pts, setPts] = useState({ a: 0, b: 0 });
  const [rndWins, setRndWins] = useState({ a: 0, b: 0 });
  const [activeCell, setActiveCell] = useState(null);
  const [activeQ, setActiveQ] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [winner, setWinner] = useState(null);

  const resetRound = useCallback(() => {
    const newLetters = randLetters();
    resetUsedQuestions();
    setLetters(newLetters);
    setOwner(Array(N).fill(null));
    setPts({ a: 0, b: 0 });
    setActiveCell(null);
    setActiveQ(null);
    setModalOpen(false);
    setWinner(null);
  }, []);

  const handleNewRound = useCallback(() => {
    setRound(r => r + 1);
    resetRound();
  }, [resetRound]);

  const handleCellClick = useCallback((i) => {
    if (owner[i]) return;
    const q = pickQuestion(letters[i], config.difficulty, config.category);
    if (!q) return;
    setActiveCell(i);
    setActiveQ(q);
    setModalOpen(true);
  }, [owner, letters]);

  const handleMarkTeam = useCallback((team) => {
    if (activeCell === null) return;
    const newOwner = [...owner];
    newOwner[activeCell] = team;
    setOwner(newOwner);
    setPts(prev => ({ ...prev, [team]: prev[team] + 1 }));
    setModalOpen(false);
    setActiveCell(null);

    // Check win
    if (checkWin(newOwner, team)) {
      spawnConfetti(team);
      const newWins = { ...rndWins, [team]: rndWins[team] + 1 };
      setRndWins(newWins);
      setWinner({
        team,
        name: team === 'a' ? config.teamA : config.teamB,
        isGameWin: newWins[team] >= config.roundsToWin,
        roundWins: newWins[team],
      });
      return;
    }

    // All cells filled
    if (newOwner.every(o => o)) {
      const winTeam = (pts.a + (team === 'a' ? 1 : 0)) >= (pts.b + (team === 'b' ? 1 : 0)) ? 'a' : 'b';
      spawnConfetti(winTeam);
      const newWins = { ...rndWins, [winTeam]: rndWins[winTeam] + 1 };
      setRndWins(newWins);
      setWinner({
        team: winTeam,
        name: winTeam === 'a' ? config.teamA : config.teamB,
        isGameWin: newWins[winTeam] >= config.roundsToWin,
        roundWins: newWins[winTeam],
      });
    }
  }, [activeCell, owner, pts, rndWins, config]);

  const handleNextQ = useCallback(() => {
    if (activeCell === null) return;
    const q = pickQuestion(letters[activeCell], config.difficulty, config.category);
    if (q) setActiveQ(q);
  }, [activeCell, letters]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setActiveCell(null);
  }, []);

  return (
    <div className="h-screen flex flex-row overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-team-a/8 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-team-b/8 to-transparent" />
      </div>

      {/* Team A Panel (Right side in RTL) */}
      <TeamScorePanel
        name={config.teamA}
        score={pts.a}
        roundWins={rndWins.a}
        team="a"
        direction="horizontal"
      />

      {/* Center - Board */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 min-w-0">
        {/* Top Bar */}
        <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 px-2 flex-wrap justify-center">
          <span className="bg-primary/10 border border-primary/20 text-primary font-black text-xs sm:text-sm px-3 py-1 rounded-full">
            الجولة {ROUND_NAMES[round] || round} 🏆
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewRound}
            className="rounded-full text-xs font-bold border-border h-8"
          >
            <RotateCcw className="w-3.5 h-3.5 ml-1" />
            جولة جديدة
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/')}
            className="rounded-full text-xs font-bold border-border h-8"
          >
            <Home className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {/* Difficulty & Category Badge */}
        {(config.difficulty !== 'all' || config.category !== 'all') && (
          <div className="flex gap-2 mb-1 flex-wrap justify-center">
            {config.difficulty !== 'all' && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                config.difficulty === 'easy' ? 'bg-team-b/15 border-team-b/30 text-team-b' :
                config.difficulty === 'medium' ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400' :
                'bg-team-a/15 border-team-a/30 text-team-a'
              }`}>
                {config.difficulty === 'easy' ? '🟢 سهل' : config.difficulty === 'medium' ? '🟡 متوسط' : '🔴 صعب'}
              </span>
            )}
            {config.category !== 'all' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-white/5 border-white/15 text-muted-foreground">
                {config.category}
              </span>
            )}
          </div>
        )}

        {/* Hex Board */}
        <div className="flex-1 w-full">
          <HexBoard
            letters={letters}
            owner={owner}
            activeCell={activeCell}
            onCellClick={handleCellClick}
          />
        </div>
      </div>

      {/* Team B Panel (Left side in RTL) */}
      <TeamScorePanel
        name={config.teamB}
        score={pts.b}
        roundWins={rndWins.b}
        team="b"
        direction="vertical"
      />

      {/* Question Modal */}
      <QuestionModal
        open={modalOpen}
        question={activeQ}
        letter={activeCell !== null ? letters[activeCell] : ''}
        teamA={config.teamA}
        teamB={config.teamB}
        timerDuration={config.timerDuration || 20}
        onMarkTeam={handleMarkTeam}
        onNextQuestion={handleNextQ}
        onClose={handleCloseModal}
      />

      {/* Winner Overlay */}
      <WinnerOverlay
        show={!!winner}
        winnerName={winner?.name}
        winnerTeam={winner?.team}
        round={round}
        roundWins={winner?.roundWins}
        roundsToWin={config.roundsToWin}
        isGameWin={winner?.isGameWin}
        onNewRound={handleNewRound}
        onHome={() => navigate('/')}
        onClose={() => setWinner(null)}
      />
    </div>
  );
}
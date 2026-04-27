// src/pages/JudgeGame.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw, Home, Eye, CheckCircle, SkipForward, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { randLetters, pickQuestion, resetUsedQuestions, checkWin, spawnConfetti, N } from '@/lib/gameData';
import { getPeerOptions } from '@/lib/peerClient';
import HexBoard from '@/components/game/HexBoard';
import WinnerOverlay from '@/components/game/WinnerOverlay';
import QRCode from '@/components/game/QRCode';

const ROUND_NAMES = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرامعة', 'الخامسة'];

export default function JudgeGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state || {
    teamA: 'الفريق الأحمر', teamB: 'الفريق الأخضر',
    roundsToWin: 2, difficulty: 'all', category: 'all', code: 'XXXXX',
  };

  const [round, setRound] = useState(1);
  const [letters, setLetters] = useState(() => randLetters());
  const [owner, setOwner] = useState(() => Array(N).fill(null));
  const [pts, setPts] = useState({ a: 0, b: 0 });
  const [rndWins, setRndWins] = useState({ a: 0, b: 0 });
  const [activeCell, setActiveCell] = useState(null);
  const [activeQ, setActiveQ] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | open | won
  const [bzWinner, setBzWinner] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [timer, setTimer] = useState(0);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [liveDifficulty, setLiveDifficulty] = useState(config.difficulty);
  
  const peerRef = useRef(null);
  const connsRef = useRef([]);
  const timerRef = useRef(null);

  // Connect PeerJS
  useEffect(() => {
    connectPeer();
    return () => {
      if (peerRef.current) peerRef.current.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const connectPeer = async () => {
    try {
      const { Peer } = await import('peerjs');
      const peer = new Peer('hexgame-' + config.code, getPeerOptions());
      peerRef.current = peer;

      peer.on('open', () => {
        console.log('Judge peer connected:', config.code);
      });

      peer.on('connection', (conn) => {
        connsRef.current.push(conn);
        conn.on('open', () => {
          broadcast(getPublicState());
        });
        conn.on('data', (data) => handleData(data, conn));
        conn.on('close', () => {
          connsRef.current = connsRef.current.filter(c => c !== conn);
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
      });
    } catch (err) {
      console.error('Failed to connect PeerJS:', err);
    }
  };

  const getPublicState = useCallback(() => ({
    teamA: config.teamA,
    teamB: config.teamB,
    board: letters.map((l, i) => ({ letter: l, owner: owner[i] })),
    activeCell,
    phase,
    bzWinner,
    timerSecs: timer,
    pts,
    showQuestion,
    showAnswer,
    activeQ,
    round,
    rndWins,
  }), [letters, owner, activeCell, phase, bzWinner, timer, pts, showQuestion, showAnswer, activeQ, round, rndWins, config]);

  const broadcast = useCallback((data) => {
    connsRef.current.forEach(c => { if (c.open) c.send(data); });
  }, []);

  const handleData = useCallback((data, conn) => {
    if (data.type === 'join') {
      if (!players.find(p => p.id === data.id)) {
        setPlayers(prev => [...prev, {
          name: data.name, team: data.team, id: data.id,
          conn: connsRef.current.find(c => c.peer === data.id)
        }]);
      }
      broadcast({ type: 'state', s: getPublicState() });
      return;
    }

    if (data.type === 'buzz') {
      if (phase !== 'open' || bzWinner) return;
      const winner = { name: data.name, team: data.team, id: data.id };
      setBzWinner(winner);
      setPhase('won');
      clearTimer();
      startTimer(5);
      broadcast({ type: 'buzzer_won', winner });
      broadcast({ type: 'state', s: { ...getPublicState(), bzWinner: winner, phase: 'won', timerSecs: 5 } });
    }
  }, [phase, bzWinner, players, getPublicState, broadcast]);

  const startTimer = (secs) => {
    clearTimer();
    setTimer(secs);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        const next = prev - 1;
        broadcast({ type: 'tick', secs: next });
        if (next <= 0) {
          clearTimer();
          handleTimerEnd();
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleTimerEnd = () => {
    if (phase === 'won' && bzWinner) {
      const other = bzWinner.team === 'a' ? 'b' : 'a';
      setPhase('open');
      setBzWinner(null);
      startTimer(10);
      broadcast({ type: 'second_chance', team: other });
      broadcast({ type: 'state', s: getPublicState() });
    } else {
      setPhase('open');
      setBzWinner(null);
      broadcast({ type: 'open_q' });
      broadcast({ type: 'state', s: getPublicState() });
    }
  };

  const handleCellClick = useCallback((i) => {
    if (owner[i]) return;
    const q = pickQuestion(letters[i], liveDifficulty, config.category);
    if (!q) return;
    setActiveCell(i);
    setActiveQ(q);
    setPhase('open');
    setBzWinner(null);
    setShowAnswer(false);
    setShowQuestion(true);
    clearTimer();
    broadcast({ type: 'buzzer_ready', letter: letters[i] });
    broadcast({ type: 'state', s: getPublicState() });
  }, [owner, letters, liveDifficulty, config.category, getPublicState, broadcast]);

  const handleCorrect = useCallback((team) => {
    if (activeCell === null) return;
    const newOwner = [...owner];
    newOwner[activeCell] = team;
    setOwner(newOwner);
    const newPts = { ...pts, [team]: pts[team] + 1 };
    setPts(newPts);
    clearTimer();
    setPhase('idle');
    setBzWinner(null);
    setActiveCell(null);
    setActiveQ(null);
    setShowAnswer(false);

    broadcast({ type: 'correct', team });
    broadcast({ type: 'state', s: getPublicState() });

    if (checkWin(newOwner, team)) {
      const newWins = { ...rndWins, [team]: rndWins[team] + 1 };
      setRndWins(newWins);
      spawnConfetti(team);
      setWinner({
        team, name: team === 'a' ? config.teamA : config.teamB,
        isGameWin: newWins[team] >= config.roundsToWin,
        roundWins: newWins[team],
      });
      broadcast({ type: 'round_win', team, rndWins: newWins });
      if (newWins[team] >= config.roundsToWin) {
        broadcast({ type: 'game_win', team });
      }
      return;
    }

    if (newOwner.every(o => o)) {
      const winTeam = newPts.a >= newPts.b ? 'a' : 'b';
      const newWins = { ...rndWins, [winTeam]: rndWins[winTeam] + 1 };
      setRndWins(newWins);
      spawnConfetti(winTeam);
      setWinner({
        team: winTeam, name: winTeam === 'a' ? config.teamA : config.teamB,
        isGameWin: newWins[winTeam] >= config.roundsToWin,
        roundWins: newWins[winTeam],
      });
      broadcast({ type: 'round_win', team: winTeam, rndWins: newWins });
    }
  }, [activeCell, owner, pts, rndWins, config, getPublicState, broadcast]);

  const handleNewRound = useCallback(() => {
    const newLetters = randLetters();
    resetUsedQuestions();
    setRound(r => r + 1);
    setLetters(newLetters);
    setOwner(Array(N).fill(null));
    setPts({ a: 0, b: 0 });
    setActiveCell(null);
    setActiveQ(null);
    setPhase('idle');
    setBzWinner(null);
    setShowAnswer(false);
    setWinner(null);
    clearTimer();
    broadcast({ type: 'new_round', round: round + 1 });
    broadcast({ type: 'state', s: getPublicState() });
  }, [round, getPublicState, broadcast]);

  const handleSkip = () => {
    clearTimer();
    setPhase('idle');
    setBzWinner(null);
    setActiveCell(null);
    setActiveQ(null);
    setShowAnswer(false);
    broadcast({ type: 'skip' });
    broadcast({ type: 'state', s: getPublicState() });
  };

  const handleNextQ = () => {
    if (activeCell === null) return;
    const q = pickQuestion(letters[activeCell], liveDifficulty, config.category);
    if (q) {
      setActiveQ(q);
      setShowAnswer(false);
    }
  };

  const kickPlayer = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const conn = connsRef.current.find(c => c.peer === playerId);
    if (conn && conn.open) conn.send({ type: 'kicked' });
    if (conn) conn.close();
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    connsRef.current = connsRef.current.filter(c => c.peer !== playerId);
  };

  const getPlayerURL = () => `${window.location.origin}/player-join?mode=player&code=${config.code}`;
  const getDisplayURL = () => `${window.location.origin}/display?mode=display&code=${config.code}`;

  return (
    <div className="h-screen flex flex-row overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-team-a/4 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-team-b/4 to-transparent" />
      </div>

      {/* Code Badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-black/70 border border-primary/30 rounded-full px-4 py-1 text-primary font-bold text-sm tracking-wider">
        كود: {config.code}
      </div>

      {/* Left Panel - Scores & QR */}
      <div className={`relative z-10 flex flex-col items-center justify-between py-3 px-2 bg-black/30 backdrop-blur-sm border-l border-white/5 transition-all duration-300 ${leftPanelCollapsed ? 'w-0 min-w-0 p-0 border-0 overflow-hidden' : 'w-[120px] sm:w-[150px]'}`}>
        <button onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)} className="absolute -left-8 top-4 w-7 h-7 bg-black/60 border border-white/20 rounded-full flex items-center justify-center text-white text-xs z-40">
          {leftPanelCollapsed ? '▶' : '◀'}
        </button>
        {!leftPanelCollapsed && (
          <>
            <div className="w-full text-center rounded-xl p-2 bg-team-a/10 border border-team-a/20">
              <p className="text-xs font-bold text-team-a truncate">{config.teamA}</p>
              <p className="text-2xl font-black text-team-a">{pts.a}</p>
              <p className="text-[10px] text-muted-foreground">جولات: {rndWins.a}</p>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">◀▶ أفقي</div>
              <div className="text-xs text-muted-foreground">▲▼ عمودي</div>
              <button onClick={() => setQrModalOpen(true)} className="mt-2 bg-white rounded-lg p-1">
                <div className="w-14 h-14 flex items-center justify-center text-xs text-black">QR</div>
              </button>
              <button onClick={() => window.open(getDisplayURL(), '_blank')} className="mt-2 text-[10px] text-primary underline">
                📺 البروجكتر
              </button>
            </div>
            <div className="w-full text-center rounded-xl p-2 bg-team-b/10 border border-team-b/20">
              <p className="text-xs font-bold text-team-b truncate">{config.teamB}</p>
              <p className="text-2xl font-black text-team-b">{pts.b}</p>
              <p className="text-[10px] text-muted-foreground">جولات: {rndWins.b}</p>
            </div>
          </>
        )}
      </div>

      {/* Center - Board */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 min-w-0">
        <div className="text-sm font-bold text-primary mb-2">
          الجولة {ROUND_NAMES[round] || round} 🏆
        </div>
        <div className="w-full flex-1">
          <HexBoard
            letters={letters}
            owner={owner}
            activeCell={activeCell}
            onCellClick={handleCellClick}
          />
        </div>
      </div>

      {/* Right Panel - Controls */}
      <div className={`relative z-10 flex flex-col gap-2 py-3 px-2 bg-black/30 backdrop-blur-sm border-r border-white/5 overflow-y-auto transition-all duration-300 ${rightPanelCollapsed ? 'w-0 min-w-0 p-0 border-0 overflow-hidden' : 'w-[200px] sm:w-[250px]'}`}>
        <button onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)} className="absolute -right-8 top-4 w-7 h-7 bg-black/60 border border-white/20 rounded-full flex items-center justify-center text-white text-xs z-40">
          {rightPanelCollapsed ? '◀' : '▶'}
        </button>
        {!rightPanelCollapsed && (
          <>
            {/* Buzzer Status */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2">
              <h3 className="text-xs font-bold text-primary mb-1">⚡ البازر</h3>
              {phase === 'idle' && <p className="text-xs text-muted-foreground">اختر خلية لبدء السؤال...</p>}
              {phase === 'open' && !bzWinner && <p className="text-xs text-primary font-bold">⚡ البازر مفتوح للجميع!</p>}
              {bzWinner && (
                <div className={`rounded-lg p-2 ${bzWinner.team === 'a' ? 'bg-team-a/10 border border-team-a/20' : 'bg-team-b/10 border border-team-b/20'}`}>
                  <p className={`text-sm font-bold ${bzWinner.team === 'a' ? 'text-team-a' : 'text-team-b'}`}>⚡ {bzWinner.name}</p>
                  <p className="text-lg font-black font-mono text-primary">{timer}</p>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2">
              <h3 className="text-xs font-bold text-primary mb-1">❓ السؤال</h3>
              <p className="text-sm font-bold leading-relaxed">{activeQ?.q || 'اختر خلية من اللوحة...'}</p>
              {showAnswer && activeQ && (
                <p className="text-sm font-bold text-team-b mt-1">✅ {activeQ.a}</p>
              )}
            </div>

            {/* Live Difficulty */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2">
              <h3 className="text-xs font-bold text-primary mb-1">🎯 الصعوبة (مباشر)</h3>
              <div className="flex gap-1 flex-wrap">
                {[{ id: 'all', label: '🌟' }, { id: 'easy', label: '🟢' }, { id: 'medium', label: '🟡' }, { id: 'hard', label: '🔴' }].map(d => (
                  <button key={d.id} onClick={() => setLiveDifficulty(d.id)}
                    className={`px-2 py-1 rounded-full text-xs border ${liveDifficulty === d.id ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary border-border'}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2">
              <h3 className="text-xs font-bold text-primary mb-1">🎮 تحكم الحكم</h3>
              <div className="grid grid-cols-2 gap-1">
                <Button size="sm" onClick={() => setShowAnswer(true)} className="col-span-2 bg-purple-600 hover:bg-purple-700 text-xs h-8">
                  <Eye className="w-3 h-3 ml-1" /> إظهار الإجابة
                </Button>
                <Button size="sm" onClick={() => handleCorrect('a')} className="bg-team-a hover:bg-team-a/90 text-xs h-8">
                  <CheckCircle className="w-3 h-3 ml-1" /> {config.teamA.substring(0, 6)}
                </Button>
                <Button size="sm" onClick={() => handleCorrect('b')} className="bg-team-b hover:bg-team-b/90 text-xs h-8">
                  <CheckCircle className="w-3 h-3 ml-1" /> {config.teamB.substring(0, 6)}
                </Button>
                <Button size="sm" onClick={handleNextQ} className="col-span-2 bg-amber-600 hover:bg-amber-700 text-xs h-8">
                  🔄 سؤال آخر
                </Button>
                <Button size="sm" onClick={() => { setPhase('open'); setBzWinner(null); clearTimer(); broadcast({ type: 'buzzer_ready', letter: letters[activeCell] }); broadcast({ type: 'state', s: getPublicState() }); }} className="col-span-2 bg-blue-600 hover:bg-blue-700 text-xs h-8">
                  🔓 إعادة فتح البازر
                </Button>
                <Button size="sm" onClick={handleSkip} className="col-span-2 bg-gray-600 hover:bg-gray-700 text-xs h-8">
                  <SkipForward className="w-3 h-3 ml-1" /> تخطي
                </Button>
                <Button size="sm" onClick={handleNewRound} className="col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8">
                  <RotateCcw className="w-3 h-3 ml-1" /> جولة جديدة
                </Button>
                <Button size="sm" onClick={() => navigate('/')} className="col-span-2 bg-white/10 hover:bg-white/20 text-xs h-8">
                  <Home className="w-3 h-3 ml-1" /> الرئيسية
                </Button>
              </div>
            </div>

            {/* Players */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2">
              <h3 className="text-xs font-bold text-primary mb-1">
                <Users className="w-3 h-3 inline ml-1" /> اللاعبون ({players.length})
              </h3>
              <div className="max-h-24 overflow-y-auto">
                {players.length === 0 && <p className="text-xs text-muted-foreground">لا يوجد لاعبون...</p>}
                {players.map(p => (
                  <div key={p.id} className={`flex items-center gap-1 py-1 px-1 rounded text-xs ${p.team === 'a' ? 'bg-team-a/5' : 'bg-team-b/5'}`}>
                    <span className={`w-2 h-2 rounded-full ${p.team === 'a' ? 'bg-team-a' : 'bg-team-b'}`}></span>
                    <span className="flex-1 truncate">{p.name}</span>
                    <button onClick={() => kickPlayer(p.id)} className="text-red-400 hover:text-red-300">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* QR Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-[200] flex items-center justify-center" onClick={() => setQrModalOpen(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 text-center max-w-xs w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-primary mb-2">📱 انضم للعبة</h2>
            <QRCode url={getPlayerURL()} size={180} />
            <p className="text-xs text-muted-foreground mt-3 font-mono bg-secondary rounded-lg p-2 break-all">{getPlayerURL()}</p>
            <Button onClick={() => setQrModalOpen(false)} variant="outline" className="mt-3 rounded-full text-xs">
              ✕ إغلاق
            </Button>
          </div>
        </div>
      )}

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
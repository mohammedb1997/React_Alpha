// src/pages/PlayerWait.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getPeerOptions } from '@/lib/peerClient';

export default function PlayerWait() {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerName, playerTeam, gameCode } = location.state || {};

  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);

  useEffect(() => {
    if (!playerName || !gameCode) {
      navigate('/player-join');
      return;
    }
    connectToGame();
    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  const connectToGame = async () => {
    try {
      const { Peer } = await import('peerjs');
      const peer = new Peer(getPeerOptions());
      peerRef.current = peer;

      peer.on('open', () => {
        const conn = peer.connect('hexgame-' + gameCode, { reliable: true });
        connRef.current = conn;

        conn.on('open', () => {
          setConnected(true);
          conn.send({
            type: 'join',
            name: playerName,
            team: playerTeam,
            id: peer.id,
          });
        });

        conn.on('data', (data) => {
          if (data.type === 'kicked') {
            alert('لقد تم طردك من اللعبة من قبل الحكم.');
            peer.destroy();
            navigate('/player-join');
            return;
          }
          if (data.type === 'state') {
            setGameState(data.s);
          }
          if (data.type === 'buzzer_ready') {
            navigate('/player-buzzer', {
              state: {
                playerName, playerTeam, gameCode,
                peerId: peer.id,
                letter: data.letter,
              }
            });
          }
          if (data.type === 'show_q') {
            // Store question for later
          }
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setConnected(false);
      });
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 gap-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Status Badge */}
      <div className={`px-4 py-1 rounded-full text-xs font-bold border ${connected ? 'bg-team-b/10 border-team-b/30 text-team-b' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
        {connected ? '✅ متصل' : '⏳ جاري الاتصال...'}
      </div>

      {/* Avatar */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl border-3 ${
          playerTeam === 'a' ? 'bg-team-a/10 border-team-a' : 'bg-team-b/10 border-team-b'
        }`}
      >
        {playerTeam === 'a' ? '🟠' : '🟢'}
      </motion.div>

      {/* Name */}
      <h2 className={`text-2xl font-black ${playerTeam === 'a' ? 'text-team-a' : 'text-team-b'}`}>
        {playerName}
      </h2>

      {/* Team Badge */}
      <div className={`px-4 py-1 rounded-full text-sm font-bold ${
        playerTeam === 'a' ? 'bg-team-a/10 border border-team-a/30 text-team-a' : 'bg-team-b/10 border border-team-b/30 text-team-b'
      }`}>
        {gameState ? (playerTeam === 'a' ? gameState.teamA : gameState.teamB) : (playerTeam === 'a' ? 'الفريق أ' : 'الفريق ب')}
      </div>

      {/* Waiting Message */}
      <p className="text-muted-foreground font-bold text-sm">
        في انتظار اختيار سؤال...
      </p>

      {/* Mini Board Preview */}
      {gameState?.board && (
        <div className="w-full max-w-xs bg-black/20 border border-white/5 rounded-xl p-2">
          <MiniBoard board={gameState.board} activeCell={gameState.activeCell} />
        </div>
      )}

      <Button
        onClick={() => navigate('/player-join')}
        variant="ghost"
        className="rounded-full text-muted-foreground hover:text-foreground text-xs"
      >
        🔙 خروج
      </Button>
    </div>
  );
}

// Mini board component for player
function MiniBoard({ board, activeCell }) {
  const COLS = 5, ROWS = 5;
  const scale = 0.4;
  const HW = 68 * scale;
  const HH = HW * 0.866;
  const W = (COLS - 1) * HW * 0.75 + HW;
  const H = (ROWS - 1) * HH + HH * 0.5 + HH;

  return (
    <div className="relative mx-auto" style={{ width: W, height: H }}>
      {board.map((cell, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const odd = col % 2 === 1;
        const x = col * HW * 0.75;
        const y = row * HH + (odd ? HH * 0.5 : 0);
        
        let bg = 'rgba(255,255,255,0.15)';
        if (cell.owner === 'a') bg = 'hsl(14,100%,57%)';
        if (cell.owner === 'b') bg = 'hsl(122,39%,49%)';
        
        return (
          <div
            key={i}
            className={`absolute flex items-center justify-center font-bold text-white ${
              activeCell === i ? 'animate-pulse-glow ring-2 ring-primary' : ''
            }`}
            style={{
              left: x, top: y, width: HW, height: HH,
              fontSize: HW * 0.3,
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              background: bg,
              textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            {cell.letter}
          </div>
        );
      })}
    </div>
  );
}
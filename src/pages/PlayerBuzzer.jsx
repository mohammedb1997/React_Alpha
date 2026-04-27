// src/pages/PlayerBuzzer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPeerOptions } from '@/lib/peerClient';

export default function PlayerBuzzer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerName, playerTeam, gameCode, peerId } = location.state || {};

  const [bzEnabled, setBzEnabled] = useState(true);
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [message, setMessage] = useState('⚡ اضغط البازر بأسرع ما يمكن!');
  
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const cdRef = useRef(null);

  useEffect(() => {
    if (!playerName || !gameCode) {
      navigate('/player-join');
      return;
    }
    connectPeer();
    return () => {
      if (peerRef.current) peerRef.current.destroy();
      if (cdRef.current) clearInterval(cdRef.current);
    };
  }, []);

  const connectPeer = async () => {
    try {
      const { Peer } = await import('peerjs');
      const peer = new Peer(getPeerOptions());
      peerRef.current = peer;

      peer.on('open', () => {
        const conn = peer.connect('hexgame-' + gameCode, { reliable: true });
        connRef.current = conn;

        conn.on('data', (data) => {
          if (data.type === 'buzzer_won') {
            handleBuzzerWon(data.winner);
          }
          if (data.type === 'second_chance') {
            handleSecondChance(data.team);
          }
          if (data.type === 'open_q') {
            handleOpenQ();
          }
          if (data.type === 'tick') {
            setCountdown(data.secs);
          }
          if (data.type === 'correct' || data.type === 'skip' || data.type === 'new_round') {
            navigate('/player-wait', { state: { playerName, playerTeam, gameCode, peerId } });
          }
        });
      });
    } catch (err) {
      console.error('Buzzer peer error:', err);
    }
  };

  const handleBuzz = () => {
    if (!bzEnabled) return;
    setBzEnabled(false);
    if (navigator.vibrate) navigator.vibrate([60, 30, 80]);
    if (connRef.current && connRef.current.open) {
      connRef.current.send({
        type: 'buzz',
        name: playerName,
        team: playerTeam,
        id: peerRef.current?.id || peerId,
      });
    }
  };

  const handleBuzzerWon = (winner) => {
    const isMe = winner.id === (peerRef.current?.id || peerId);
    if (isMe) {
      setMessage('✅ أنت الأول! أجب على الحكم');
      setResult({ name: playerName + ' 🎉', sub: '⚡ أنت الأول! أجب على الحكم', color: playerTeam === 'a' ? 'hsl(14,100%,57%)' : 'hsl(122,39%,49%)' });
    } else {
      setMessage('سبقك ' + winner.name);
      setResult({ name: winner.name, sub: 'يحاول الإجابة الآن...', color: winner.team === 'a' ? 'hsl(14,100%,57%)' : 'hsl(122,39%,49%)' });
    }
    startLocalCountdown(5);
  };

  const handleSecondChance = (team) => {
    if (team === playerTeam) {
      setBzEnabled(true);
      setMessage('🔥 الفرصة الثانية! اضغط الآن!');
      setResult(null);
    } else {
      setMessage('الفريق الآخر يجيب...');
      setBzEnabled(false);
    }
  };

  const handleOpenQ = () => {
    setBzEnabled(true);
    setMessage('🔓 مفتوح للجميع!');
    setResult(null);
  };

  const startLocalCountdown = (secs) => {
    if (cdRef.current) clearInterval(cdRef.current);
    setCountdown(secs);
    cdRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(cdRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 gap-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Result Card */}
      {result && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-2xl p-4 text-center max-w-xs w-full shadow-xl"
        >
          <p className="text-lg font-black" style={{ color: result.color }}>{result.name}</p>
          <p className="text-xs text-muted-foreground">{result.sub}</p>
          {countdown !== null && (
            <p className="text-4xl font-black font-mono text-primary mt-2">{countdown}</p>
          )}
        </motion.div>
      )}

      {/* Buzzer Button */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={handleBuzz}
        disabled={!bzEnabled}
        className={`w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] rounded-full flex flex-col items-center justify-center gap-2 font-black text-lg transition-all duration-200 ${
          bzEnabled
            ? playerTeam === 'a'
              ? 'bg-radial from-[#ff8060] via-[#FF5722] to-[#BF360C] text-white shadow-[0_14px_50px_rgba(255,87,34,0.45)] animate-[pulse-bz-a_1.1s_ease_infinite] cursor-pointer'
              : 'bg-radial from-[#81c784] via-[#4CAF50] to-[#1B5E20] text-white shadow-[0_14px_50px_rgba(76,175,80,0.45)] animate-[pulse-bz-b_1.1s_ease_infinite] cursor-pointer'
            : 'bg-gray-700 text-gray-400 opacity-30 cursor-not-allowed'
        }`}
      >
        <span className="text-4xl">⚡</span>
        <span className="text-base">
          {bzEnabled ? 'اضغط الآن!' : 'انتظر...'}
        </span>
      </motion.button>

      {/* Status */}
      <p className={`text-sm font-bold ${bzEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
        {message}
      </p>
    </div>
  );
}
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { hexPos, boardDims, COLS, ROWS } from '@/lib/gameData';

export default function HexBoard({ letters, owner, activeCell, onCellClick }) {
  const containerRef = useRef(null);
  const [hw, setHw] = useState(68);

  const calculateHW = useCallback(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    // calculate max hw that fits
    const maxByWidth = (cw - 20) / ((COLS - 1) * 0.75 + 1);
    const hh_factor = 0.866;
    const maxByHeight = (ch - 20) / ((ROWS - 1) * hh_factor + hh_factor * 0.5 + hh_factor);
    const computed = Math.min(maxByWidth, maxByHeight, 90);
    setHw(Math.max(computed, 36));
  }, []);

  useEffect(() => {
    calculateHW();
    window.addEventListener('resize', calculateHW);
    return () => window.removeEventListener('resize', calculateHW);
  }, [calculateHW]);

  const dims = boardDims(hw);

  return (
    <div ref={containerRef} className="flex items-center justify-center w-full h-full p-2">
      <div className="relative" style={{ width: dims.W, height: dims.H }}>
        {/* Team A border indicators (left/right) */}
        <div className="absolute -right-2 top-0 bottom-0 w-1.5 rounded-full bg-gradient-to-b from-team-a-dark via-team-a to-team-a-dark z-10" />
        <div className="absolute -left-2 top-0 bottom-0 w-1.5 rounded-full bg-gradient-to-b from-team-a-dark via-team-a to-team-a-dark z-10" />
        {/* Team B border indicators (top/bottom) */}
        <div className="absolute -top-2 left-0 right-0 h-1.5 rounded-full bg-gradient-to-r from-team-b-dark via-team-b to-team-b-dark z-10" />
        <div className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full bg-gradient-to-r from-team-b-dark via-team-b to-team-b-dark z-10" />

        {letters.map((letter, i) => {
          const pos = hexPos(i, hw);
          const isOwned = owner[i];
          const isActive = activeCell === i;
          const isTeamA = owner[i] === 'a';
          const isTeamB = owner[i] === 'b';

          return (
            <button
              key={i}
              onClick={() => !isOwned && onCellClick?.(i)}
              className="absolute flex items-center justify-center font-cairo font-black transition-all duration-150 select-none touch-manipulation"
              style={{
                left: pos.x,
                top: pos.y,
                width: pos.w,
                height: pos.h,
                fontSize: pos.w * 0.3,
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                background: isTeamA
                  ? 'linear-gradient(145deg, #ff7043, #BF360C)'
                  : isTeamB
                  ? 'linear-gradient(145deg, #66bb6a, #1B5E20)'
                  : 'rgba(255,255,255,0.88)',
                color: isOwned ? '#fff' : '#1a1a2e',
                boxShadow: isActive
                  ? '0 0 20px 5px hsl(45 100% 50%), 0 0 0 4px hsl(45 100% 50% / 0.5)'
                  : isTeamA
                  ? '0 2px 12px rgba(255,87,34,0.4)'
                  : isTeamB
                  ? '0 2px 12px rgba(76,175,80,0.4)'
                  : '0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                animation: isActive ? 'pulse-glow 0.9s ease infinite alternate' : 'none',
                zIndex: isActive ? 20 : 1,
                cursor: isOwned ? 'default' : 'pointer',
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
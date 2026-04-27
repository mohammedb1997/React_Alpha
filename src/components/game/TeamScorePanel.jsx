import React from 'react';
import { motion } from 'framer-motion';

export default function TeamScorePanel({ name, score, roundWins, team, direction }) {
  const isA = team === 'a';

  return (
    <div className={`flex flex-col items-center justify-between gap-3 py-3 sm:py-5 px-2 sm:px-4 
      ${isA ? 'bg-team-a/5 border-team-a/15' : 'bg-team-b/5 border-team-b/15'} 
      border-l sm:border-l-0 backdrop-blur-sm min-w-[60px] sm:min-w-[100px] lg:min-w-[120px]`}
    >
      {/* Score Block */}
      <div className={`w-full text-center rounded-xl p-2 sm:p-3 
        ${isA ? 'bg-team-a/10 border border-team-a/20' : 'bg-team-b/10 border border-team-b/20'}`}
      >
        <p className={`text-[10px] sm:text-xs font-bold opacity-80 mb-0.5 truncate
          ${isA ? 'text-team-a' : 'text-team-b'}`}
        >
          {name}
        </p>
        <motion.p
          key={score}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className={`text-2xl sm:text-4xl lg:text-5xl font-black leading-none
            ${isA ? 'text-team-a' : 'text-team-b'}`}
        >
          {score}
        </motion.p>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
          جولات: {roundWins}
        </p>
      </div>

      {/* Direction Indicator */}
      <div className="text-center opacity-40">
        <p className="text-sm sm:text-base">{direction === 'horizontal' ? '◀▶' : '▲▼'}</p>
        <p className="text-[8px] sm:text-[9px] text-muted-foreground">
          {direction === 'horizontal' ? 'يمين←يسار' : 'أعلى←أسفل'}
        </p>
      </div>
    </div>
  );
}
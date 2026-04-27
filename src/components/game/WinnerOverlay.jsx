import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, Home, X } from 'lucide-react';

export default function WinnerOverlay({
  show,
  winnerName,
  winnerTeam,
  round,
  roundWins,
  roundsToWin,
  isGameWin,
  onNewRound,
  onHome,
  onClose,
}) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/88 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-4 p-6"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="text-7xl sm:text-8xl"
        >
          🏆
        </motion.div>

        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-3xl sm:text-4xl font-black text-center ${
            winnerTeam === 'a' ? 'text-team-a' : 'text-team-b'
          }`}
        >
          {winnerName}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-muted-foreground font-bold text-base sm:text-lg text-center"
        >
          {isGameWin
            ? '🏆 فاز باللعبة كاملة!'
            : `🏆 فاز بالجولة ${round} — جولات: ${roundWins}/${roundsToWin}`}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 mt-4"
        >
          <Button
            onClick={onNewRound}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-3 rounded-full text-sm shadow-lg"
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            جولة جديدة
          </Button>
          <Button
            onClick={onHome}
            variant="outline"
            className="rounded-full px-6 py-3 text-sm font-bold border-border text-muted-foreground"
          >
            <Home className="w-4 h-4 ml-2" />
            الرئيسية
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="rounded-full px-4 py-3 text-sm text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
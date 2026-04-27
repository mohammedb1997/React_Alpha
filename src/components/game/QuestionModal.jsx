import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, RotateCcw, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Simple beep using Web Audio API
function beep(freq = 880, duration = 80, vol = 0.3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
    setTimeout(() => ctx.close(), duration + 100);
  } catch (_) {}
}

export default function QuestionModal({
  open,
  question,
  letter,
  teamA,
  teamB,
  timerDuration = 20,
  onMarkTeam,
  onNextQuestion,
  onClose,
}) {
  const [timer, setTimer] = useState(timerDuration);
  const [showAnswer, setShowAnswer] = useState(false);
  const intervalRef = useRef(null);

  const clearTimer = () => { clearInterval(intervalRef.current); intervalRef.current = null; };

  useEffect(() => {
    if (!open) return;
    setTimer(timerDuration);
    setShowAnswer(false);
    clearTimer();

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        const next = prev - 1;
        // Warning beeps at 5, 4, 3, 2, 1
        if (next > 0 && next <= 5) beep(660, 60, 0.25);
        if (next <= 0) {
          clearTimer();
          setShowAnswer(true);
          beep(330, 300, 0.4); // final low beep
          return 0;
        }
        return next;
      });
    }, 1000);

    return clearTimer;
  }, [open, question?.q, timerDuration]);

  const handleNextQ = useCallback(() => {
    setShowAnswer(false);
    setTimer(timerDuration);
    clearTimer();
    onNextQuestion();
  }, [onNextQuestion, timerDuration]);

  if (!open || !question) return null;

  const pct = timer / timerDuration; // 1→0
  const isUrgent = timer <= 5 && timer > 0;
  const isDone = timer === 0;

  // Color: green→yellow→red
  const barColor = pct > 0.5
    ? `hsl(${120}deg 60% 45%)`
    : pct > 0.25
    ? `hsl(${45}deg 100% 50%)`
    : `hsl(${10}deg 100% 55%)`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`bg-card border rounded-2xl p-5 sm:p-7 w-full max-w-md shadow-2xl transition-colors duration-300 ${
            isUrgent ? 'border-destructive/60 shadow-destructive/20' : 'border-border'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-sm mb-2">
              ✨ حرف «{letter}»
            </span>
          </div>

          {/* Question */}
          <div className="bg-secondary rounded-xl p-4 sm:p-5 text-center mb-4 border border-border">
            <p className="text-foreground font-bold text-base sm:text-lg leading-relaxed">
              {question.q}
            </p>
          </div>

          {/* Timer number + bar */}
          <div className="mb-4">
            {/* Number */}
            <div className="text-center mb-2">
              <motion.span
                key={timer}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className={`text-5xl sm:text-6xl font-black tabular-nums transition-colors duration-300 ${
                  isDone ? 'text-destructive' : isUrgent ? 'text-destructive' : 'text-primary'
                }`}
              >
                {timer}
              </motion.span>
            </div>

            {/* Timer Bar */}
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden border border-border">
              <motion.div
                className="absolute inset-y-0 right-0 rounded-full"
                style={{ background: barColor }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.9, ease: 'linear' }}
              />
              {/* Urgent pulse overlay */}
              {isUrgent && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-destructive/30"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                />
              )}
            </div>

            {/* Warning label */}
            <AnimatePresence>
              {isUrgent && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-xs font-black text-destructive mt-1.5 tracking-wide"
                >
                  ⚠️ الوقت ينتهي!
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Answer */}
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-team-b/10 border border-team-b/30 rounded-xl p-3 text-center mb-4">
                  <p className="text-team-b font-bold text-base sm:text-lg">
                    ✅ {question.a}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={() => { setShowAnswer(true); clearTimer(); }}
              className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm"
            >
              <Eye className="w-4 h-4 ml-1" />
              إظهار الإجابة
            </Button>

            <Button
              onClick={() => onMarkTeam('a')}
              className="bg-team-a hover:bg-team-a/90 text-white font-bold py-3 rounded-xl text-sm"
            >
              <CheckCircle className="w-4 h-4 ml-1" />
              {teamA.substring(0, 10)}
            </Button>

            <Button
              onClick={() => onMarkTeam('b')}
              className="bg-team-b hover:bg-team-b/90 text-white font-bold py-3 rounded-xl text-sm"
            >
              <CheckCircle className="w-4 h-4 ml-1" />
              {teamB.substring(0, 10)}
            </Button>

            <Button
              onClick={handleNextQ}
              className="col-span-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-sm"
            >
              <RotateCcw className="w-4 h-4 ml-1" />
              سؤال آخر
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="col-span-2 font-bold py-3 rounded-xl text-sm border-border text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 ml-1" />
              إغلاق
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
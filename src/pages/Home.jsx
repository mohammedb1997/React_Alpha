import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Sparkles, Monitor, Smartphone } from 'lucide-react';

const ModeCard = ({ to, icon, title, desc, colorClass, delay }) => (
  <motion.div
    initial={{ y: 30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, type: 'spring', damping: 20 }}
  >
    <Link to={to}>
      <div className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 cursor-pointer
        transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group
        bg-card ${colorClass}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="text-4xl sm:text-5xl mb-3">{icon}</div>
          <h2 className="text-base sm:text-lg font-black text-foreground mb-1">{title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function Home() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const code = params.get('code');

  // Auto-redirect if coming from QR code link
  React.useEffect(() => {
    if (mode === 'player') {
      window.location.href = `/player-join?mode=player&code=${code || ''}`;
    } else if (mode === 'display' && code) {
      window.location.href = `/display?mode=display&code=${code}`;
    }
  }, [mode, code]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6 py-10">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-team-a/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-team-b/10 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* Logo / Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative z-10 text-center mb-8 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-br from-white via-primary to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
          تحدي الحروف
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base font-semibold mt-2">
          لعبة المسابقات الذكية للعائلة والأصدقاء
        </p>
      </motion.div>

      {/* Game Mode Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <ModeCard
          to="/setup"
          icon="🎮"
          title="لعب محلي"
          desc="فريقان يتنافسان على نفس الجهاز"
          colorClass="border-team-a/20 hover:border-team-a/40"
          delay={0.1}
        />
        <ModeCard
          to="/judge-setup"
          icon="📡"
          title="لعب مشترك"
          desc="حكم + بروجكتر + بازرات"
          colorClass="border-team-b/20 hover:border-team-b/40"
          delay={0.2}
        />
        <ModeCard
          to="/player-join"
          icon="⚡"
          title="شاشة اللاعب (بازر)"
          desc="افتحها على هاتف اللاعب"
          colorClass="border-primary/20 hover:border-primary/40"
          delay={0.3}
        />
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', damping: 20 }}
          className="sm:col-span-2"
        >
          <Link to="/display">
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 hover:border-primary/40 p-5 sm:p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-card">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative z-10 text-center">
                <div className="text-4xl sm:text-5xl mb-3">📺</div>
                <h2 className="text-base sm:text-lg font-black text-foreground mb-1">شاشة البروجكتر</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">اعرض اللوحة والأسئلة على الشاشة الكبيرة</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 text-[10px] sm:text-xs text-muted-foreground/50 mt-8 text-center"
      >
        يعمل على جميع الأجهزة: جوال • آيباد • لابتوب • تلفاز
      </motion.p>
    </div>
  );
}
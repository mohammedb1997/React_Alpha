// src/pages/PlayerJoin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, LogIn } from 'lucide-react';

export default function PlayerJoin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [team, setTeam] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) setCode(urlCode.toUpperCase());
    const savedName = localStorage.getItem('playerName_' + (urlCode || ''));
    if (savedName) setName(savedName);
  }, [searchParams]);

  const handleJoin = () => {
    setError('');
    if (!name.trim()) { setError('يرجى إدخال اسمك'); return; }
    if (!team) { setError('يرجى اختيار فريقك'); return; }
    if (!code.trim()) { setError('يرجى إدخال كود الجلسة'); return; }
    
    const cleanCode = code.trim().toUpperCase();
    localStorage.setItem('playerName_' + cleanCode, name.trim());
    
    navigate('/player-wait', {
      state: {
        playerName: name.trim(),
        playerTeam: team,
        gameCode: cleanCode,
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-team-a/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-team-b/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-card border border-border rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">⚡</div>
          <h2 className="text-xl sm:text-2xl font-black text-primary">تحدي الحروف</h2>
          <p className="text-xs text-muted-foreground mt-1">انضم كلاعب</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">👤 اسمك</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              placeholder="اكتب اسمك"
              className="bg-secondary border-border text-center font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">🎯 اختر فريقك</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTeam('a')}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  team === 'a'
                    ? 'bg-team-a/20 border-team-a text-team-a'
                    : 'bg-secondary border-border text-muted-foreground hover:border-team-a/30'
                }`}
              >
                🟠 الفريق أ
              </button>
              <button
                onClick={() => setTeam('b')}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  team === 'b'
                    ? 'bg-team-b/20 border-team-b text-team-b'
                    : 'bg-secondary border-border text-muted-foreground hover:border-team-b/30'
                }`}
              >
                🟢 الفريق ب
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">🔑 كود الجلسة</label>
            <Input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="مثال: AB123"
              className="bg-secondary border-border text-center font-bold tracking-widest"
            />
          </div>

          {error && (
            <div className="bg-team-a/10 border border-team-a/30 rounded-xl p-2 text-team-a text-xs font-bold text-center">
              {error}
            </div>
          )}

          <Button
            onClick={handleJoin}
            className="w-full bg-gradient-to-l from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-primary-foreground font-black text-base py-5 rounded-xl shadow-lg shadow-primary/20"
          >
            <LogIn className="w-5 h-5 ml-2" />
            انضم للعبة 🚀
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mt-5"
      >
        <Link to="/">
          <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground font-bold">
            <ArrowRight className="w-4 h-4 ml-1" />
            العودة
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
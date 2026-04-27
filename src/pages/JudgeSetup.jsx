// src/pages/JudgeSetup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Play } from 'lucide-react';

const DIFFICULTIES = [
  { id: 'all', label: '🌟 الكل' },
  { id: 'easy', label: '🟢 سهل' },
  { id: 'medium', label: '🟡 متوسط' },
  { id: 'hard', label: '🔴 صعب' },
];

const CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'حيوان', label: 'حيوان 🐾' },
  { id: 'نبات', label: 'نبات 🌿' },
  { id: 'جماد', label: 'جماد 💎' },
  { id: 'إنسان', label: 'إنسان 🧬' },
  { id: 'بلاد', label: 'بلاد 🗺️' },
  { id: 'جغرافي', label: 'جغرافي 🌍' },
  { id: 'تاريخ', label: 'تاريخ 📜' },
  { id: 'ثقافي', label: 'ثقافي 🎓' },
  { id: 'اجتماعي', label: 'اجتماعي 👥' },
  { id: 'طب', label: 'طب 🏥' },
  { id: 'علاقات', label: 'علاقات ❤️' },
];

export default function JudgeSetup() {
  const navigate = useNavigate();
  const [teamA, setTeamA] = useState('الفريق الأحمر');
  const [teamB, setTeamB] = useState('الفريق الأخضر');
  const [roundsToWin, setRoundsToWin] = useState('2');
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');

  const generateCode = () => Math.random().toString(36).substr(2, 5).toUpperCase();

  const handleStart = () => {
    const code = generateCode();
    navigate('/judge-game', {
      state: {
        teamA: teamA.trim() || 'الفريق الأحمر',
        teamB: teamB.trim() || 'الفريق الأخضر',
        roundsToWin: parseInt(roundsToWin),
        difficulty,
        category,
        code,
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-team-b/5 rounded-full blur-[130px]" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-card border border-border rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📡</div>
          <h2 className="text-xl sm:text-2xl font-black text-primary">شاشة الحكم</h2>
          <p className="text-xs text-muted-foreground mt-1">إعداد جلسة اللعب المشترك</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-bold text-team-a mb-1.5">🟠 الفريق الأول</label>
            <Input
              value={teamA}
              onChange={e => setTeamA(e.target.value)}
              maxLength={16}
              className="bg-secondary border-team-a/20 focus:border-team-a text-center font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-team-b mb-1.5">🟢 الفريق الثاني</label>
            <Input
              value={teamB}
              onChange={e => setTeamB(e.target.value)}
              maxLength={16}
              className="bg-secondary border-team-b/20 focus:border-team-b text-center font-bold text-sm"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-primary mb-1.5">🏆 عدد الجولات للفوز</label>
          <Select value={roundsToWin} onValueChange={setRoundsToWin}>
            <SelectTrigger className="bg-secondary border-border font-bold text-center">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">جولة واحدة</SelectItem>
              <SelectItem value="2">جولتان</SelectItem>
              <SelectItem value="3">3 جولات</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-bold text-primary mb-2">🎯 مستوى الصعوبة</label>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  difficulty === d.id
                    ? d.id === 'all' ? 'bg-primary/20 border-primary text-primary'
                    : d.id === 'easy' ? 'bg-team-b/20 border-team-b text-team-b'
                    : d.id === 'medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                    : 'bg-team-a/20 border-team-a text-team-a'
                    : 'bg-secondary border-border text-muted-foreground hover:border-border/60'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-primary mb-2">📂 نوع الأسئلة</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                  category === c.id
                    ? 'bg-white/15 border-white/40 text-foreground'
                    : 'bg-secondary border-border text-muted-foreground hover:border-border/60'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-secondary/60 rounded-xl p-4 mb-6 border border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            📱 سيتم إنشاء كود للجلسة لمشاركته مع اللاعبين
          </p>
        </div>

        <Button
          onClick={handleStart}
          className="w-full bg-gradient-to-l from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-primary-foreground font-black text-base py-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
          <Play className="w-5 h-5 ml-2" />
          إنشاء الغرفة وبدء اللعب
        </Button>
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
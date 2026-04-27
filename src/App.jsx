import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from '@/pages/Home';
import Setup from '@/pages/Setup';
import Game from '@/pages/Game';
import JudgeSetup from '@/pages/JudgeSetup';
import JudgeGame from '@/pages/JudgeGame';
import PlayerJoin from '@/pages/PlayerJoin';
import PlayerWait from '@/pages/PlayerWait';
import PlayerBuzzer from '@/pages/PlayerBuzzer';
import DisplayScreen from '@/pages/DisplayScreen';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/game" element={<Game />} />
      <Route path="/judge-setup" element={<JudgeSetup />} />
      <Route path="/judge-game" element={<JudgeGame />} />
      <Route path="/player-join" element={<PlayerJoin />} />
      <Route path="/player-wait" element={<PlayerWait />} />
      <Route path="/player-buzzer" element={<PlayerBuzzer />} />
      <Route path="/display" element={<DisplayScreen />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
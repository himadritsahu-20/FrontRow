import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { StoreProvider, useStore } from './lib/store';
import Header from './components/Header';
import TaskModal from './components/TaskModal';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import CalendarPage from './pages/CalendarPage';
import Analytics from './pages/Analytics';

function SignInGate() {
  const { profile } = useStore();
  if (profile) return <Navigate to="/" replace />;
  return <SignIn />;
}

function ProtectedLayout() {
  const { profile } = useStore();
  if (!profile) return <Navigate to="/signin" replace />;
  return (
    <div className="flex min-h-screen flex-col bg-linen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line py-5 text-center text-xs text-mist-soft">
        FrontRow — Academic Priorities · all data stays in this browser
      </footer>
      <TaskModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignInGate />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

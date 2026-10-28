import { AppProvider, useApp } from "./lib/store";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import TaskModal from "./components/TaskModal";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";

function AppShell() {
  const { profile, hydrated } = useApp();
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ec]">
        <p className="font-serif-display text-xl font-bold text-[#152142]">FrontRow</p>
      </div>
    );
  }

  // Auth gate: all app pages require a profile.
  if (!profile) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TaskModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}

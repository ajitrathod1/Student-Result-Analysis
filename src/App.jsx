import React, { useState, useEffect } from 'react';
import { LogOut, GraduationCap, UserCheck } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Component Imports
import LoginScreen from './components/LoginScreen';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const [view, setView] = useState('login');
  const [userRole, setUserRole] = useState(null); // 'teacher' | 'student'
  const [currentUser, setCurrentUser] = useState(null); // Stores logged in faculty details

  // Persistence
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    const savedUser = localStorage.getItem('currentUser');
    if (savedRole) {
      setUserRole(savedRole);
      setView(savedRole);
    }
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (role, userData = null) => {
    setUserRole(role);
    setView(role);
    setCurrentUser(userData);
    localStorage.setItem('userRole', role);
    if (userData) localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUserRole(null);
    setView('login');
    setCurrentUser(null);
    localStorage.clear();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30 pb-20">

      {/* Navigation Bar */}
      {view !== 'login' && (
        <nav className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">R</div>
              <span className="font-semibold text-lg">ResultPro</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300 border border-slate-600 flex items-center gap-2">
                {userRole === 'teacher' ? <UserCheck size={12} /> : <GraduationCap size={12} />}
                {userRole === 'teacher'
                  ? currentUser?.name || 'Faculty Portal'
                  : 'Student Portal'}
              </span>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </nav>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {view === 'login' && <LoginScreen key="login" onLogin={handleLogin} />}
          {view === 'teacher' && <TeacherDashboard key="teacher" currentUser={currentUser} />}
          {view === 'student' && <StudentDashboard key="student" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;

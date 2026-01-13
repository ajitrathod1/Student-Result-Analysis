import React, { useState, useEffect } from 'react';
import { Upload, Users, GraduationCap, Trophy, ArrowRight, BookOpen, LineChart as LineChartIcon, LogOut, Search, AlertTriangle, Calculator, Save, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// --- CONFIGURATION & MOCK DATA ---
const BRANCHES = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Real-world logic: Faculty Accounts
const FACULTY_DB = {
  'hod': { pass: 'admin', name: 'Dr. Sharma (HOD)', subjects: 'ALL', branch: 'CSE' },
  'math_faculty': { pass: '123456', name: 'Prof. Rakesh (Maths)', subjects: ['Maths-III'], branch: 'CSE' },
  'ds_faculty': { pass: '123456', name: 'Prof. Anjali (CS)', subjects: ['Data Structures'], branch: 'CSE' },
  'coa_faculty': { pass: '123456', name: 'Prof. Vikram (COA)', subjects: ['COA'], branch: 'CSE' },
};

const MOCK_SUBJECT_DATA = [
  { name: 'Data Structures', pass: 45, fail: 5, avg: 72, code: 'CS301' },
  { name: 'Maths-III', pass: 28, fail: 22, avg: 45, code: 'MA301' }, // Critical Subject
  { name: 'Digital Logic', pass: 40, fail: 10, avg: 65, code: 'CS302' },
  { name: 'COA', pass: 48, fail: 2, avg: 80, code: 'CS303' },
  { name: 'Discreate Str', pass: 35, fail: 15, avg: 55, code: 'CS304' },
];

const STUDENT_HISTORY_MOCK = [
  { semester: 'Sem 1', sgpa: 7.2 },
  { semester: 'Sem 2', sgpa: 7.5 },
  { semester: 'Sem 3', sgpa: 6.8 },
  { semester: 'Sem 4', sgpa: 7.8 },
  { semester: 'Sem 5', sgpa: 8.2 },
  { semester: 'Sem 6', sgpa: 8.5 },
];

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

// --- SCREENS ---

function LoginScreen({ onLogin }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const initiateLogin = (role) => {
    setSelectedRole(role);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRole(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          University Result Analytics
        </h1>
        <p className="text-slate-400 text-lg">Centralized Academics Performance System</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl z-0">
        <LoginCard
          title="Faculty Login"
          desc="Update marks for your specific subjects."
          icon={<Users size={40} className="text-blue-400" />}
          onClick={() => initiateLogin('teacher')}
          color="blue"
        />
        <LoginCard
          title="Student Login"
          desc="Check your result by entering USN."
          icon={<GraduationCap size={40} className="text-green-400" />}
          onClick={() => initiateLogin('student')}
          color="green"
        />
      </div>

      <AnimatePresence>
        {showModal && (
          <LoginModal
            role={selectedRole}
            onClose={closeModal}
            onSuccess={onLogin}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginModal({ role, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'teacher') {
      // Check Faculty DB
      const user = FACULTY_DB[username];
      if (user && user.pass === password) {
        onSuccess('teacher', { ...user, id: username }); // Pass user data
      } else {
        setError('Invalid Username or Password');
      }
    } else {
      // Student USN Validation
      if (username.length > 5) {
        onSuccess('student', { id: username });
      } else {
        setError('Please enter a valid USN');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <LogOut size={20} className="rotate-180" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
            {role === 'teacher' ? <Users className="text-blue-400" size={32} /> : <GraduationCap className="text-green-400" size={32} />}
          </div>
          <h2 className="text-2xl font-bold capitalize">{role === 'teacher' ? 'Faculty Access' : 'Student Access'}</h2>
          <p className="text-slate-400 text-sm mt-1">
            {role === 'teacher' ? 'Enter your Faculty ID & Password' : 'Enter your University Seat Number (USN)'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder={role === 'teacher' ? "Faculty ID (e.g., math_faculty)" : "Enter USN (e.g. 1CS19CS001)"}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
              autoFocus
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
            />
          </div>

          {role === 'teacher' && (
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />
            </div>
          )}

          {error && <p className="text-red-400 text-xs mt-2 text-center bg-red-500/10 p-2 rounded">{error}</p>}

          {/* Helper Hint for Demo */}
          {role === 'teacher' && !error && (
            <p className="text-xs text-slate-600 text-center">
              Demo: hod / admin OR math_faculty / 123456
            </p>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg text-white ${role === 'teacher'
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
                : 'bg-green-600 hover:bg-green-500 shadow-green-500/25'
              }`}
          >
            {role === 'teacher' ? 'Login to Portal' : 'View Result'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function LoginCard({ title, desc, icon, onClick, color }) {
  const colors = {
    blue: "hover:border-blue-500/50 hover:shadow-blue-500/20",
    green: "hover:border-green-500/50 hover:shadow-green-500/20"
  };

  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-slate-800 p-8 rounded-3xl border border-slate-700 text-left transition-all shadow-xl group ${colors[color]}`}
    >
      <div className="mb-6 p-4 bg-slate-900/50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
      <div className="mt-8 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
        Access Portal <ArrowRight size={16} />
      </div>
    </motion.button>
  );
}

function TeacherDashboard({ currentUser }) {
  const [branch, setBranch] = useState(currentUser?.branch || BRANCHES[0]);
  const [sem, setSem] = useState(SEMESTERS[2]);
  const [subjectData, setSubjectData] = useState(MOCK_SUBJECT_DATA);

  // FILTER LOGIC: If allowed 'ALL', show everything. Else filter data by user subjects.
  const allowedSubjects = currentUser?.subjects === 'ALL'
    ? subjectData
    : subjectData.filter(s => currentUser?.subjects?.includes(s.name));

  // Identify critical subjects (Failure rate > 20%) - From filtered list
  const criticalSubjects = allowedSubjects.filter(sub => (sub.fail / (sub.pass + sub.fail)) > 0.2);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome, {currentUser?.name}</h2>
          <p className="text-slate-400 text-sm mt-1">You have access to: <span className="text-blue-400 font-semibold">{currentUser?.subjects === 'ALL' ? 'All Subjects (HOD Mode)' : currentUser?.subjects?.join(', ')}</span></p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-wrap gap-6 items-end">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Branch</label>
          <div className="px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 min-w-[200px]">
            {branch}
            {/* Locked for faculty usually, but can be dropdown if HOD */}
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Semester</label>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-600">
            {SEMESTERS.map(s => (
              <button
                key={s}
                onClick={() => setSem(s)}
                className={`w-10 h-10 rounded-md font-medium text-sm transition-all ${sem === s ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 text-right">
          {currentUser?.subjects !== 'ALL' ? (
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl cursor-pointer transition-all shadow-lg shadow-blue-500/20 font-medium text-white">
              <Upload size={18} />
              Upload {currentUser?.subjects[0]} Marks
              <input type="file" className="hidden" />
            </label>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-slate-700 rounded-xl text-slate-400 text-sm border border-slate-600">
              <UserCheck size={16} /> Select specific subject to upload
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-400 text-sm">Assigned Subjects</p>
          <h3 className="text-3xl font-bold mt-1 text-white">{allowedSubjects.length}</h3>
        </div>
        {/* Only show aggregate stats if data exists */}
        {allowedSubjects.length > 0 && (
          <>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <p className="text-slate-400 text-sm">Avg Pass Rate</p>
              <h3 className="text-3xl font-bold mt-1 text-green-400">
                {Math.round(allowedSubjects.reduce((acc, curr) => acc + (curr.pass / (curr.pass + curr.fail) * 100), 0) / allowedSubjects.length)}%
              </h3>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 border-l-4 border-l-red-500">
              <p className="text-slate-400 text-sm">Critical Subjects</p>
              <h3 className="text-3xl font-bold mt-1 text-red-400">{criticalSubjects.length}</h3>
            </div>
          </>
        )}
      </div>

      {/* Deep Dive Analysis - Only show allowed subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Only show charts if there is authorized data */}
        {allowedSubjects.length > 0 ? (
          <div className="col-span-1 lg:col-span-3 bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-6 text-white">Your Subject Performance</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allowedSubjects} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} cursor={{ fill: '#334155', opacity: 0.2 }} />
                  <Legend />
                  <Bar dataKey="pass" stackId="a" fill="#3b82f6" name="Passed" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="fail" stackId="a" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="col-span-3 text-center py-20 text-slate-500 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
            No data available for your assigned subjects in this semester.
          </div>
        )}
      </div>
    </motion.div>
  )
}

function StudentDashboard({ roll, setRoll, data, setData }) {
  const [rollInput, setRollInput] = useState('0187CS191001'); // Default for demo
  const [targetCGPA, setTargetCGPA] = useState(8.5);
  const [requiredSGPA, setRequiredSGPA] = useState(null);
  const mockData = STUDENT_HISTORY_MOCK;

  // CGPA Calculator Logic
  const calculateRequired = () => {
    const currentSum = mockData.reduce((acc, curr) => acc + curr.sgpa, 0);
    const totalSemesters = 8;
    const completeSemesters = mockData.length;
    const remainingSemesters = totalSemesters - completeSemesters;

    if (remainingSemesters <= 0) {
      alert("No semesters left to improve!");
      return;
    }
    const neededTotal = targetCGPA * totalSemesters;
    const neededFromRemaining = neededTotal - currentSum;
    const req = neededFromRemaining / remainingSemesters;
    setRequiredSGPA(req.toFixed(2));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-8 rounded-3xl border border-slate-700 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-bold text-white border border-white/20 shadow-xl">
            {rollInput.slice(-2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-white">Rahul Sharma</h2>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg text-xs font-bold border border-yellow-500/30 flex items-center gap-1">
                <Trophy size={12} /> Class Rank #5
              </span>
            </div>
            <p className="text-blue-200 mt-1">{rollInput} • Computer Science Engineering</p>
          </div>
          <div className="md:ml-auto flex gap-6">
            <div className="text-center">
              <p className="text-sm text-slate-400">Current CGPA</p>
              <p className="text-3xl font-bold text-white">7.65</p>
            </div>
            <div className="w-px bg-slate-700"></div>
            <div className="text-center">
              <p className="text-sm text-slate-400">Total Backlogs</p>
              <p className="text-3xl font-bold text-red-400">1</p>
            </div>
          </div>
        </div>
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 w-full h-full bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CGPA Graph */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <LineChartIcon size={20} className="text-blue-400" />
              Performance Trajectory
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="semester" stroke="#94a3b8" />
                <YAxis domain={[0, 10]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="sgpa"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#1e293b", strokeWidth: 3, stroke: "#3b82f6" }}
                  activeDot={{ r: 8, fill: "#60a5fa" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CGPA Planner Tool */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Calculator size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Dream CGPA Planner</h3>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Set Your Target CGPA</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(e.target.value)}
                  step="0.1"
                  max="10"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 w-24 text-center text-xl font-bold outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  onClick={calculateRequired}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                >
                  Calculate
                </button>
              </div>
            </div>

            {requiredSGPA && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950 p-5 rounded-xl border border-slate-700"
              >
                <p className="text-slate-400 text-sm mb-1">You need to average</p>
                <div className="text-4xl font-bold text-purple-400 mb-1">{requiredSGPA} SGPA</div>
                <p className="text-slate-500 text-xs">in the remaining semesters to reach your goal.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default App;

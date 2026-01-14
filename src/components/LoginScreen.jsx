import React, { useState } from 'react';
import { Users, GraduationCap, LogOut, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Real-world logic: Faculty Accounts
const FACULTY_DB = {
    'hod': { pass: 'admin', name: 'Dr. Sharma (HOD)', subjects: 'ALL', branch: 'CSE' },
    'math_faculty': { pass: '123456', name: 'Prof. Rakesh (Maths)', subjects: ['Maths-III'], branch: 'CSE' },
    'ds_faculty': { pass: '123456', name: 'Prof. Anjali (CS)', subjects: ['Data Structures'], branch: 'CSE' },
    'coa_faculty': { pass: '123456', name: 'Prof. Vikram (COA)', subjects: ['COA'], branch: 'CSE' },
};

export default function LoginScreen({ onLogin }) {
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

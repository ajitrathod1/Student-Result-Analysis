import React, { useState } from 'react';
import { Trophy, LineChart as LineChartIcon, Calculator, Briefcase, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STUDENT_HISTORY_MOCK = [
    { semester: 'Sem 1', sgpa: 7.2 },
    { semester: 'Sem 2', sgpa: 7.5 },
    { semester: 'Sem 3', sgpa: 6.8 },
    { semester: 'Sem 4', sgpa: 7.8 },
    { semester: 'Sem 5', sgpa: 8.2 },
    { semester: 'Sem 6', sgpa: 8.5 },
];

const MOCK_TRANSCRIPT = {
    1: {
        sgpa: 7.2,
        credits: 20,
        subjects: [
            { name: 'Engineering Maths-I', code: 'MAT101', internal: 35, external: 45, total: 80, credits: 4, grade: 'A', status: 'PASS' },
            { name: 'Engineering Physics', code: 'PHY102', internal: 28, external: 32, total: 60, credits: 4, grade: 'B', status: 'PASS' },
            { name: 'Basic Electrical', code: 'ELE103', internal: 30, external: 40, total: 70, credits: 3, grade: 'B+', status: 'PASS' },
            { name: 'Engineering Mechanics', code: 'CIV104', internal: 25, external: 35, total: 60, credits: 3, grade: 'B', status: 'PASS' },
            { name: 'Comm. Skills', code: 'HUM105', internal: 38, external: 42, total: 80, credits: 2, grade: 'A', status: 'PASS' },
        ]
    },
    2: {
        sgpa: 7.5,
        credits: 20,
        subjects: [
            { name: 'Engineering Maths-II', code: 'MAT201', internal: 32, external: 48, total: 80, credits: 4, grade: 'A', status: 'PASS' },
            { name: 'Engineering Chemistry', code: 'CHE202', internal: 30, external: 45, total: 75, credits: 4, grade: 'A', status: 'PASS' },
            { name: 'Basic Electronics', code: 'ECE203', internal: 28, external: 38, total: 66, credits: 3, grade: 'B+', status: 'PASS' },
            { name: 'C Programming', code: 'CS204', internal: 35, external: 40, total: 75, credits: 3, grade: 'A', status: 'PASS' },
            { name: 'Env. Studies', code: 'EVS205', internal: 38, external: 42, total: 80, credits: 2, grade: 'A', status: 'PASS' },
        ]
    },
    3: {
        sgpa: 6.8,
        credits: 24,
        subjects: [
            { name: 'Engineering Maths-III', code: 'MAT301', internal: 12, external: 15, total: 27, credits: 4, grade: 'F', status: 'FAIL' },
            { name: 'Data Structures', code: 'CS302', internal: 32, external: 40, total: 72, credits: 4, grade: 'B+', status: 'PASS' },
            { name: 'Digital Logic', code: 'CS303', internal: 35, external: 45, total: 80, credits: 3, grade: 'A', status: 'PASS' },
            { name: 'COA', code: 'CS304', internal: 25, external: 35, total: 60, credits: 3, grade: 'B', status: 'PASS' },
            { name: 'Discrete Maths', code: 'CS305', internal: 28, external: 32, total: 60, credits: 3, grade: 'B', status: 'PASS' },
        ]
    },
    4: { sgpa: 7.8, credits: 24, subjects: [{ name: 'Algorithms', code: 'CS401', internal: 35, external: 45, total: 80, credits: 4, grade: 'A', status: 'PASS' }] }, // Simplified for demo
    5: { sgpa: 8.2, credits: 24, subjects: [{ name: 'DBMS', code: 'CS501', internal: 38, external: 48, total: 86, credits: 4, grade: 'A+', status: 'PASS' }] },
    6: { sgpa: 8.5, credits: 24, subjects: [{ name: 'Operating Systems', code: 'CS601', internal: 36, external: 50, total: 86, credits: 4, grade: 'A+', status: 'PASS' }] },
};

// Mock Company Logic
const COMPANIES = [
    { name: "TCS Ninja", minCgpa: 6.0, maxBacklogs: 1, package: "3.5 LPA", logo: "T" },
    { name: "Accenture", minCgpa: 6.5, maxBacklogs: 0, package: "4.5 LPA", logo: "A" },
    { name: "Amazon", minCgpa: 7.5, maxBacklogs: 0, package: "24 LPA", logo: "A" },
    { name: "Goldman Sachs", minCgpa: 8.0, maxBacklogs: 0, package: "32 LPA", logo: "G" },
    { name: "Google", minCgpa: 9.0, maxBacklogs: 0, package: "40 LPA", logo: "G" },
];

export default function StudentDashboard({ roll, setRoll, data, setData }) {
    const [currentCGPA, setCurrentCGPA] = useState(7.65);
    const [activeBacklogs, setActiveBacklogs] = useState(1);
    const [selectedSem, setSelectedSem] = useState(3); // Default to the Semester with Backlog for demo

    // Survival Calc State
    const [internalMarks, setInternalMarks] = useState(15);
    const [requiredExternal, setRequiredExternal] = useState(null);

    // Survival Calculator Logic
    const calculateSurvival = () => {
        // Logic: Total Passing = 40. Keep in mind University Rules.
        // If Internal (max 40) + External (max 60) >= 40 AND External >= 21 (35% of 60)
        // Simplified Rule: Need Total 40, but min 21 in external.

        // Scenario 1: Total must be 40. So External >= 40 - Internals.
        let reqBasedOnTotal = 40 - internalMarks;

        // Scenario 2: Minimum External Requirement (e.g., 21/60)
        const minExternalRule = 21;

        // The actual requirement is the MAX of both scenarios.
        // If Internals are 30 (very good), 40-30=10 needed. BUT university says min 21 needed. So 21.
        // If internals are 10 (bad), 40-10=30 needed. 30 > 21, so 30 needed.

        const finalReq = Math.max(reqBasedOnTotal, minExternalRule);

        if (finalReq > 60) {
            setRequiredExternal("Impossible (>60)");
        } else {
            setRequiredExternal(finalReq);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Header Profile - Compact */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-center gap-6 shadow-xl">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    RS
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white">Rahul Sharma</h2>
                    <p className="text-slate-400 text-sm">{roll || '0187CS191001'} • CSE</p>
                </div>
                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">CGPA</p>
                        <p className="text-3xl font-bold text-white">{currentCGPA}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Backlogs</p>
                        <p className="text-3xl font-bold text-red-400">{activeBacklogs}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Career & Survival (The "Real" Stuff) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 1. PLACEMENT ELIGIBILITY (New 'Killer Feature') */}
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <Briefcase className="text-blue-400" size={20} /> Placement Reality Check
                            </h3>
                            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">Based on Live Result</span>
                        </div>
                        <div className="p-6 grid gap-4">
                            {COMPANIES.map((comp) => {
                                const isCgpaOk = currentCGPA >= comp.minCgpa;
                                const isBacklogOk = activeBacklogs <= comp.maxBacklogs;
                                const isEligible = isCgpaOk && isBacklogOk;

                                return (
                                    <div key={comp.name} className={`flex items-center justify-between p-4 rounded-xl border ${isEligible ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-900 border-slate-700 opacity-70'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${isEligible ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                                {comp.logo}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">{comp.name}</h4>
                                                <p className="text-xs text-slate-400">Pkg: {comp.package}</p>
                                            </div>
                                        </div>

                                        {isEligible ? (
                                            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold bg-green-500/10 px-3 py-1 rounded-full">
                                                <CheckCircle size={16} /> Eligible
                                            </div>
                                        ) : (
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 text-red-400 text-sm font-semibold justify-end">
                                                    <Lock size={16} /> Locked
                                                </div>
                                                <p className="text-[10px] text-red-300/70 mt-1">
                                                    {!isCgpaOk && `Need ${comp.minCgpa} CGPA `}
                                                    {!isBacklogOk && `(Max ${comp.maxBacklogs} Backlog)`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 2. PERFORMANCE GRAPH (Standard) */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-white mb-6">
                            <LineChartIcon size={20} className="text-purple-400" /> Analysis
                        </h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={STUDENT_HISTORY_MOCK}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="semester" stroke="#94a3b8" />
                                    <YAxis domain={[0, 10]} stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="sgpa" stroke="#a855f7" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. DETAILED SEMESTER ANALYSIS (Full Marksheet View) */}
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h3 className="text-lg font-bold text-white">Semester Wise Breakdown</h3>

                            {/* Semester Selector */}
                            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 overflow-x-auto max-w-full">
                                {[1, 2, 3, 4, 5, 6].map((sem) => (
                                    <button
                                        key={sem}
                                        onClick={() => setSelectedSem(sem)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${selectedSem === sem ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Sem {sem}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Credits & SGPA Header for Selected Sem */}
                            <div className="flex items-center gap-6 mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <div className="text-center">
                                    <p className="text-xs text-slate-400 uppercase">Registered Credits</p>
                                    <p className="text-xl font-bold text-white">{MOCK_TRANSCRIPT[selectedSem]?.credits || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-700"></div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400 uppercase">SGPA Scored</p>
                                    <p className="text-xl font-bold text-blue-400">{MOCK_TRANSCRIPT[selectedSem]?.sgpa || 'N/A'}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-700"></div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400 uppercase">Result Status</p>
                                    <p className={`text-xl font-bold ${MOCK_TRANSCRIPT[selectedSem]?.sgpa < 5 ? 'text-red-400' : 'text-green-400'}`}>
                                        {MOCK_TRANSCRIPT[selectedSem]?.subjects.some(s => s.status === 'FAIL') ? 'FAIL / BACKLOG' : 'PASS'}
                                    </p>
                                </div>
                            </div>

                            {/* Marksheet Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs text-slate-400 border-b border-slate-700">
                                            <th className="py-3 px-4 font-medium uppercase tracking-wider">Subject</th>
                                            <th className="py-3 px-4 font-medium uppercase tracking-wider text-center">Code</th>
                                            <th className="py-3 px-4 font-medium uppercase tracking-wider text-center">Credits</th>
                                            <th className="py-3 px-4 font-medium uppercase tracking-wider text-center">Internal (40)</th>
                                            <th className="py-3 px-4 font-medium uppercase tracking-wider text-center">External (60)</th>
                                            <th className="py-3 px-4 font-medium uppercase tracking-wider text-center">Total (100)</th>
                                            <th className="py-3 px-4 font-medium uppercase tracking-wider text-center">Grade</th>
                                            <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {MOCK_TRANSCRIPT[selectedSem]?.subjects.map((sub, idx) => (
                                            <tr key={idx} className={`border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition-colors ${sub.status === 'FAIL' ? 'bg-red-500/5' : ''}`}>
                                                <td className="py-3 px-4 font-medium text-white">
                                                    {sub.name}
                                                    {sub.status === 'FAIL' && <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">RE-APPEAR</span>}
                                                </td>
                                                <td className="py-3 px-4 text-slate-400 text-center font-mono text-xs">{sub.code}</td>
                                                <td className="py-3 px-4 text-slate-300 text-center">{sub.credits}</td>
                                                <td className="py-3 px-4 text-slate-300 text-center">
                                                    {sub.internal}
                                                    {/* Highlight low internal marks */}
                                                    {sub.internal < 15 && <AlertCircle size={12} className="inline ml-1 text-orange-400" />}
                                                </td>
                                                <td className="py-3 px-4 text-slate-300 text-center">{sub.external}</td>
                                                <td className="py-3 px-4 font-bold text-white text-center">{sub.total}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${sub.grade === 'F' ? 'bg-red-500/20 text-red-400' :
                                                        sub.grade.includes('A') ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'
                                                        }`}>
                                                        {sub.grade}
                                                    </span>
                                                </td>
                                                <td className={`py-3 px-4 text-right font-bold ${sub.status === 'FAIL' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {sub.status}
                                                </td>
                                            </tr>
                                        )) || (
                                                <tr>
                                                    <td colSpan="8" className="py-8 text-center text-slate-500 italic">
                                                        Detailed data for this semester is not available in demo mode.
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Footer Legend */}
                            <div className="mt-4 flex gap-4 text-xs text-slate-500 justify-end">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Low Internals (&lt;15)</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Backlog</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Calculators */}
                <div className="lg:col-span-4 space-y-6">

                    {/* THE SURVIVAL CALCULATOR */}
                    <div className="bg-gradient-to-br from-orange-500/10 to-transparent p-6 rounded-2xl border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-4 text-orange-400">
                            <AlertCircle size={20} />
                            <h3 className="font-bold">Exam Survival Calc</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Calculate min. external marks required to pass based on internals.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Your Internal Marks (Out of 40)</label>
                                <input
                                    type="number"
                                    value={internalMarks}
                                    onChange={(e) => setInternalMarks(Number(e.target.value))}
                                    max={40}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 transition-colors"
                                />
                            </div>
                            <button
                                onClick={calculateSurvival}
                                className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg font-semibold text-sm transition-all"
                            >
                                Calculate Safe Zone
                            </button>

                            {requiredExternal !== null && (
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center animate-pulse">
                                    <span className="text-slate-400 text-xs">You need</span>
                                    <div className="text-2xl font-bold text-white">{requiredExternal} <span className="text-sm font-normal text-slate-500">/ 60</span></div>
                                    <span className="text-orange-400 text-xs">to avoid Backlog</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Existing CGPA Planner */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-4 text-purple-400">
                            <Calculator size={20} />
                            <h3 className="font-bold">Dream CGPA</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">How much to score next sem?</p>
                        <div className="p-4 bg-slate-900 rounded-xl text-center border border-slate-700 border-dashed">
                            <span className="text-sm text-slate-500">Target 8.5?</span>
                            <div className="font-bold text-white mt-1">Need 9.2 SGPA next sem</div>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div >
    )
}

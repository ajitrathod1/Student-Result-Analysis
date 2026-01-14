import React, { useState } from 'react';
import { Upload, UserCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BRANCHES = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const MOCK_SUBJECT_DATA = [
    { name: 'Data Structures', pass: 45, fail: 5, avg: 72, code: 'CS301' },
    { name: 'Maths-III', pass: 28, fail: 22, avg: 45, code: 'MA301' }, // Critical Subject
    { name: 'Digital Logic', pass: 40, fail: 10, avg: 65, code: 'CS302' },
    { name: 'COA', pass: 48, fail: 2, avg: 80, code: 'CS303' },
    { name: 'Discreate Str', pass: 35, fail: 15, avg: 55, code: 'CS304' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function TeacherDashboard({ currentUser }) {
    const [branch, setBranch] = useState(currentUser?.branch || BRANCHES[0]);
    const [sem, setSem] = useState(SEMESTERS[2]); // Defaulting to Sem 3 for demo data match
    const [subjectData, setSubjectData] = useState(MOCK_SUBJECT_DATA);
    const [loading, setLoading] = useState(false);

    // Filter Logic
    const allowedSubjects = currentUser?.subjects === 'ALL'
        ? subjectData
        : subjectData.filter(s => currentUser?.subjects?.includes(s.name));

    const criticalSubjects = allowedSubjects.filter(sub => (sub.fail / (sub.pass + sub.fail)) > 0.2);

    // Handlers
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // LOGIC: We assume the uploaded file contains columns: Roll, Name, Marks
            // We process this to generate the stats: Pass, Fail, Avg
            processUploadedData(file.name, data);
            setLoading(false);
        };
        reader.readAsBinaryString(file);
    };

    const processUploadedData = (filename, data) => {
        // Simple heuristic: 
        // 1. Calculate Pass/Fail (Assuming pass queries > 35)
        // 2. Calculate Avg
        // 3. Update 'subjectData'

        // Guess subject name from filename for demo (e.g. "Maths.xlsx" -> "Maths")
        const subjectName = filename.split('.')[0];

        let passCount = 0;
        let failCount = 0;
        let totalMarks = 0;

        // Check if data has 'marks' key (case insensitive)
        const keys = Object.keys(data[0] || {});
        const marksKey = keys.find(k => k.toLowerCase().includes('mark') || k.toLowerCase().includes('score')) || keys[0];

        data.forEach(row => {
            const marks = row[marksKey];
            if (!isNaN(marks)) {
                totalMarks += Number(marks);
                if (Number(marks) >= 35) passCount++;
                else failCount++;
            }
        });

        const avg = data.length ? Math.round(totalMarks / data.length) : 0;

        const newSubjectEntry = {
            name: subjectName,
            pass: passCount,
            fail: failCount,
            avg: avg,
            code: 'NEW' + Math.floor(Math.random() * 100)
        };

        // Update state: Remove old if exists, add new
        setSubjectData(prev => {
            const filtered = prev.filter(s => s.name !== subjectName);
            return [...filtered, newSubjectEntry];
        });

        alert(`Processed ${data.length} records for ${subjectName}. Pass: ${passCount}, Fail: ${failCount}, Avg: ${avg}`);
    };

    const isHod = currentUser?.subjects === 'ALL';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Welcome, {currentUser?.name}</h2>
                    <p className="text-slate-400 text-sm mt-1">Role: <span className="text-blue-400 font-semibold">{isHod ? 'Head of Department' : 'Faculty'}</span></p>
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-wrap gap-6 items-end shadow-lg">
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Branch</label>
                    <div className="px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 min-w-[200px]">
                        {branch}
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

                {/* Upload Button */}
                <div className="flex-1 text-right">
                    <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer transition-all shadow-lg font-medium text-white ${loading ? 'bg-slate-600' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}>
                        <Upload size={18} />
                        {loading ? 'Processing...' : 'Upload Marks (Excel)'}
                        <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} disabled={loading} />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">Supports .xlsx with 'Marks' column</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <p className="text-slate-400 text-sm">Assigned Subjects</p>
                    <h3 className="text-3xl font-bold mt-1 text-white">{allowedSubjects.length}</h3>
                </div>
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
                            <p className="text-xs text-red-400/70 mt-1">{'>'}20% Failure Rate</p>
                        </div>
                    </>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Bar Chart - Subject Performance */}
                <div className="col-span-1 lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                        Subject Wise Distribution <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Pass vs Fail</span>
                    </h3>
                    <div className="h-[350px]">
                        {allowedSubjects.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={allowedSubjects} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} cursor={{ fill: '#334155', opacity: 0.2 }} />
                                    <Legend />
                                    <Bar dataKey="pass" stackId="a" fill="#10b981" name="Passed" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="fail" stackId="a" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
                        )}
                    </div>
                </div>

                {/* HOD EXTRA: Pie Chart for Department Overview */}
                {isHod && (
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-semibold mb-6 text-white">Overall Department Status</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Passed', value: allowedSubjects.reduce((a, c) => a + c.pass, 0) },
                                            { name: 'Failed', value: allowedSubjects.reduce((a, c) => a + c.fail, 0) }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-4 text-sm text-slate-400">
                            Total Students Evaluated: <span className="text-white font-bold">{allowedSubjects.reduce((a, c) => a + c.pass + c.fail, 0)}</span>
                        </div>
                    </div>
                )}

            </div>

            {/* Weak Students List (Conditionally shown if critical subjects exist) */}
            {criticalSubjects.length > 0 && isHod && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 text-red-400 mb-4">
                        <AlertTriangle />
                        <h3 className="font-bold text-lg">Attention Required: Critical Subjects</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {criticalSubjects.map(sub => (
                            <div key={sub.code} className="bg-slate-900/50 p-4 rounded-xl border border-red-500/30">
                                <div className="font-bold text-white">{sub.name}</div>
                                <div className="text-sm text-slate-400 mt-1">Faculty: {sub.code}</div> {/* In real app, map code to faculty */}
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-red-400">Failures: {sub.fail}</span>
                                    <span className="text-slate-500">Code: {sub.code}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </motion.div>
    )
}

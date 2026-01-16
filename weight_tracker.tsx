import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    TrendingDown,
    TrendingUp,
    Moon,
    Sun,
    Calendar,
    LayoutGrid,
    LineChart,
    Target,
    User,
    Scale
} from 'lucide-react';

export default function WeightTracker() {
    // 1. Initialize State from LocalStorage
    const [entries, setEntries] = useState(() => {
        const saved = localStorage.getItem('weightEntries');
        if (saved) return JSON.parse(saved);
        return [
            { date: '2026-01-14', weight: 83.1 },
            { date: '2026-01-12', weight: 83.6 },
            { date: '2026-01-10', weight: 83.1 },
            { date: '2026-01-08', weight: 83.8 },
            { date: '2026-01-05', weight: 84.0 },
            { date: '2026-01-01', weight: 84.5 },
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newWeight, setNewWeight] = useState('');

    // 2. Persist Entries
    useEffect(() => {
        localStorage.setItem('weightEntries', JSON.stringify(entries));
    }, [entries]);

    // 3. Handle Dark Mode
    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    let goals = [
        { id: 1, target: 80, label: 'GOAL 1', date: 'Feb 11', color: '#3B82F6' }, // Blue
        { id: 2, target: 77, label: 'GOAL 2', date: 'Mar 22', color: '#10B981' }  // Green
    ];

    const addEntry = () => {
        if (newDate && newWeight) {
            const weightNum = parseFloat(newWeight);
            if (!isNaN(weightNum)) {
                const newEntry = { date: newDate, weight: weightNum };
                setEntries(prev => {
                    const updated = [...prev, newEntry].sort((a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                    return updated;
                });
                setNewWeight('');
            }
        }
    };

    const deleteEntry = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const currentWeight = entries.length > 0 ? entries[0].weight : 0;

    // Calculate progress for circular indicators
    const calculateProgress = (start, current, target) => {
        const totalDiff = start - target;
        const currentDiff = start - current;
        const progress = (currentDiff / totalDiff) * 100;
        return Math.min(Math.max(progress, 0), 100);
    };

    const chartData = [...entries].slice(0, 7).reverse();

    return (
        <div className={`min-h-screen font-sans pb-24 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#F5F7FA] text-gray-800'}`}>
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-start">
                <div>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Good morning, Alex</p>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Weight Tracker</h1>
                </div>
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            <main className="px-5 space-y-5">
                {/* Current Weight Card */}
                <div className={`rounded-[2rem] p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Current Weight</p>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-[#0B1C33]'}`}>{currentWeight}</span>
                                <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} font-medium`}>kg</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold transition-colors duration-200">
                            <TrendingDown size={14} />
                            <span>-0.5kg</span>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="flex items-end justify-between h-24 gap-2">
                        {chartData.map((entry, i) => {
                            const isSelected = i === chartData.length - 1;
                            const height = Math.min(Math.max(((entry.weight - 80) / 5) * 100, 20), 100);

                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end gap-1 group">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 ${isSelected
                                            ? 'bg-blue-500'
                                            : isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
                                            }`}
                                        style={{ height: `${height}%` }}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Goals Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {goals.map((goal, index) => {
                        const progress = calculateProgress(84.1, currentWeight, goal.target);
                        const radius = 30;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDashoffset = circumference - (progress / 100) * circumference;

                        return (
                            <div key={index} className={`rounded-[2rem] p-5 flex flex-col items-center justify-center shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r={radius}
                                            stroke={isDarkMode ? '#374151' : '#F3F4F6'}
                                            strokeWidth="8"
                                            fill="transparent"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r={radius}
                                            stroke={goal.color}
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className={`absolute text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round(progress)}%</span>
                                </div>
                                <h3 className={`font-bold text-xs tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{goal.label}</h3>
                                <p className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{goal.target}kg</p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>by {goal.date}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Add New Entry */}
                <div className={`rounded-[2rem] p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Entry</h2>
                    <div className="space-y-4">
                        <div className={`flex items-center px-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-[#F8F9FB]'}`}>
                            <Calendar size={20} className="text-gray-400" />
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className={`w-full bg-transparent border-none py-4 px-3 focus:ring-0 outline-none font-medium ${isDarkMode ? 'text-white [color-scheme:dark]' : 'text-gray-700'}`}
                            />
                        </div>
                        <div className={`flex items-center px-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-[#F8F9FB]'}`}>
                            <Scale size={20} className="text-gray-400" />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Weight (kg)"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                className={`w-full bg-transparent border-none py-4 px-3 focus:ring-0 outline-none font-medium ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-700'}`}
                            />
                        </div>
                        <button
                            onClick={addEntry}
                            className="w-full bg-[#3B82F6] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                        >
                            <Plus size={20} />
                            Add Log Entry
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>History</h2>
                        <button className="text-blue-500 font-semibold text-sm">See All</button>
                    </div>

                    {entries.map((entry, index) => {
                        const dateObj = new Date(entry.date);
                        const day = dateObj.getUTCDate();
                        const month = dateObj.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();

                        const prevWeight = index < entries.length - 1 ? entries[index + 1].weight : null;
                        const change = prevWeight ? (entry.weight - prevWeight).toFixed(1) : null;
                        const isGain = change > 0;

                        return (
                            <div key={index} className={`rounded-2xl p-4 flex items-center justify-between shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`rounded-xl w-14 h-14 flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-[#F3F5F7] text-gray-600'}`}>
                                        <span className="text-[10px] font-bold tracking-wider">{month}</span>
                                        <span className={`text-lg font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{day}</span>
                                    </div>
                                    <div>
                                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{entry.weight} kg</p>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{prevWeight ? 'Recorded' : 'Initial weight'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {change && (
                                        <span className={`text-sm font-bold ${isGain ? 'text-red-400' : 'text-green-400'}`}>
                                            {isGain ? '+' : ''}{change}kg
                                        </span>
                                    )}
                                    <button
                                        onClick={() => deleteEntry(index)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-300 hover:text-red-500 hover:bg-red-50'}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className={`fixed bottom-0 left-0 right-0 border-t px-8 py-4 flex justify-between items-center pb-8 z-10 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <button className="flex flex-col items-center gap-1 text-blue-500">
                    <LayoutGrid size={24} />
                    <span className="text-[10px] font-bold">Dashboard</span>
                </button>
                <button className={`flex flex-col items-center gap-1 hover:text-gray-600 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <LineChart size={24} />
                    <span className="text-[10px] font-medium">Insights</span>
                </button>
                <button className={`flex flex-col items-center gap-1 hover:text-gray-600 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Target size={24} />
                    <span className="text-[10px] font-medium">Goals</span>
                </button>
                <button className={`flex flex-col items-center gap-1 hover:text-gray-600 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <User size={24} />
                    <span className="text-[10px] font-medium">Profile</span>
                </button>
            </nav>
        </div>
    );
}
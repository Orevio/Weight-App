import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    TrendingDown,
    TrendingUp,
    Moon,
    Calendar,
    LayoutGrid,
    LineChart,
    Target,
    User,
    Scale
} from 'lucide-react';

export default function WeightTracker() {
    const [entries, setEntries] = useState([
        { date: '2026-01-14', weight: 83.1 },
        { date: '2026-01-12', weight: 83.6 },
        { date: '2026-01-10', weight: 83.1 },
        { date: '2026-01-08', weight: 83.8 },
        { date: '2026-01-05', weight: 84.0 },
        { date: '2026-01-01', weight: 84.5 },
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Sort logic meant latest first for history display

    const [newDate, setNewDate] = useState('2026-01-14');
    const [newWeight, setNewWeight] = useState('');

    const goals = [
        { id: 1, target: 80, label: 'GOAL 1', date: 'Feb 11' },
        { id: 2, target: 77, label: 'GOAL 2', date: 'Mar 22' }
    ];

    const addEntry = () => {
        if (newDate && newWeight) {
            const weightNum = parseFloat(newWeight);
            if (!isNaN(weightNum)) {
                const newEntry = { date: newDate, weight: weightNum };
                setEntries(prev => [...prev, newEntry].sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                ));
                setNewWeight('');
            }
        }
    };

    const deleteEntry = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const currentWeight = entries.length > 0 ? entries[0].weight : 0;
    const initialWeight = entries.length > 0 ? entries[entries.length - 1].weight : 83.1;

    // Calculate progress for circular indicators
    const calculateProgress = (start, current, target) => {
        const totalDiff = start - target;
        const currentDiff = start - current;
        const progress = (currentDiff / totalDiff) * 100;
        return Math.min(Math.max(progress, 0), 100);
    };

    // Mock data for bar chart - last 7 entries reversed for chart (oldest to newest)
    const chartData = [...entries].slice(0, 7).reverse();

    return (
        <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24 text-gray-800">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Good morning, Alex</p>
                    <h1 className="text-3xl font-bold text-gray-900">Weight Tracker</h1>
                </div>
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <Moon size={20} className="text-gray-600" />
                </button>
            </header>

            <main className="px-5 space-y-5">
                {/* Current Weight Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-gray-500 mb-1">Current Weight</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-[#0B1C33]">{currentWeight}</span>
                                <span className="text-gray-400 font-medium">kg</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                            <TrendingDown size={14} />
                            <span>-0.5kg</span>
                        </div>
                    </div>

                    {/* Simple CSS Bar Chart */}
                    <div className="flex items-end justify-between h-24 gap-2">
                        {chartData.map((entry, i) => {
                            const isSelected = i === chartData.length - 1;
                            // Normalize height between 20% and 100% based on range 80-85 for visual demo
                            const height = Math.min(Math.max(((entry.weight - 80) / 5) * 100, 20), 100);

                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end gap-1 group">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 ${isSelected ? 'bg-blue-500' : 'bg-blue-100'}`}
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
                        const radius = 30; // 30px radius
                        const circumference = 2 * Math.PI * radius;
                        const strokeDashoffset = circumference - (progress / 100) * circumference;

                        return (
                            <div key={index} className="bg-white rounded-[2rem] p-5 flex flex-col items-center justify-center shadow-sm">
                                <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                                    {/* Background Circle */}
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r={radius}
                                            stroke="#F3F4F6"
                                            strokeWidth="8"
                                            fill="transparent"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r={radius}
                                            stroke="#3B82F6"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-sm font-bold">{Math.round(progress)}%</span>
                                </div>
                                <h3 className="text-gray-600 font-bold text-xs tracking-wider mb-1">{goal.label}</h3>
                                <p className="text-xl font-bold text-gray-900 mb-1">{goal.target}kg</p>
                                <p className="text-xs text-gray-400">by {goal.date}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Add New Entry */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Entry</h2>
                    <div className="space-y-4">
                        <div className="bg-[#F8F9FB] flex items-center px-4 rounded-xl">
                            <Calendar size={20} className="text-gray-400" />
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="w-full bg-transparent border-none py-4 px-3 text-gray-700 focus:ring-0 outline-none font-medium"
                            />
                        </div>
                        <div className="bg-[#F8F9FB] flex items-center px-4 rounded-xl">
                            <Scale size={20} className="text-gray-400" />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Weight (kg)"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                className="w-full bg-transparent border-none py-4 px-3 text-gray-700 focus:ring-0 outline-none font-medium"
                            />
                        </div>
                        <button
                            onClick={addEntry}
                            className="w-full bg-[#3B82F6] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <Plus size={20} />
                            Add Log Entry
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-lg font-bold text-gray-900">History</h2>
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
                            <div key={index} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#F3F5F7] rounded-xl w-14 h-14 flex flex-col items-center justify-center text-gray-600">
                                        <span className="text-[10px] font-bold tracking-wider">{month}</span>
                                        <span className="text-lg font-bold text-gray-900 leading-none">{day}</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{entry.weight} kg</p>
                                        <p className="text-xs text-gray-400">{prevWeight ? 'Recorded' : 'Initial weight'}</p>
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
                                        className="w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center pb-8 z-10">
                <button className="flex flex-col items-center gap-1 text-blue-600">
                    <LayoutGrid size={24} />
                    <span className="text-[10px] font-bold">Dashboard</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                    <LineChart size={24} />
                    <span className="text-[10px] font-medium">Insights</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                    <Target size={24} />
                    <span className="text-[10px] font-medium">Goals</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                    <User size={24} />
                    <span className="text-[10px] font-medium">Profile</span>
                </button>
            </nav>
        </div>
    );
}
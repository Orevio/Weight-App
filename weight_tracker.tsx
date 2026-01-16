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
    Scale,
    Pencil,
    X,
    ChevronDown,
    ChevronUp,
    Mic,
    Dumbbell,
    CheckCircle
} from 'lucide-react';

export default function WeightTracker() {
    // 1. Initialize State from LocalStorage
    const [entries, setEntries] = useState(() => {
        const saved = localStorage.getItem('weightEntries');
        if (saved) return JSON.parse(saved);
        return [
            { id: 1, date: '2026-01-14', weight: 83.1 },
            { id: 2, date: '2026-01-12', weight: 83.6 },
            { id: 3, date: '2026-01-10', weight: 83.1 },
            { id: 4, date: '2026-01-08', weight: 83.8 },
            { id: 5, date: '2026-01-05', weight: 84.0 },
            { id: 6, date: '2026-01-01', weight: 84.5 },
        ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);

    // Tab State: 'weight' | 'exercise' | 'standup' | 'habits'
    const [activeTab, setActiveTab] = useState('weight');

    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newWeight, setNewWeight] = useState('');
    const [weightError, setWeightError] = useState(false);
    const weightInputRef = React.useRef<HTMLInputElement>(null);

    // Goals State
    const [goals, setGoals] = useState(() => {
        const saved = localStorage.getItem('goals');
        return saved ? JSON.parse(saved) : [
            { id: 1, target: 80, label: 'GOAL 1', date: '2026-02-11', formattedDate: 'Feb 11', color: '#3B82F6' },
            { id: 2, target: 77, label: 'GOAL 2', date: '2026-03-22', formattedDate: 'Mar 22', color: '#10B981' }
        ];
    });

    const [editingGoal, setEditingGoal] = useState(null);
    const [editDateValue, setEditDateValue] = useState('');

    useEffect(() => {
        localStorage.setItem('weightEntries', JSON.stringify(entries));
    }, [entries]);

    useEffect(() => {
        localStorage.setItem('darkMode', String(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('goals', JSON.stringify(goals));
    }, [goals]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const handleEditGoal = (goal) => {
        setEditingGoal(goal);
        setEditDateValue(goal.date); // Assuming date is stored as YYYY-MM-DD
    };

    const saveGoalDate = () => {
        if (editingGoal && editDateValue) {
            setGoals(prev => prev.map(g => {
                if (g.id === editingGoal.id) {
                    const dateObj = new Date(editDateValue);
                    const formattedDetails = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return { ...g, date: editDateValue, formattedDate: formattedDetails };
                }
                return g;
            }));
            setEditingGoal(null);
        }
    };

    const calculateDaysLeft = (targetDateStr) => {
        const target = new Date(targetDateStr);
        const today = new Date();
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getTimeContext = (goal, index) => {
        const days = calculateDaysLeft(goal.date);
        if (index === 0) {
            if (days <= 0) return "Due now";
            return `${days} days left`;
        } else {
            if (days > 60) return "Later"; // approx 2 months
            if (days > 30) return "~1 month away";
            return `${days} days away`;
        }
    };

    const addEntry = () => {
        const weightNum = parseFloat(newWeight);

        // Validation: Empty or Invalid (<= 0)
        if (!newWeight || isNaN(weightNum) || weightNum <= 0) {
            setWeightError(true);
            // Focus the input
            if (weightInputRef.current) {
                weightInputRef.current.focus();
            }
            return;
        }

        // Proceed if valid
        const newEntry = { id: Date.now(), date: newDate, weight: weightNum };
        setEntries((prev: any[]) => {
            const updated = [...prev, newEntry].sort((a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            return updated;
        });
        setNewWeight('');
        setWeightError(false);
    };

    const deleteEntry = (id: any) => {
        // 1. Mark as deleting (trigger animation)
        setDeletingIds(prev => [...prev, id]);

        // 2. Wait for animation (0.7s), then remove data
        setTimeout(() => {
            setEntries(prevEntries => prevEntries.filter((entry: any) => entry.id !== id));
            setDeletingIds(prev => prev.filter(dId => dId !== id));
        }, 700);
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
                    <h1 className={`text-3xl font-bold capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activeTab === 'standup' ? 'Stand-up' : activeTab}
                    </h1>
                </div>
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            <main className="px-5 space-y-5 pb-8">
                {activeTab === 'weight' && (
                    <>
                        {/* Current Weight Card */}
                        <div className={`rounded-[2rem] p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            {/* Header: Title & Weight */}
                            <div className="mb-6">
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 text-sm font-medium`}>Current Weight</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-[#0B1C33]'}`}>{currentWeight}</span>
                                    <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} font-medium`}>kg</span>
                                </div>
                            </div>

                            {/* Mini Chart - 7 bars max, no axes, labels or interaction */}
                            <div className="flex justify-between h-14 mb-4 gap-2">
                                {chartData.map((entry, i) => {
                                    const isToday = i === chartData.length - 1;
                                    // Calculate simple relative height based on min/max of the visible set
                                    const allWeights = chartData.map(d => d.weight);
                                    const minW = Math.min(...allWeights);
                                    const maxW = Math.max(...allWeights);
                                    const range = maxW - minW || 1; // avoid divide by zero
                                    // Scale height between 20% and 100%
                                    const heightPct = 20 + ((entry.weight - minW) / range) * 80;

                                    return (
                                        <div key={i} className="flex-1 flex flex-col justify-end">
                                            <div
                                                className={`w-full rounded-sm transition-all duration-300 ${isToday
                                                    ? 'bg-blue-500' // Today: Primary Blue
                                                    : isDarkMode ? 'bg-gray-700' : 'bg-gray-300' // Past: Light Neutral (Visible)
                                                    }`}
                                                style={{ height: `${heightPct}%` }}
                                            ></div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Context Footer */}
                            <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {entries.length > 1 && (
                                    <>
                                        <span className={`font-semibold ${(entries[0].weight - entries[1].weight) <= 0
                                            ? 'text-emerald-500'
                                            : 'text-red-500'
                                            }`}>
                                            {(entries[0].weight - entries[1].weight) <= 0 ? '↓' : '↑'} {Math.abs(entries[0].weight - entries[1].weight).toFixed(1)} kg
                                        </span>
                                        <span>since last entry · {new Date(entries[1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </>
                                )}
                                {entries.length === 1 && <span>First entry recorded</span>}
                            </div>
                        </div>

                        {/* Goals Grid */}
                        <div className="flex gap-4 items-start">
                            {goals.map((goal, index) => {
                                const isPrimary = index === 0;
                                const progress = calculateProgress(84.1, currentWeight, goal.target);
                                const radius = 30;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDashoffset = circumference - (progress / 100) * circumference;

                                // Hierarchy: Ring thickness + Opacity + Font Weight
                                const strokeWidth = isPrimary ? 8 : 4;

                                // Time Context
                                const timeContext = getTimeContext(goal, index);

                                return (
                                    <div key={index} className={`relative flex-1 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-sm transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                                        }`}>
                                        {/* Ring Section */}
                                        <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="48"
                                                    cy="48"
                                                    r={radius}
                                                    stroke={isDarkMode ? '#374151' : '#F3F4F6'}
                                                    strokeWidth={strokeWidth}
                                                    fill="transparent"
                                                />
                                                <circle
                                                    cx="48"
                                                    cy="48"
                                                    r={radius}
                                                    stroke={goal.color}
                                                    strokeWidth={strokeWidth}
                                                    fill="transparent"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={strokeDashoffset}
                                                    strokeLinecap="round"
                                                    className={!isPrimary ? 'opacity-50 saturate-50' : ''}
                                                />
                                            </svg>
                                            {/* Hierarchy: Font Weight. Same size text, different weight. */}
                                            <span className={`absolute text-2xl ${isPrimary ? 'font-extrabold' : 'font-semibold'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {Math.round(progress)}%
                                            </span>
                                        </div>

                                        {/* Days Left (Below Ring) */}
                                        <span className={`text-[10px] font-medium mb-4 ${isPrimary ? 'text-blue-500' : 'text-gray-400'
                                            }`}>
                                            {timeContext}
                                        </span>

                                        {/* Goal Details */}
                                        <h3 className={`font-bold text-xs tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{goal.label}</h3>
                                        <p className={`font-bold mb-1 ${isPrimary ? 'text-2xl' : 'text-xl'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{goal.target}kg</p>

                                        {/* Edit Action - Quiet, large hit area */}
                                        <button
                                            onClick={() => handleEditGoal(goal)}
                                            className={`flex items-center gap-1 text-xs p-2 -m-2 opacity-50 hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                                        >
                                            <span>by {goal.formattedDate}</span>
                                            <Pencil size={10} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Edit Goal Modal */}
                        {editingGoal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                                <div className={`w-full max-w-sm rounded-[2rem] p-6 shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} animate-in slide-in-from-bottom duration-300`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit {editingGoal.label} Date</h3>
                                        <button onClick={() => setEditingGoal(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <X size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Target Date</label>
                                            <div className={`flex items-center px-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-[#F8F9FB]'}`}>
                                                <Calendar size={20} className="text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={editDateValue}
                                                    onChange={(e) => setEditDateValue(e.target.value)}
                                                    className={`w-full bg-transparent border-none py-4 px-3 focus:ring-0 outline-none font-medium ${isDarkMode ? 'text-white [color-scheme:dark]' : 'text-gray-700'}`}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={saveGoalDate}
                                            className="w-full bg-[#3B82F6] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                                        >
                                            Update Date
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                <div className={`flex items-center px-4 rounded-xl transition-all duration-200 border-2 ${weightError
                                        ? (isDarkMode ? 'bg-red-900/20 border-red-500/50' : 'bg-[#FFF5F5] border-red-200')
                                        : (isDarkMode ? 'bg-gray-700 border-transparent' : 'bg-[#F8F9FB] border-transparent')
                                    }`}>
                                    <Scale size={20} className={weightError ? "text-red-400" : "text-gray-400"} />
                                    <input
                                        ref={weightInputRef}
                                        type="number"
                                        step="0.1"
                                        placeholder="Weight (kg)"
                                        value={newWeight}
                                        onChange={(e) => {
                                            setNewWeight(e.target.value);
                                            if (weightError) setWeightError(false);
                                        }}
                                        className={`w-full bg-transparent border-none py-4 px-3 focus:ring-0 outline-none font-medium ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-700'
                                            }`}
                                    />
                                </div>
                                {weightError && (
                                    <p className="text-xs text-red-500 font-medium px-2 animate-in fade-in slide-in-from-top-1">
                                        Please enter your weight first
                                    </p>
                                )}
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
                            <div
                                className="flex justify-between items-center px-2 py-2 -mx-2 cursor-pointer transition-colors"
                                onClick={() => entries.length > 3 && setIsHistoryExpanded(!isHistoryExpanded)}
                            >
                                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>History</h2>
                                {entries.length > 3 && (
                                    <div className="flex items-center gap-1 text-blue-500 font-semibold text-sm">
                                        <span>{isHistoryExpanded ? 'Show less' : 'Show more'}</span>
                                        {isHistoryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                )}
                            </div>

                            <div className="relative space-y-4 transition-all duration-300 ease-out">
                                {(isHistoryExpanded ? entries : entries.slice(0, 3)).map((entry, index) => {
                                    const dateObj = new Date(entry.date);
                                    const day = dateObj.getUTCDate();
                                    const month = dateObj.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();

                                    // Calculate logic for display
                                    const prevWeight = index < entries.length - 1 ? entries[index + 1].weight : null;
                                    const weightDiff = prevWeight ? (entry.weight - prevWeight) : 0;
                                    const changeStr = prevWeight ? Math.abs(weightDiff).toFixed(1) : null;
                                    const isGain = weightDiff > 0;

                                    const isDeleting = deletingIds.includes(entry.id);

                                    return (
                                        <div
                                            key={entry.id}
                                            className={`rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all duration-700 ease-out transform ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                                                } ${isDeleting ? 'opacity-0 translate-x-12 scale-95' : 'opacity-100 translate-x-0 scale-100'
                                                }`}
                                        >
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
                                                {changeStr && (
                                                    <span className={`text-sm font-bold ${isGain ? 'text-red-400' : 'text-green-400'}`}>
                                                        {isGain ? '+' : '-'}{changeStr}kg
                                                    </span>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteEntry(entry.id);
                                                    }}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-300 hover:text-red-500 hover:bg-red-50'}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Fade Mask (Only in collapsed state and if more entries exist) */}
                                {!isHistoryExpanded && entries.length > 3 && (
                                    <div className={`absolute bottom-0 left-0 right-0 h-24 pointer-events-none bg-gradient-to-t ${isDarkMode ? 'from-gray-900' : 'from-[#F5F7FA]'
                                        } to-transparent`} />
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab !== 'weight' && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tracking coming soon
                        </p>
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className={`fixed bottom-0 left-0 right-0 border-t px-8 py-4 flex justify-between items-center pb-8 z-10 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                {/* Weight Tab */}
                <button
                    onClick={() => setActiveTab('weight')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'weight' ? 'text-blue-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}
                >
                    <Scale size={24} strokeWidth={activeTab === 'weight' ? 2.5 : 2} />
                    <span className={`text-[10px] ${activeTab === 'weight' ? 'font-bold' : 'font-medium'}`}>Weight</span>
                </button>

                {/* Exercise Tab */}
                <button
                    onClick={() => setActiveTab('exercise')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'exercise' ? 'text-blue-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}
                >
                    <Dumbbell size={24} strokeWidth={activeTab === 'exercise' ? 2.5 : 2} />
                    <span className={`text-[10px] ${activeTab === 'exercise' ? 'font-bold' : 'font-medium'}`}>Exercise</span>
                </button>

                {/* Stand-up Tab */}
                <button
                    onClick={() => setActiveTab('standup')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'standup' ? 'text-blue-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}
                >
                    <Mic size={24} strokeWidth={activeTab === 'standup' ? 2.5 : 2} />
                    <span className={`text-[10px] ${activeTab === 'standup' ? 'font-bold' : 'font-medium'}`}>Stand-up</span>
                </button>

                {/* Habits Tab */}
                <button
                    onClick={() => setActiveTab('habits')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'habits' ? 'text-blue-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}
                >
                    <CheckCircle size={24} strokeWidth={activeTab === 'habits' ? 2.5 : 2} />
                    <span className={`text-[10px] ${activeTab === 'habits' ? 'font-bold' : 'font-medium'}`}>Habits</span>
                </button>
            </nav>
        </div>
    );
}
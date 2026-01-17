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
    CheckCircle,
    ArrowRight
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
    const tabs = ['weight', 'exercise', 'standup', 'habits'];

    // Swipe Navigation State
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Swipe Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStart) return;
        const currentX = e.targetTouches[0].clientX;
        const diff = currentX - touchStart;

        // Resistance at edges
        const currentIndex = tabs.indexOf(activeTab);
        const isFirst = currentIndex === 0 && diff > 0;
        const isLast = currentIndex === tabs.length - 1 && diff < 0;

        if (isFirst || isLast) {
            setDragOffset(diff * 0.4); // Rubber banding
        } else {
            setDragOffset(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        const currentIndex = tabs.indexOf(activeTab);
        const threshold = window.innerWidth * 0.25; // 25% width threshold

        if (Math.abs(dragOffset) > threshold) {
            if (dragOffset > 0 && currentIndex > 0) {
                // Swipe Right -> Prev
                setActiveTab(tabs[currentIndex - 1]);
            } else if (dragOffset < 0 && currentIndex < tabs.length - 1) {
                // Swipe Left -> Next
                setActiveTab(tabs[currentIndex + 1]);
            }
        }

        // Reset offset (will animate back to 0 due to CSS transition)
        setTouchStart(null);
        setDragOffset(0);
    };

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
    const [editWeightValue, setEditWeightValue] = useState('');
    const [deletionTargetId, setDeletionTargetId] = useState<number | null>(null); // ID of goal in "Edit Mode"
    const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null); // ID of goal currently animating out
    const longPressTimerRef = React.useRef<any>(null);

    // Initial active goal limit (for dots)
    const [scrollIndex, setScrollIndex] = useState(0);

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
        setEditWeightValue(goal.target);
    };

    const saveGoal = () => {
        if (editingGoal && editDateValue && editWeightValue) {
            setGoals(prev => prev.map(g => {
                if (g.id === editingGoal.id) {
                    const dateObj = new Date(editDateValue);
                    const formattedDetails = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return {
                        ...g,
                        date: editDateValue,
                        formattedDate: formattedDetails,
                        target: parseFloat(editWeightValue)
                    };
                }
                return g;
            }));
            setEditingGoal(null);
        }
    };

    const removeGoal = (id) => {
        // 1. Animate out
        setDeletingGoalId(id);
        setDeletionTargetId(null); // Stop wiggling immediately

        // 2. Actually remove after animation
        setTimeout(() => {
            setGoals(prev => prev.filter(g => g.id !== id));
            setDeletingGoalId(null);
        }, 250);
    };

    const startLongPress = (id) => {
        longPressTimerRef.current = setTimeout(() => {
            setDeletionTargetId(id);
            // Optional: Vibrate
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const endLongPress = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    // Cancel long press if user moves finger (scroll intent)
    const handleGoalTouchMove = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    // Clear selection on background click (handled in main usually, or just card blur?)
    // We'll rely on clicking non-X areas or specialized "Done" if needed, 
    // but the spec says "User taps outside any card". 
    // We'll add a listener to the container.

    const calculateDaysLeft = (targetDateStr) => {
        const target = new Date(targetDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to midnight

        // Target is usually UTC midnight from input type="date" string (YYYY-MM-DD) which parses as UTC.
        // But let's check parsing behavior. 
        // new Date('2026-02-11') -> 2026-02-11T00:00:00.000Z.
        // today -> Local Time.
        // Valid comparison requires unifying.
        // Simple hack: Set target to local midnight of that date if possible, or just work with UTC.
        // Actually, let's treat targetDateStr as local date parts.
        const [y, m, d] = targetDateStr.split('-').map(Number);
        const targetLocal = new Date(y, m - 1, d); // Local midnight

        const diffTime = targetLocal.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getTimeContext = (goal) => {
        if (!goal.date) return "Date not set";
        const days = calculateDaysLeft(goal.date);

        if (days < 0) return "Overdue";
        if (days === 0) return "Due today";
        if (days <= 30) return `${days} days left`;
        if (days <= 60) return "~1 month left";
        if (days <= 90) return "~2 months left";
        return "Later";
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

            <main
                className="overflow-hidden min-h-[80vh] relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex w-[400%] h-full"
                    style={{
                        transform: `translateX(calc(-${tabs.indexOf(activeTab) * 25}% + ${dragOffset}px))`,
                        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                >
                    {/* Weight Tab Content */}
                    <div className="w-[25%] px-5 space-y-5 pb-8">

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

                            {/* Context Footer: Journey Bar */}
                            <div className="mt-6">
                                {entries.length > 0 && goals.length > 0 && (() => {
                                    // 1. Define Journey Points
                                    // Start: Oldest entry (or explicit start?) - Using oldest recorded entry for now
                                    const startWeight = entries[entries.length - 1].weight;
                                    const current = entries[0].weight;

                                    // Farthest Goal (The End of the Line) - assumed to be the lowest target
                                    const sortedGoals = [...goals].sort((a, b) => b.target - a.target); // Descending target
                                    const farthestGoal = sortedGoals[sortedGoals.length - 1]; // Lowest weight
                                    const endWeight = farthestGoal.target;

                                    // 2. Journey Math
                                    // Total range = Start - End
                                    const totalRange = startWeight - endWeight;
                                    // Ensure range is positive and non-zero to avoid bugs
                                    if (totalRange <= 0) return null;

                                    // Current Progress
                                    const weightLost = startWeight - current;
                                    const progressPct = Math.min(Math.max((weightLost / totalRange) * 100, 0), 100);

                                    return (
                                        <div className="flex flex-col gap-3">
                                            {/* Journey Track Container */}
                                            <div className="relative h-1.5 w-full bg-[#F3F4F6] dark:bg-gray-800 rounded-full flex items-center mt-3 mb-1">

                                                {/* Blue Progress Fill */}
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-blue-500 rounded-full z-10 transition-all duration-700 ease-out"
                                                    style={{ width: `${progressPct}%` }}
                                                ></div>

                                                {/* Goal Markers (Layer 2) */}
                                                {goals.map((goal, idx) => {
                                                    // Calculate relative position
                                                    const goalDist = startWeight - goal.target;
                                                    const goalPct = Math.min(Math.max((goalDist / totalRange) * 100, 0), 100);
                                                    const isPassed = current <= goal.target;

                                                    return (
                                                        <div
                                                            key={goal.id}
                                                            className={`absolute w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 transform -translate-x-1/2 z-20 transition-colors duration-300 shadow-sm ${isPassed
                                                                ? 'bg-blue-500' // Completed: Blue 
                                                                : 'bg-gray-400 dark:bg-gray-500' // Future: Visible Mid-Gray
                                                                }`}
                                                            style={{ left: `${goalPct}%` }}
                                                        ></div>
                                                    );
                                                })}

                                                {/* Current Position Indicator (Layer 3 - Top) */}
                                                <div
                                                    className="absolute h-4 w-1.5 bg-blue-600 rounded-full shadow-md z-30 transform -translate-x-1/2 transition-all duration-700 ease-out border border-white dark:border-gray-800"
                                                    style={{ left: `${progressPct}%` }}
                                                ></div>
                                            </div>

                                            {/* Simple Text Support */}
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <span className="text-emerald-500">
                                                    ↓ {Math.abs(weightLost).toFixed(1)} kg
                                                </span>
                                                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    · On track
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {entries.length === 1 && goals.length === 0 && (
                                    <div className="flex flex-col gap-3 mt-6">
                                        <div className="relative h-1.5 w-full bg-[#E5E7EB] dark:bg-gray-700 rounded-full"></div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Set a goal to see your journey</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Goals Grid */}
                        <div className="flex gap-4 items-start">
                            {(() => {
                                // Filter Logic: Active vs Completed
                                const activeGoals = goals
                                    .filter(g => currentWeight > g.target)
                                    .sort((a, b) => {
                                        // 1. Invalid/Missing Date Check -> Push to end
                                        if (!a.date) return 1;
                                        if (!b.date) return -1;

                                        const timeA = new Date(a.date).getTime();
                                        const timeB = new Date(b.date).getTime();

                                        if (isNaN(timeA)) return 1;
                                        if (isNaN(timeB)) return -1;

                                        // 2. Primary: Chronological (Earliest First)
                                        if (timeA !== timeB) return timeA - timeB;

                                        // 3. Secondary: Target Weight Descending (Smaller Delta from current comes first)
                                        // Assuming current weight is higher than targets.
                                        // A: 80kg, B: 75kg. Current: 85kg. 
                                        // Delta A = 5, Delta B = 10. 
                                        // User wants smaller delta first -> A first.
                                        // So descending target weight.
                                        return b.target - a.target;
                                    });

                                // Empty State
                                if (activeGoals.length === 0) {
                                    return (
                                        <div className={`flex-1 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-sm transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                            <div className="w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                <Target size={32} className="text-gray-400" />
                                            </div>
                                            <p className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No active goal</p>
                                            <button
                                                onClick={() => {
                                                    // Create a new goal template
                                                    const newGoal = {
                                                        id: Date.now(),
                                                        target: currentWeight - 5, // Default suggestion
                                                        label: `GOAL ${goals.length + 1}`, // Sequential label based on total history
                                                        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
                                                        formattedDate: 'Next Month',
                                                        color: '#3B82F6'
                                                    };
                                                    // Open modal for this "new" goal
                                                    handleEditGoal(newGoal);
                                                    // We don't save yet, just open modal. 
                                                    // But logic needs to know it's a "create" action.
                                                    // For now, let's treat it as editing a template that gets added on save.
                                                    // Actually, current save logic updates existing ID.
                                                    // We need to modify save logic to handle "New" vs "Update".
                                                    // Simplification: We'll add it to goals immediately then edit? 
                                                    // Better: Set a flag. But for now, let's just use the existing "Add" logic we had for the "+" button maybe?
                                                    // Actually, I'll create a temporary goal object and append it, relying on user to edit valid fields.
                                                    setGoals([...goals, newGoal]);
                                                    setTimeout(() => handleEditGoal(newGoal), 0); // Hack to edit after state update
                                                }}
                                                className="text-blue-500 font-bold hover:text-blue-600 flex items-center gap-1"
                                            >
                                                Set your next weight goal <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    );
                                }

                                // Active Goals List
                                return (
                                    <div
                                        className="w-full flex flex-col gap-4"
                                        onClick={() => setDeletionTargetId(null)} // Click outside to exit edit
                                    >
                                        <div
                                            className={`w-full flex ${activeGoals.length > 1 ? 'overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-4' : ''} no-scrollbar`}
                                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                            onScroll={(e) => {
                                                // Exit edit mode on scroll
                                                if (deletionTargetId !== null) setDeletionTargetId(null);

                                                const index = Math.round(e.currentTarget.scrollLeft / (e.currentTarget.offsetWidth * 0.8)); // Approx 
                                                setScrollIndex(index);
                                            }}
                                        >
                                            {/* Inject Styling for Wiggle */}
                                            <style>{`
                                                @keyframes wiggle {
                                                    0% { transform: rotate(0deg); }
                                                    25% { transform: rotate(-1.5deg); }
                                                    50% { transform: rotate(0deg); }
                                                    75% { transform: rotate(1.5deg); }
                                                    100% { transform: rotate(0deg); }
                                                }
                                                .wiggle { animation: wiggle 0.15s ease-in-out infinite; }
                                            `}</style>

                                            {activeGoals.slice(0, 4).map((goal, index) => {
                                                const isPrimary = index === 0;
                                                const progress = calculateProgress(84.1, currentWeight, goal.target);
                                                const radius = 30;
                                                const circumference = 2 * Math.PI * radius;
                                                const strokeDashoffset = circumference - (progress / 100) * circumference;

                                                // Hierarchy
                                                const strokeWidth = isPrimary ? 8 : 4;
                                                const timeContext = getTimeContext(goal);

                                                // Interaction States
                                                const isSelected = deletionTargetId === goal.id;
                                                const isDeleting = deletingGoalId === goal.id;
                                                const isAnySelected = deletionTargetId !== null;
                                                const isDimmed = isAnySelected && !isSelected;

                                                // Layout: 1 goal = 100%, 2+ = 85%
                                                const widthClass = activeGoals.length > 1 ? 'min-w-[85%] snap-center' : 'w-full';

                                                return (
                                                    <div
                                                        key={goal.id}
                                                        className={`relative ${widthClass} rounded-[2rem] p-6 flex flex-col items-center justify-center transition-all duration-300 transform
                                                            ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                                                            ${isSelected ? 'shadow-2xl scale-[1.02] z-20 wiggle' : 'shadow-sm z-10'}
                                                            ${isDimmed ? 'opacity-50 scale-95 blur-[1px]' : 'opacity-100'}
                                                            ${isDeleting ? 'opacity-0 translate-y-4' : ''}
                                                        `}
                                                        onTouchStart={() => startLongPress(goal.id)}
                                                        onTouchEnd={endLongPress}
                                                        onTouchMove={handleGoalTouchMove}
                                                        onMouseDown={() => startLongPress(goal.id)}
                                                        onMouseUp={endLongPress}
                                                        onMouseLeave={endLongPress}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Handle click locally
                                                            if (isSelected) {
                                                                // Tapping the selected card (not X) -> Undo/Exit
                                                                setDeletionTargetId(null);
                                                            } else if (isAnySelected) {
                                                                // Tapping another card while one is selected -> Undo/Exit (don't select new one yet)
                                                                setDeletionTargetId(null);
                                                            } else {
                                                                // Normal state -> Edit Action
                                                                handleEditGoal(goal);
                                                            }
                                                        }}
                                                    >
                                                        {/* Delete Button (Surgical) - Always rendered for transition */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeGoal(goal.id);
                                                            }}
                                                            className={`absolute -top-1 -right-1 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all duration-200 
                                                                ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
                                                            `}
                                                            aria-label="Delete goal"
                                                        >
                                                            <X size={18} strokeWidth={3} />
                                                        </button>

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
                                                            <span className={`absolute text-2xl ${isPrimary ? 'font-extrabold' : 'font-semibold'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {Math.round(progress)}%
                                                            </span>
                                                        </div>

                                                        {/* Days Left */}
                                                        <span className={`text-[10px] font-medium mb-4 ${isPrimary ? 'text-blue-500' : 'text-gray-400'}`}>
                                                            {timeContext}
                                                        </span>

                                                        {/* Goal Details */}
                                                        <h3 className={`font-bold text-xs tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{goal.label}</h3>
                                                        <p className={`font-bold mb-1 ${isPrimary ? 'text-2xl' : 'text-xl'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{goal.target}kg</p>

                                                        {/* Edit Action */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isSelected) handleEditGoal(goal);
                                                            }}
                                                            className={`flex items-center gap-1 text-xs p-2 -m-2 opacity-50 hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ${isSelected ? 'invisible' : ''}`}
                                                        >
                                                            <span>by {goal.formattedDate}</span>
                                                            <Pencil size={10} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Carousel Indicators */}
                                        {activeGoals.length > 1 && (
                                            <div className="flex justify-center gap-2">
                                                {activeGoals.slice(0, 4).map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === 0 ? 'w-4 bg-blue-500' : 'w-1.5 bg-gray-300 dark:bg-gray-700'}`} // Simplified active logic: Highlight first for now
                                                    ></div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
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


                    </div>

                    {/* Placeholder Tabs */}
                    {['Exercise', 'Stand-up', 'Habits'].map((tabName) => (
                        <div key={tabName} className="w-[25%] px-5 flex flex-col items-center justify-center opacity-50 space-y-4">
                            <div className={`p-6 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                {tabName === 'Exercise' && <Dumbbell size={48} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />}
                                {tabName === 'Stand-up' && <Mic size={48} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />}
                                {tabName === 'Habits' && <CheckCircle size={48} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />}
                            </div>
                            <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                {tabName} Tracking
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-700' : 'text-gray-500'}`}>Coming Soon</p>
                        </div>
                    ))}
                </div>
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
                    onClick={() => setActiveTab('habits')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'habits' ? 'text-blue-500' : (isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600')}`}
                >
                    <CheckCircle size={24} strokeWidth={activeTab === 'habits' ? 2.5 : 2} />
                    <span className={`text-[10px] ${activeTab === 'habits' ? 'font-bold' : 'font-medium'}`}>Habits</span>
                </button>
            </nav>

            {/* Edit Goal Modal */}
            {editingGoal && (() => {
                return (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                        <div className={`w-full max-w-sm rounded-[2rem] p-6 shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} animate-in slide-in-from-bottom duration-300`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {editingGoal.id > 1000 ? 'Set New Goal' : `Edit ${editingGoal.label}`}
                                </h3>
                                <button onClick={() => setEditingGoal(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <X size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Target Weight Input */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Target Weight</label>
                                    <div className={`flex items-center px-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-[#F8F9FB]'}`}>
                                        <Target size={20} className="text-gray-400" />
                                        <input
                                            type="number"
                                            value={editWeightValue}
                                            onChange={(e) => setEditWeightValue(e.target.value)}
                                            placeholder="Target Weight"
                                            className={`w-full bg-transparent border-none py-4 px-3 focus:ring-0 outline-none font-medium ${isDarkMode ? 'text-white [color-scheme:dark]' : 'text-gray-700'}`}
                                        />
                                        <span className="text-gray-400 text-sm font-medium">kg</span>
                                    </div>
                                </div>

                                {/* Target Date Input */}
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
                                    onClick={saveGoal}
                                    className="w-full bg-[#3B82F6] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Update Goal
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}
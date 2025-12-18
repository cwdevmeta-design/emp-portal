import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarWidget = ({ selectedDate, onDateChange, highlights = {} }) => {
    // highlights: { '2024-05-01': 'bg-green-100 text-green-800' }

    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));

    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(new Date(selectedDate));
        }
    }, [selectedDate]);

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const handleDateClick = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onDateChange(dateStr);
    };

    const days = [];
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Days for current month
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isSelected = selectedDate === dateStr;
        const highlightClass = highlights[dateStr] || '';

        days.push(
            <button
                key={d}
                onClick={() => handleDateClick(d)}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
                    ${isSelected ? 'bg-primary text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'}
                    ${!isSelected && highlightClass ? highlightClass : ''}
                `}
            >
                {d}
            </button>
        );
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-xs mx-auto">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-semibold text-dark">
                    {monthNames[month]} {year}
                </div>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-xs font-bold text-gray-400 w-8">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 place-items-center">
                {days}
            </div>
        </div>
    );
};

export default CalendarWidget;

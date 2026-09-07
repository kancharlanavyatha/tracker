import React, { useState } from "react";
import type { Phase } from "../api";

interface CycleCalendarProps {
  phase: Phase | null;
  recentPeriods?: string[];
  onSelectDate?: (dateStr: string) => void;
}

export const CycleCalendar: React.FC<CycleCalendarProps> = ({
  phase,
  recentPeriods = [],
  onSelectDate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Adjust starting day to Monday (0 = Mon, 6 = Sun)
  const startOffset = (firstDayOfMonth + 6) % 7;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  // Calendar cells
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarCells.push({
      day: dayNum,
      isCurrentMonth: false,
      dateStr: "",
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${year}-${mm}-${dd}`;
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr,
    });
  }

  // 3. Next month leading days
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      dateStr: "",
    });
  }

  return (
    <div className="cycle-calendar-card">
      <div className="calendar-header">
        <button type="button" className="ghost calendar-nav-btn" onClick={prevMonth}>
          ‹
        </button>
        <h3>{monthNames[month]} {year}</h3>
        <button type="button" className="ghost calendar-nav-btn" onClick={nextMonth}>
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="weekday-label">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div key={idx} className="calendar-day muted-day">
                {cell.day}
              </div>
            );
          }

          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDay;
          const isPeriodDay = recentPeriods.includes(cell.dateStr);

          return (
            <button
              key={idx}
              type="button"
              className={`calendar-day current-month-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${isPeriodDay ? "period-day" : ""}`}
              onClick={() => {
                setSelectedDay(cell.dateStr);
                if (onSelectDate) onSelectDate(cell.dateStr);
              }}
            >
              <span className="day-number">{cell.day}</span>
              {isPeriodDay && <span className="period-dot" title="Period Logged" />}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-indicator period-indicator" />
          <span>Period Flow</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator follicular-indicator" />
          <span>Follicular</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator fertile-indicator" />
          <span>Ovulation Window</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator luteal-indicator" />
          <span>Luteal</span>
        </div>
      </div>

      {selectedDay && (
        <div className="calendar-selected-info">
          <p>
            Selected: <strong>{selectedDay}</strong> {selectedDay === todayStr ? "(Today)" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

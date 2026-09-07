import React, { useState } from 'react';
import type { CalendarReminder, Phase } from '../api';

interface CycleCalendarProps {
  phase: Phase | null;
  recentPeriods?: string[];
  reminders?: CalendarReminder[];
  onSelectDate?: (dateStr: string) => void;
  onLogForDate?: (dateStr: string) => void;
  onAddReminder?: (dateStr: string, title: string, category: string) => Promise<void> | void;
  onToggleReminder?: (reminderId: string) => Promise<void> | void;
  onDeleteReminder?: (reminderId: string) => Promise<void> | void;
}

export const CycleCalendar: React.FC<CycleCalendarProps> = ({
  phase,
  recentPeriods = [],
  reminders = [],
  onSelectDate,
  onLogForDate,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(() => new Date().toISOString().slice(0, 10));
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderCategory, setReminderCategory] = useState('wellness');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDayOfMonth + 6) % 7; // Monday = 0

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayStr = new Date().toISOString().slice(0, 10);

  // Group reminders by date
  const remindersByDate = React.useMemo(() => {
    const map: Record<string, CalendarReminder[]> = {};
    for (const r of reminders) {
      if (!map[r.reminder_date]) map[r.reminder_date] = [];
      map[r.reminder_date].push(r);
    }
    return map;
  }, [reminders]);

  const calendarCells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, isCurrentMonth: false, dateStr: '' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    calendarCells.push({ day: d, isCurrentMonth: true, dateStr: `${year}-${mm}-${dd}` });
  }
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({ day: i, isCurrentMonth: false, dateStr: '' });
  }

  // Calculate upcoming period countdown estimate
  const daysUntilPeriod = phase?.cycle_length_assumed && phase?.day_in_cycle
    ? Math.max(0, phase.cycle_length_assumed - phase.day_in_cycle)
    : 14;

  const selectedDayReminders = selectedDay ? remindersByDate[selectedDay] || [] : [];

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !reminderTitle.trim()) return;
    if (onAddReminder) {
      await onAddReminder(selectedDay, reminderTitle.trim(), reminderCategory);
      setReminderTitle('');
      setIsAddingReminder(false);
    }
  };

  return (
    <div className='cycle-calendar-card' style={{ position: 'relative' }}>
      {/* Smart Cycle Countdown Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1px solid rgba(244, 114, 182, 0.25)',
          borderRadius: '16px',
          padding: '12px 18px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🌸</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
              Next Period in ~{daysUntilPeriod} days
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              Currently in Day {phase?.day_in_cycle ?? 1} · {phase?.phase ?? 'Follicular'} Phase
            </div>
          </div>
        </div>
        <div
          style={{
            background: 'var(--panel)',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--accent)',
            border: '1px solid var(--border)',
          }}
        >
          ✨ {reminders.length} Active Reminders Set
        </div>
      </div>

      {/* Month Navigation */}
      <div className='calendar-header'>
        <button type='button' className='ghost calendar-nav-btn' onClick={prevMonth}>
          ‹
        </button>
        <h3>{monthNames[month]} {year}</h3>
        <button type='button' className='ghost calendar-nav-btn' onClick={nextMonth}>
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className='calendar-weekdays'>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className='weekday-label'>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className='calendar-grid'>
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <div key={idx} className='calendar-day muted-day'>{cell.day}</div>;
          }

          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDay;
          const isPeriodDay = recentPeriods.includes(cell.dateStr);
          const dayReminders = remindersByDate[cell.dateStr] || [];
          const hasReminders = dayReminders.length > 0;

          return (
            <button
              key={idx}
              type='button'
              className={`calendar-day current-month-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPeriodDay ? 'period-day' : ''}`}
              onClick={() => {
                setSelectedDay(cell.dateStr);
                if (onSelectDate) onSelectDate(cell.dateStr);
              }}
              style={{ position: 'relative' }}
            >
              <span className='day-number'>{cell.day}</span>
              {isPeriodDay && <span className='period-dot' title='Period Flow Logged' />}
              {hasReminders && (
                <span
                  title={`${dayReminders.length} reminder(s)`}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#ec4899',
                    boxShadow: '0 0 4px #ec4899',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className='calendar-legend'>
        <div className='legend-item'>
          <span className='legend-indicator period-indicator' />
          <span>Period Flow</span>
        </div>
        <div className='legend-item'>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899', display: 'inline-block' }} />
          <span>Custom Reminder</span>
        </div>
        <div className='legend-item'>
          <span className='legend-indicator follicular-indicator' />
          <span>Follicular Phase</span>
        </div>
        <div className='legend-item'>
          <span className='legend-indicator fertile-indicator' />
          <span>Fertile Window</span>
        </div>
        <div className='legend-item'>
          <span className='legend-indicator luteal-indicator' />
          <span>Luteal Phase</span>
        </div>
      </div>

      {/* Selected Day Reminders & Actions Drawer */}
      {selectedDay && (
        <div
          style={{
            background: 'var(--panel)',
            padding: '16px 20px',
            borderRadius: '18px',
            border: '1px solid var(--border)',
            marginTop: '18px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Selected Day & Reminders
              </span>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginTop: '2px' }}>
                📅 {selectedDay} {selectedDay === todayStr ? '· Today' : ''}
                {recentPeriods.includes(selectedDay) ? ' · 🩸 Period Logged' : ''}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type='button'
                className='ghost'
                style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: '999px', border: '1px solid var(--border)' }}
                onClick={() => setIsAddingReminder(!isAddingReminder)}
              >
                {isAddingReminder ? 'Cancel' : '+ Add Reminder'}
              </button>
              {onLogForDate && (
                <button
                  type='button'
                  className='primary'
                  style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: '999px' }}
                  onClick={() => onLogForDate(selectedDay)}
                >
                  ✎ Log Symptoms
                </button>
              )}
            </div>
          </div>

          {/* Inline Add Reminder Form */}
          {isAddingReminder && (
            <form onSubmit={handleCreateReminder} style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type='text'
                placeholder='e.g., Take evening primrose oil, PMS warning, Gym HIIT...'
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
              <select
                value={reminderCategory}
                onChange={(e) => setReminderCategory(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '0.86rem',
                }}
              >
                <option value='wellness'>🌿 Wellness</option>
                <option value='period'>🩸 Period Care</option>
                <option value='workout'>💪 Workout</option>
                <option value='nutrition'>🥗 Nutrition</option>
                <option value='general'>📌 Note</option>
              </select>
              <button
                type='submit'
                className='primary'
                style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '10px' }}
              >
                Save
              </button>
            </form>
          )}

          {/* List of Reminders for Selected Day */}
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedDayReminders.length === 0 ? (
              <div style={{ fontSize: '0.84rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                No reminders set for this day. Click &ldquo;+ Add Reminder&rdquo; to schedule a notification or body note.
              </div>
            ) : (
              selectedDayReminders.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: r.is_completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                    <input
                      type='checkbox'
                      checked={r.is_completed}
                      onChange={() => onToggleReminder && onToggleReminder(r.id)}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <span
                      style={{
                        fontSize: '0.88rem',
                        color: r.is_completed ? 'var(--muted)' : 'var(--text)',
                        textDecoration: r.is_completed ? 'line-through' : 'none',
                        fontWeight: 500,
                      }}
                    >
                      {r.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: 'rgba(244, 114, 182, 0.15)',
                        color: '#f472b6',
                        textTransform: 'capitalize',
                      }}
                    >
                      {r.category}
                    </span>
                  </label>
                  {onDeleteReminder && (
                    <button
                      type='button'
                      onClick={() => onDeleteReminder(r.id)}
                      title='Delete reminder'
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        fontSize: '0.85rem',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

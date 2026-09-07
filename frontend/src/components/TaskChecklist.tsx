import React, { useState, useEffect } from 'react';

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

const DEFAULT_TASKS: TaskItem[] = [
  { id: 't1', text: 'Drink 2.5L water & electrolytes', completed: true, category: 'hydration' },
  { id: 't2', text: '15 min gentle morning mobility or yoga', completed: true, category: 'movement' },
  { id: 't3', text: 'Take Magnesium & Iron supplement', completed: false, category: 'wellness' },
  { id: 't4', text: 'Log today’s mood & body symptoms', completed: true, category: 'log' },
  { id: 't5', text: 'Screen curfew 30 min before sleep', completed: false, category: 'sleep' },
];

const STORAGE_KEY = 'mh_daily_wellness_tasks';

interface Props {
  onTaskToggle?: () => void;
}

export const TaskChecklist: React.FC<Props> = ({ onTaskToggle }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_TASKS;
      }
    }
    return DEFAULT_TASKS;
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    if (onTaskToggle) onTaskToggle();
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      text: newTaskText.trim(),
      completed: false,
      category: 'custom',
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText('');
    setIsAdding(false);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div
      style={{
        background: 'var(--panel)',
        borderRadius: '20px',
        padding: '1.25rem',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
            Daily Body & Mind Habits ✨
          </h4>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>
            {completedCount} of {tasks.length} habits completed today ({progressPct}%)
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            background: 'rgba(244, 114, 182, 0.15)',
            color: '#f472b6',
            border: '1px solid rgba(244, 114, 182, 0.3)',
            padding: '0.4rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isAdding ? 'Cancel' : '+ Add Habit'}
        </button>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
            borderRadius: '999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={addTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="e.g., Drink raspberry leaf tea, 20 min walk..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              padding: '0.55rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            className="primary"
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
            }}
          >
            Add
          </button>
        </form>
      )}

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.75rem',
              borderRadius: '12px',
              background: task.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${task.completed ? 'rgba(16, 185, 129, 0.25)' : 'var(--border)'}`,
              transition: 'all 0.2s ease',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                flex: 1,
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#10b981',
                  cursor: 'pointer',
                }}
              />
              <span
                style={{
                  fontSize: '0.88rem',
                  color: task.completed ? 'var(--muted)' : 'var(--text)',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  fontWeight: task.completed ? 400 : 500,
                  transition: 'all 0.2s ease',
                }}
              >
                {task.text}
              </span>
            </label>
            <button
              onClick={() => deleteTask(task.id)}
              title="Remove habit"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                padding: '0.2rem 0.4rem',
                borderRadius: '6px',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

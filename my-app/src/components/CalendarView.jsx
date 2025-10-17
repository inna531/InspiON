import React, { useState, useMemo } from 'react';
import { getPriorityColor } from '../data/taskModel';

const CalendarView = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  // Получение дней месяца
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Добавляем пустые ячейки для начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Фильтрация задач по дате
  const getTasksForDate = (date) => {
    if (!date) return [];
    
    const isSameDay = (d1, d2) => {
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    };
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    return tasks.filter(task => {
      const taskDate = new Date(date);
      const hasStart = !!task.startDate;
      const hasEnd = !!task.endDate;

      if (viewMode === 'month') {
        // Сравнение по дням (без учета времени)
        if (hasStart && hasEnd) {
          const taskStart = startOfDay(new Date(task.startDate));
          const taskEnd = startOfDay(new Date(task.endDate));
          const day = startOfDay(taskDate);
          return day >= taskStart && day <= taskEnd;
        }
        // Если указана только одна дата, показываем в день этой даты
        if (hasStart && isSameDay(new Date(task.startDate), taskDate)) return true;
        if (hasEnd && isSameDay(new Date(task.endDate), taskDate)) return true;
        return false;
      }

      // Для недельного/дневного видов: сохраняем прежнюю логику диапазона
      if (!hasStart || !hasEnd) {
        return false;
      }
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      return taskDate >= taskStart && taskDate <= taskEnd;
    });
  };

  // Получение интенсивности загруженности для дня
  const getDayIntensity = (date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return 'none';
    
    // Окраска по количеству задач
    if (dayTasks.length === 1) return 'low';      // зеленый
    if (dayTasks.length === 2) return 'medium';   // желтый
    return 'high';                                 // красный (больше двух задач)
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffd93d';
      case 'low': return '#6bcf7f';
      default: return '#f8f9fa';
    }
  };

  const navigate = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'day') {
        newDate.setDate(prev.getDate() + direction);
      } else {
        newDate.setMonth(prev.getMonth() + direction);
      }
      return newDate;
    });
  };

  const openDayView = (date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWeekDays = () => {
    return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  };

  const getStatusText = (status) => {
    const statusMap = {
      'project': 'В планах',
      'in_progress': 'В работе',
      'postponed': 'Отложено',
      'completed': 'Выполнено',
      'cancelled': 'Отменено'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>Календарь задач</h2>
        
        <div className="calendar-controls">
          <button onClick={() => navigate(-1)}>←</button>
          <h3>
            {viewMode === 'day' ? formatFullDate(currentDate) : formatDate(currentDate)}
          </h3>
          <button onClick={() => navigate(1)}>→</button>
        </div>

        <div className="view-mode">
          <button 
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            Месяц
          </button>
          <button 
            className={viewMode === 'day' ? 'active' : ''}
            onClick={() => setViewMode('day')}
          >
            День
          </button>
        </div>
      </div>

      {viewMode === 'month' && (
        <div className="calendar-month">
          <div className="calendar-weekdays">
            {getWeekDays().map(day => (
              <div key={day} className="weekday-header">{day}</div>
            ))}
          </div>
          
          <div className="calendar-grid">
            {days.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const getSortDate = (task) => {
                // Для сортировки используем дату начала, при отсутствии — дату окончания
                const d = task.startDate ? new Date(task.startDate) : (task.endDate ? new Date(task.endDate) : null);
                return d ? d.getTime() : 0;
              };
              const sortedDayTasks = [...dayTasks].sort((a, b) => getSortDate(a) - getSortDate(b));
              const intensity = getDayIntensity(date);
              
              return (
                <div 
                  key={index} 
                  className={`calendar-day ${!date ? 'empty' : ''}`}
                  style={{ 
                    backgroundColor: date ? getIntensityColor(intensity) : 'transparent' 
                  }}
                >
                  {date && (
                    <>
                      <div className="day-number" onClick={() => openDayView(new Date(date))} style={{ cursor: 'pointer' }}>{date.getDate()}</div>
                      <div className="day-tasks">
                        {sortedDayTasks.map(task => (
                          <div 
                            key={task.id}
                            className="task-indicator"
                            style={{ 
                              backgroundColor: getPriorityColor(task.totalPriority),
                              color: 'white'
                            }}
                            onClick={() => onTaskClick(task)}
                            title={task.title}
                          >
                            {task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      

      {viewMode === 'day' && (
        <div className="calendar-day-view">
          
          <div className="day-timeline">
            {Array.from({ length: 24 }, (_, hour) => {
              const intervalStart = new Date(currentDate);
              intervalStart.setHours(hour, 0, 0, 0);
              const intervalEnd = new Date(intervalStart);
              intervalEnd.setHours(intervalStart.getHours() + 1, 0, 0, 0);

              const hourTasks = tasks.filter(task => {
                // Пропускаем задачи без дат
                if (!task.startDate || !task.endDate) {
                  return false;
                }
                const taskStart = new Date(task.startDate);
                const taskEnd = new Date(task.endDate);
                // Пересечение интервала часа и интервала задачи
                return taskStart <= intervalEnd && taskEnd >= intervalStart;
              });

              return (
                <div key={hour} className="timeline-hour">
                  <div className="hour-marker">{hour}:00</div>
                  <div className="hour-content">
                    {hourTasks.map(task => {
                      const taskStart = new Date(task.startDate);
                      const taskEnd = new Date(task.endDate);
                      const displayStart = taskStart > intervalStart ? taskStart : intervalStart;
                      const displayEnd = taskEnd < intervalEnd ? taskEnd : intervalEnd;
                      return (
                        <div 
                          key={task.id}
                          className="timeline-task"
                          style={{ 
                            backgroundColor: getPriorityColor(task.totalPriority),
                            color: 'white'
                          }}
                          onClick={() => onTaskClick(task)}
                        >
                          <div className="task-time">
                            {formatTime(displayStart)} - {formatTime(displayEnd)}
                          </div>
                          <div className="task-title">{task.title}</div>
                          <div className="task-status">{getStatusText(task.status)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="calendar-legend">
        <h4>Легенда интенсивности:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></div>
            <span>Высокая загруженность</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ffd93d' }}></div>
            <span>Средняя загруженность</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#6bcf7f' }}></div>
            <span>Низкая загруженность</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;


import React, { useState, useMemo } from 'react';
import { getPriorityColor, getPriorityStatus } from '../data/taskModel';

const TaskList = ({ tasks, onEdit, onDelete, onCopy, onStatusChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    importance: 'all',
    urgency: 'all',
    priority: 'all',
    status: 'all'
  });
  
  const [sortBy, setSortBy] = useState('totalPriority');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFolder, setSelectedFolder] = useState('all');

  // Фильтрация задач
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Фильтр по папкам
      if (selectedFolder !== 'all') {
        switch (selectedFolder) {
          case 'projects':
            if (!['project', 'postponed'].includes(task.status)) return false;
            break;
          case 'current':
            if (task.status !== 'in_progress') return false;
            break;
          case 'archive':
            if (!['completed', 'cancelled'].includes(task.status)) return false;
            break;
        }
      }

      // Фильтр по поиску
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Фильтр по важности
      if (filters.importance !== 'all' && task.importance !== parseInt(filters.importance)) {
        return false;
      }

      // Фильтр по срочности
      if (filters.urgency !== 'all' && task.urgency !== parseInt(filters.urgency)) {
        return false;
      }

      // Фильтр по приоритету
      if (filters.priority !== 'all') {
        const priorityStatus = getPriorityStatus(task.totalPriority);
        if (priorityStatus !== filters.priority) return false;
      }

      // Фильтр по статусу
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [tasks, filters, selectedFolder]);

  // Сортировка задач
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'startDate':
          aValue = a.startDate ? new Date(a.startDate) : new Date(0);
          bValue = b.startDate ? new Date(b.startDate) : new Date(0);
          break;
        case 'endDate':
          aValue = a.endDate ? new Date(a.endDate) : new Date(0);
          bValue = b.endDate ? new Date(b.endDate) : new Date(0);
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'importance':
          aValue = a.importance;
          bValue = b.importance;
          break;
        case 'urgency':
          aValue = a.urgency;
          bValue = b.urgency;
          break;
        case 'totalPriority':
        default:
          aValue = a.totalPriority;
          bValue = b.totalPriority;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredTasks, sortBy, sortOrder]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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

  const getPriorityText = (priority) => {
    const priorityMap = {
      'very_high': 'Очень высокий',
      'high': 'Высокий',
      'medium': 'Средний',
      'low': 'Низкий',
      'very_low': 'Очень низкий'
    };
    return priorityMap[priority] || priority;
  };

  const formatDuration = (duration) => {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Список задач</h2>
        
        {/* Папки */}
        <div className="folder-tabs">
          <button 
            className={selectedFolder === 'all' ? 'active' : ''}
            onClick={() => setSelectedFolder('all')}
          >
            Все задачи
          </button>
          <button 
            className={selectedFolder === 'projects' ? 'active' : ''}
            onClick={() => setSelectedFolder('projects')}
          >
            В планах
          </button>
          <button 
            className={selectedFolder === 'current' ? 'active' : ''}
            onClick={() => setSelectedFolder('current')}
          >
            Актуальное
          </button>
          <button 
            className={selectedFolder === 'archive' ? 'active' : ''}
            onClick={() => setSelectedFolder('archive')}
          >
            Архив
          </button>
        </div>

        {/* Фильтры */}
        <div className="filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              value={filters.importance}
              onChange={(e) => handleFilterChange('importance', e.target.value)}
            >
              <option value="all">Все важности</option>
              <option value="2">Высокая</option>
              <option value="1">Средняя</option>
              <option value="0">Низкая</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.urgency}
              onChange={(e) => handleFilterChange('urgency', e.target.value)}
            >
              <option value="all">Все срочности</option>
              <option value="2">Высокая</option>
              <option value="1">Средняя</option>
              <option value="0">Низкая</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">Все приоритеты</option>
              <option value="very_high">Очень высокий</option>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
              <option value="very_low">Очень низкий</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="project">В планах</option>
              <option value="in_progress">В работе</option>
              <option value="postponed">Отложено</option>
              <option value="completed">Выполнено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>
        </div>

        {/* Сортировка */}
        <div className="sorting">
          <label>Сортировка:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="totalPriority">По приоритету</option>
            <option value="urgency">По срочности</option>
            <option value="importance">По важности</option>
            <option value="startDate">По дате начала</option>
            <option value="endDate">По дате окончания</option>
            <option value="duration">По продолжительности</option>
            <option value="title">По названию</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Список задач */}
      <div className="tasks-container">
        {sortedTasks.length === 0 ? (
          <div className="no-tasks">
            <p>Задач не найдено</p>
          </div>
        ) : (
          sortedTasks.map(task => (
            <div key={task.id} className="task-item">
              <div className="task-header">
                <h3 
                  className="task-title"
                  onClick={() => onEdit(task)}
                  style={{ cursor: 'pointer' }}
                >
                  {task.title}
                </h3>
                <div className="task-actions">
                  <button onClick={() => onEdit(task)} className="btn-edit">
                    Редактировать
                  </button>
                  <button onClick={() => onCopy(task)} className="btn-copy">
                    Создать копию
                  </button>
                  <button onClick={() => onDelete(task.id)} className="btn-delete">
                    Удалить
                  </button>
                </div>
              </div>

              <div className="task-details">
                <div className="task-info">
                  <span className="task-status">{getStatusText(task.status)}</span>
                  <span 
                    className="task-priority"
                    style={{ color: getPriorityColor(task.totalPriority) }}
                  >
                    {getPriorityText(getPriorityStatus(task.totalPriority))} ({task.totalPriority})
                  </span>
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                <div className="task-meta">
                  <div className="meta-item">
                    <strong>Начало:</strong> {task.startDate ? new Date(task.startDate).toLocaleString() : 'Не указано'}
                  </div>
                  <div className="meta-item">
                    <strong>Окончание:</strong> {task.endDate ? new Date(task.endDate).toLocaleString() : 'Не указано'}
                  </div>
                  <div className="meta-item">
                    <strong>Продолжительность:</strong> {formatDuration(task.duration)}
                  </div>
                  <div className="meta-item">
                    <strong>Выполнение:</strong> {task.completionPercentage}%
                  </div>
                </div>

                {task.comment && (
                  <div className="task-comment">
                    <strong>Комментарий:</strong> {task.comment}
                  </div>
                )}

                <div className="task-progress">
                  <div 
                    className="progress-bar"
                    style={{ width: `${task.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;


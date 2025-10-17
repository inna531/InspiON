import React, { useMemo } from 'react';
import { getPriorityStatus } from '../data/taskModel';

const WorkloadVisualization = ({ tasks }) => {

  // Вспомогательная функция форматирования длительности (мс -> "Xч Yм")
  const formatDurationMs = (ms) => {
    if (!ms || ms <= 0) return '0ч 0м';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  // Агрегация по статусам и приоритетам + общее среднее время
  const { statusStats, priorityStats, overallAvg } = useMemo(() => {
    const statusAgg = {};
    const priorityAgg = {};
    let overallDuration = 0;
    let overallCountForAvg = 0;

    tasks.forEach(task => {
      // Статусы: считаем количество всегда
      const s = task.status || 'unknown';
      if (!statusAgg[s]) {
        statusAgg[s] = { count: 0, totalDuration: 0, countForAvg: 0 };
      }
      statusAgg[s].count += 1;

      // Приоритеты: маппим totalPriority -> very_low..very_high
      const pKey = getPriorityStatus(typeof task.totalPriority === 'number' ? task.totalPriority : 0);
      if (!priorityAgg[pKey]) {
        priorityAgg[pKey] = { count: 0, totalDuration: 0, countForAvg: 0 };
      }
      priorityAgg[pKey].count += 1;

      // Для средних длительностей учитываем только валидные длительности (>0)
      const duration = typeof task.duration === 'number' ? task.duration : 0;
      if (duration > 0) {
        statusAgg[s].totalDuration += duration;
        statusAgg[s].countForAvg += 1;

        priorityAgg[pKey].totalDuration += duration;
        priorityAgg[pKey].countForAvg += 1;

        overallDuration += duration;
        overallCountForAvg += 1;
      }
    });

    const overallAvgMs = overallCountForAvg > 0 ? Math.floor(overallDuration / overallCountForAvg) : 0;

    return { statusStats: statusAgg, priorityStats: priorityAgg, overallAvg: overallAvgMs };
  }, [tasks]);

  const statusLabel = (status) => {
    const map = {
      project: 'В планах',
      postponed: 'Отложено',
      in_progress: 'В работе',
      completed: 'Выполнено',
      cancelled: 'Отменено',
      unknown: 'Неизвестно'
    };
    return map[status] || status;
  };

  const priorityLabel = (pKey) => {
    const map = {
      very_low: 'Очень низкий',
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      very_high: 'Очень высокий',
      unknown: 'Неизвестно'
    };
    return map[pKey] || pKey;
  };

  return (
    <div className="workload-visualization">
      <div className="visualization-header">
        <h2>Анализ списка задач</h2>
      </div>

      {/* Статистика (оставлены только требуемые блоки) */}
      <div className="workload-stats">
        {/* Статистика по статусам */}
        <div className="stat-card">
          <h3>Статистика по статусам</h3>
          <div className="stat-grid">
            {Object.keys(statusStats).length === 0 ? (
            <div className="stat-item">
                <span className="stat-label">Нет данных</span>
            </div>
            ) : (
              Object.entries(statusStats).map(([key, v]) => (
                <div key={key} className="stat-item" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'center' }}>
                  <span className="stat-label">{statusLabel(key)}:</span>
                  <span className="stat-value">{v.count} шт.</span>
                  <span className="stat-value">среднее время исполнения: {formatDurationMs(v.countForAvg > 0 ? Math.floor(v.totalDuration / v.countForAvg) : 0)}</span>
            </div>
              ))
            )}
          </div>
        </div>

        {/* Статистика по приоритетам */}
        <div className="stat-card">
          <h3>Статистика по приоритетам</h3>
          <div className="stat-grid">
            {Object.keys(priorityStats).length === 0 ? (
            <div className="stat-item">
                <span className="stat-label">Нет данных</span>
            </div>
            ) : (
              Object.entries(priorityStats).map(([key, v]) => (
                <div key={key} className="stat-item" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'center' }}>
                  <span className="stat-label">{priorityLabel(key)}:</span>
                  <span className="stat-value">{v.count} шт.</span>
                  <span className="stat-value">среднее время исполнения: {formatDurationMs(v.countForAvg > 0 ? Math.floor(v.totalDuration / v.countForAvg) : 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Общее среднее время */}
        <div className="stat-card">
          <h3>Общее среднее время выполнения</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Среднее по всем задачам:</span>
              <span className="stat-value">{formatDurationMs(overallAvg)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadVisualization;


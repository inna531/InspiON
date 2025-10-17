import React, { useState, useEffect } from 'react';
import { createTask, updateTask, TaskStatus, Importance, Urgency, Frequency, calculateTotalPriority } from '../data/taskModel';

const TaskForm = ({ task, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.IN_PROGRESS,
    author: '',
    startDate: '',
    endDate: '',
    importance: Importance.MEDIUM,
    urgency: Urgency.MEDIUM,
    frequency: Frequency.ONE_TIME,
    period: '',
    completionPercentage: 0,
    comment: ''
  });
  
  const [dateError, setDateError] = useState('');

  // Функция для форматирования даты в локальном времени для datetime-local input
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (task && isEditing) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        author: task.author,
        startDate: formatDateTimeLocal(task.startDate),
        endDate: formatDateTimeLocal(task.endDate),
        importance: task.importance,
        urgency: task.urgency,
        frequency: task.frequency,
        period: task.period || '',
        completionPercentage: task.completionPercentage,
        comment: task.comment
      });
    }
  }, [task, isEditing]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
    
    // Очищаем ошибку при изменении дат
    if (name === 'startDate' || name === 'endDate') {
      setDateError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация дат: проверяем, что время окончания не раньше времени начала
    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(formData.startDate);
      const endDateTime = new Date(formData.endDate);
      
      if (startDateTime > endDateTime) {
        setDateError('Время окончания задачи указано раньше ее начала');
        return; // Прерываем сохранение
      }
    }
    
    // Очищаем ошибку перед сохранением
    setDateError('');
    
    if (isEditing && task) {
      // При редактировании передаем данные как есть, updateTask сам обработает даты
      const updatedTask = updateTask(task, formData);
      onSave(updatedTask);
    } else {
      const newTask = createTask(formData);
      onSave(newTask);
    }
  };

  const getPriorityText = (total) => {
    switch (total) {
      case 4: return 'Очень высокий';
      case 3: return 'Высокий';
      case 2: return 'Средний';
      case 1: return 'Низкий';
      case 0: return 'Очень низкий';
      default: return 'Неизвестно';
    }
  };

  const totalPriority = calculateTotalPriority(formData.importance, formData.urgency);

  return (
    <div className="task-form">
      <h2>{isEditing ? 'Редактировать задачу' : 'Новая задача'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Наименование задачи *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Введите название задачи"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание задачи</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Подробное описание задачи"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Статус</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value={TaskStatus.PROJECT}>В планах</option>
              <option value={TaskStatus.IN_PROGRESS}>В работе</option>
              <option value={TaskStatus.POSTPONED}>Отложено</option>
              <option value={TaskStatus.COMPLETED}>Выполнено</option>
              <option value={TaskStatus.CANCELLED}>Отменено</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Дата/время начала</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Дата/время окончания</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {dateError && (
          <div className="error-message" style={{ 
            color: '#d32f2f', 
            backgroundColor: '#ffebee', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            border: '1px solid #ef5350'
          }}>
            ⚠️ {dateError}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="importance">Важность</label>
            <select
              id="importance"
              name="importance"
              value={formData.importance}
              onChange={handleChange}
            >
              <option value={Importance.LOW}>Низкая (0)</option>
              <option value={Importance.MEDIUM}>Средняя (1)</option>
              <option value={Importance.HIGH}>Высокая (2)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="urgency">Срочность</label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
            >
              <option value={Urgency.LOW}>Низкая (0)</option>
              <option value={Urgency.MEDIUM}>Средняя (1)</option>
              <option value={Urgency.HIGH}>Высокая (2)</option>
            </select>
          </div>
        </div>

        <div className="priority-display">
          <strong>Итоговый приоритет: {totalPriority} ({getPriorityText(totalPriority)})</strong>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="frequency">Периодичность</label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
            >
              <option value={Frequency.ONE_TIME}>Разовая</option>
              <option value={Frequency.PERIODIC}>Периодическая</option>
            </select>
          </div>

          {formData.frequency === Frequency.PERIODIC && (
            <div className="form-group">
              <label htmlFor="period">Период</label>
              <input
                type="text"
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                placeholder="Например: ежедневно, еженедельно"
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="completionPercentage">Процент выполнения</label>
          <input
            type="range"
            id="completionPercentage"
            name="completionPercentage"
            min="0"
            max="100"
            value={formData.completionPercentage}
            onChange={handleChange}
          />
          <span>{formData.completionPercentage}%</span>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Комментарий</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows="2"
            placeholder="Дополнительные заметки"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {isEditing ? 'Сохранить изменения' : 'Создать задачу'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;


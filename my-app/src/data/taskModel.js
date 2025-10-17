// Модель данных для задач
export const TaskStatus = {
  PROJECT: 'project',
  POSTPONED: 'postponed', 
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const TaskPriority = {
  VERY_LOW: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  VERY_HIGH: 4
};

export const Importance = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2
};

export const Urgency = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2
};

export const Frequency = {
  ONE_TIME: 'one_time',
  PERIODIC: 'periodic'
};

// Вычисление итогового приоритета по правилам важности и срочности
export const calculateTotalPriority = (importance, urgency) => {
  // Нормализуем значения на случай некорректного ввода
  const imp = Number(importance);
  const urg = Number(urgency);

  if (imp === 0 && urg === 0) return 0; // очень низкий

  if ((imp === 0 && urg === 1) || (imp === 1 && urg === 0)) return 1; // низкий

  if (
    (imp === 0 && urg === 2) ||
    (imp === 2 && urg === 0) ||
    (imp === 1 && urg === 1)
  ) return 2; // средний

  if ((imp === 2 && urg === 1) || (imp === 1 && urg === 2)) return 3; // высокий

  if (imp === 2 && urg === 2) return 4; // очень высокий

  // Значение по умолчанию, если что-то вне диапазона
  return Math.max(0, Math.min(4, imp + urg));
};

// Функция для создания новой задачи
export const createTask = (taskData) => {
  // Если статус "В планах", даты могут быть пустыми
  const isProjectStatus = taskData.status === TaskStatus.PROJECT;
  
  const startDate = (taskData.startDate && typeof taskData.startDate === 'string' && taskData.startDate.trim()) ? new Date(taskData.startDate) : null;
  const endDate = (taskData.endDate && typeof taskData.endDate === 'string' && taskData.endDate.trim()) ? new Date(taskData.endDate) : null;
  
  // Рассчитываем продолжительность только если обе даты указаны
  const duration = (startDate && endDate) ? Math.max(0, endDate - startDate) : 0;
  
  const totalPriority = calculateTotalPriority(taskData.importance, taskData.urgency);
  
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: taskData.title || '',
    description: taskData.description || '',
    status: taskData.status || TaskStatus.IN_PROGRESS,
    author: taskData.author || '',
    startDate: startDate,
    endDate: endDate,
    duration: duration,
    importance: taskData.importance || Importance.MEDIUM,
    urgency: taskData.urgency || Urgency.MEDIUM,
    totalPriority: totalPriority,
    frequency: taskData.frequency || Frequency.ONE_TIME,
    period: taskData.period || null,
    completionPercentage: taskData.completionPercentage || 0,
    comment: taskData.comment || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Функция для обновления задачи
export const updateTask = (task, updates) => {
  const updatedTask = { ...task, ...updates };
  updatedTask.updatedAt = new Date();
  
  // Пересчитываем приоритет если изменились важность или срочность
  if (updates.importance !== undefined || updates.urgency !== undefined) {
    updatedTask.totalPriority = calculateTotalPriority(updatedTask.importance, updatedTask.urgency);
  }
  
  // Пересчитываем продолжительность если изменились даты
  if (updates.startDate !== undefined || updates.endDate !== undefined) {
    // Обрабатываем пустые даты
    const startDate = (updates.startDate && typeof updates.startDate === 'string' && updates.startDate.trim()) ? new Date(updates.startDate) : 
                     (updates.startDate === '' || updates.startDate === null || updates.startDate === undefined) ? null : 
                     (updates.startDate instanceof Date) ? updates.startDate : null;
                     
    const endDate = (updates.endDate && typeof updates.endDate === 'string' && updates.endDate.trim()) ? new Date(updates.endDate) : 
                   (updates.endDate === '' || updates.endDate === null || updates.endDate === undefined) ? null : 
                   (updates.endDate instanceof Date) ? updates.endDate : null;
    
    updatedTask.startDate = startDate;
    updatedTask.endDate = endDate;
    
    // Рассчитываем продолжительность только если обе даты указаны
    updatedTask.duration = (startDate && endDate) ? Math.max(0, endDate - startDate) : 0;
  }
  
  return updatedTask;
};

// Функция для получения статуса приоритета
export const getPriorityStatus = (totalPriority) => {
  switch (totalPriority) {
    case 4: return 'very_high';
    case 3: return 'high';
    case 2: return 'medium';
    case 1: return 'low';
    case 0: return 'very_low';
    default: return 'unknown';
  }
};

// Функция для получения цвета приоритета
export const getPriorityColor = (totalPriority) => {
  switch (totalPriority) {
    case 4: return '#ff4444'; // красный - очень высокий
    case 3: return '#ff8800'; // оранжевый - высокий
    case 2: return '#ffcc00'; // желтый - средний
    case 1: return '#88cc00'; // светло-зеленый - низкий
    case 0: return '#44aa44'; // зеленый - очень низкий
    default: return '#cccccc'; // серый - неизвестно
  }
};


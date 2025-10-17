import React, { useState } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import CalendarView from './components/CalendarView';
import WorkloadVisualization from './components/WorkloadVisualization';
import { createTask, updateTask } from './data/taskModel';

function App() {
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // list, calendar, visualization
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      // Если пришел уже сформированный объект задачи (с id), используем его
      const updatedTask = taskData && taskData.id ? taskData : updateTask(editingTask, taskData);
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));
    } else {
      // Если пришел уже сформированный объект задачи (с id), добавляем как есть
      const newTask = taskData && taskData.id ? taskData : createTask(taskData);
      setTasks(prev => [...prev, newTask]);
    }
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const handleCopyTask = (task) => {
    // Создаем копию задачи с новым ID и временными метками
    const taskCopy = createTask({
      title: task.title,
      description: task.description,
      status: task.status,
      author: task.author,
      startDate: task.startDate ? task.startDate.toISOString() : null,
      endDate: task.endDate ? task.endDate.toISOString() : null,
      importance: task.importance,
      urgency: task.urgency,
      frequency: task.frequency,
      period: task.period,
      completionPercentage: task.completionPercentage,
      comment: task.comment
    });
    setTasks(prev => [...prev, taskCopy]);
  };

  const handleCancelForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleTaskClick = (task) => {
    // Открываем карточку задачи для редактирования
    setEditingTask(task);
    setShowTaskForm(true);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>InspiON - Управление задачами и балансом</h1>
        <p>Цифровой ежедневник для эффективного планирования</p>
      </header>

      <nav className="app-navigation">
        <button 
          className={currentView === 'list' ? 'active' : ''}
          onClick={() => setCurrentView('list')}
        >
          📋 Список задач
        </button>
        <button 
          className={currentView === 'calendar' ? 'active' : ''}
          onClick={() => setCurrentView('calendar')}
        >
          📅 Календарь
        </button>
        <button 
          className={currentView === 'visualization' ? 'active' : ''}
          onClick={() => setCurrentView('visualization')}
        >
          📊 Аналитика
        </button>
        <button 
          className="add-task-btn"
          onClick={handleAddTask}
        >
          ➕ Добавить задачу
        </button>
      </nav>

      <main className="app-main">
        {showTaskForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <TaskForm
                task={editingTask}
                onSave={handleSaveTask}
                onCancel={handleCancelForm}
                isEditing={!!editingTask}
              />
            </div>
          </div>
        )}

        {currentView === 'list' && (
          <TaskList
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onCopy={handleCopyTask}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onTaskClick={handleTaskClick}
          />
        )}

        {currentView === 'visualization' && (
          <WorkloadVisualization
            tasks={tasks}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 InspiON - Система управления задачами и work/life balance</p>
      </footer>
    </div>
  );
}

export default App;



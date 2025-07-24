import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getTasksByProject, updateTask } from '../../services/taskService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskFilter from './TaskFilter';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Komponen SortableTaskCard untuk digunakan dengan dnd-kit
const SortableTaskCard = ({ task, refreshTasks, id, userId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="mb-3"
    >
      <TaskCard task={task} refreshTasks={refreshTasks} currentUserId={userId} />
    </div>
  );
};

// Komponen TaskColumn
const TaskColumn = ({ columnId, tasks, refreshTasks, userId }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-lg font-medium text-gray-700 mb-3 capitalize">
        {columnId === 'todo' ? 'To Do' : 
         columnId === 'in-progress' ? 'In Progress' : 
         columnId === 'review' ? 'Review' : 'Done'}
      </h2>
      <div className="min-h-[200px]">
        <SortableContext 
          items={tasks.map(task => task._id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <SortableTaskCard 
              key={task._id} 
              id={task._id} 
              task={task} 
              refreshTasks={refreshTasks}
              userId={userId}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

const TaskBoard = () => {
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState({
    todo: [],
    'in-progress': [],
    review: [],
    done: []
  });
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [allTasks, setAllTasks] = useState([]);
  const { joinProjectRoom, sendUpdateTaskNotification } = useContext(NotificationContext);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await getTasksByProject(projectId);
        setAllTasks(tasksData);
        
        // Terapkan filter jika ada
        applyFilters(tasksData);
        
        setLoading(false);
        
        // Gabung socket room untuk project
        joinProjectRoom(projectId);
      } catch (err) {
        setError(err.msg || 'Gagal memuat tugas');
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, joinProjectRoom]);

  const applyFilters = (tasksData) => {
    let filteredTasks = [...tasksData];
    
    // Filter berdasarkan penugasan atau pembuat
    if (activeFilter === 'assigned') {
      filteredTasks = filteredTasks.filter(task => 
        task.assignedTo && task.assignedTo._id === user.id
      );
    } else if (activeFilter === 'created') {
      filteredTasks = filteredTasks.filter(task => 
        task.createdBy && task.createdBy._id === user.id
      );
    }
    
    // Filter berdasarkan prioritas
    if (priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(term) || 
        (task.description && task.description.toLowerCase().includes(term))
      );
    }
    
    // Kelompokkan tugas berdasarkan status
    const groupedTasks = {
      todo: filteredTasks.filter(task => task.status === 'todo'),
      'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
      review: filteredTasks.filter(task => task.status === 'review'),
      done: filteredTasks.filter(task => task.status === 'done')
    };
    
    setTasks(groupedTasks);
  };

  const handleFilterChange = (filter, priority = 'all') => {
    setActiveFilter(filter);
    setPriorityFilter(priority);
    applyFilters(allTasks);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(allTasks);
  };

  const findContainer = (id) => {
    if (id in tasks) return id;
    
    const container = Object.keys(tasks).find(key => 
      tasks[key].some(task => task._id === id)
    );
    
    return container;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    
    if (
      !activeContainer || 
      !overContainer || 
      activeContainer === overContainer
    ) {
      return;
    }

    setTasks(prev => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      
      const activeIndex = activeItems.findIndex(
        item => item._id === active.id
      );
      
      const taskToMove = activeItems[activeIndex];

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(item => item._id !== active.id)
        ],
        [overContainer]: [
          ...prev[overContainer],
          { ...taskToMove, status: overContainer }
        ]
      };
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    
    if (activeContainer !== overContainer) {
      try {
        const updatedTask = await updateTask(active.id, { status: overContainer });
        sendUpdateTaskNotification(updatedTask);
        
        // Update task di allTasks
        setAllTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === active.id ? { ...task, status: overContainer } : task
          )
        );
      } catch (err) {
        console.error('Error updating task status:', err);
        refreshTasks(); // Reload to original state if failed
      }
    }
    
    setActiveId(null);
  };

  const refreshTasks = async () => {
    try {
      const tasksData = await getTasksByProject(projectId);
      setAllTasks(tasksData);
      applyFilters(tasksData);
    } catch (err) {
      setError(err.msg || 'Gagal memuat tugas');
    }
  };

  const handleTaskAdded = () => {
    refreshTasks();
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Temukan task yang aktif di-drag
  const getActiveTask = () => {
    if (!activeId) return null;
    
    const container = findContainer(activeId);
    if (!container) return null;
    
    const taskIndex = tasks[container].findIndex(
      task => task._id === activeId
    );
    
    return tasks[container][taskIndex];
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Papan Tugas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Tambah Tugas
        </button>
      </div>

      <TaskFilter 
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchTerm={searchTerm}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.keys(tasks).map((columnId) => (
            <TaskColumn
              key={columnId}
              columnId={columnId}
              tasks={tasks[columnId]}
              refreshTasks={refreshTasks}
              userId={user?.id}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="mb-3">
              <TaskCard task={getActiveTask()} refreshTasks={refreshTasks} currentUserId={user?.id} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isModalOpen && (
        <TaskForm
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onTaskAdded={handleTaskAdded}
        />
      )}
    </div>
  );
};

export default TaskBoard;
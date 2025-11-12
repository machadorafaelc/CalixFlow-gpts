import { TaskCard } from './TaskCard';

interface Task {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  priority: 'alta' | 'media' | 'baixa';
  tags?: string[];
  status: 'backlog' | 'em-andamento' | 'concluido';
  isNew?: boolean;
}

interface KanbanBoardProps {
  tasks: Task[];
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const columns = [
    { id: 'backlog', title: 'Backlog', status: 'backlog' as const },
    { id: 'em-andamento', title: 'Em Andamento', status: 'em-andamento' as const },
    { id: 'concluido', title: 'Concluído', status: 'concluido' as const }
  ];

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        
        return (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200/50">
              <h3 className="text-stone-700 tracking-wide">{column.title}</h3>
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-sm">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="flex-1 space-y-4 min-h-0 overflow-y-auto pr-2">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  assignee={task.assignee}
                  deadline={task.deadline}
                  priority={task.priority}
                  tags={task.tags}
                  status={task.status}
                  isNew={task.isNew}
                />
              ))}
              
              {columnTasks.length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-stone-200 rounded-lg">
                  <p className="text-stone-400 text-sm">Nenhuma tarefa</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
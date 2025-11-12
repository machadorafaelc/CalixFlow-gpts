import { Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export interface Job {
  id: string;
  title: string;
  client: string;
  campaign?: string;
  clientLogo?: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  responsible: {
    name: string;
    avatar?: string;
  };
  deadline: string;
  comments: number;
  attachments: number;
  progress: number;
  status: 'Backlog' | 'Briefing' | 'Aprovação' | 'Concluído';
  tags?: string[];
}

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const priorityColors = {
    'Alta': 'bg-red-500 text-white',
    'Média': 'bg-yellow-500 text-white',
    'Baixa': 'bg-green-500 text-white'
  };

  const isOverdue = () => {
    const deadlineDate = new Date(job.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today && job.status !== 'Concluído';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    return `${day} ${month}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all duration-200 group"
    >
      {/* Priority and Client */}
      <div className="flex items-center gap-2 mb-3">
        <Badge className={`${priorityColors[job.priority]} px-2 py-0.5 text-xs`}>
          {job.priority.toUpperCase()}
        </Badge>
        <span className="text-sm text-gray-600 truncate flex-1">
          {job.client}
        </span>
      </div>

      {/* Job Title */}
      <h3 className="text-gray-900 mb-3 line-clamp-2">
        {job.title}
      </h3>

      {/* Responsible */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar className="h-6 w-6">
          <AvatarImage src={job.responsible.avatar} />
          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
            {job.responsible.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-gray-700">
          {job.responsible.name}
        </span>
      </div>

      {/* Deadline and Activity Indicators */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-1.5 text-sm ${isOverdue() ? 'text-red-600' : 'text-gray-600'}`}>
          <Calendar className="h-4 w-4" />
          <span>{formatDate(job.deadline)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-500">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{job.comments}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Paperclip className="h-4 w-4" />
            <span className="text-sm">{job.attachments}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress value={job.progress} className="h-1.5" />
        <span className="text-xs text-gray-500">{job.progress}% concluído</span>
      </div>
    </div>
  );
}


import { ChevronRight } from 'lucide-react';
import { Project } from '@/types/sidebar';

interface ProjectListProps {
  projects: Project[];
  selectedProject: string | null;
  onProjectSelect: (projectId: string) => void;
}

export function ProjectList({ projects, selectedProject, onProjectSelect }: ProjectListProps) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">PROJECTS</h2>
      <ul className="space-y-1">
        {projects.map(project => (
          <li key={project.id}>
            <button
              onClick={() => onProjectSelect(project.id)}
              className={`w-full text-left p-2 rounded-md text-sm flex items-center justify-between group hover:bg-accent/20 transition-colors ${
                selectedProject === project.id ? 'bg-accent/20 font-medium' : ''
              }`}
            >
              <span className="truncate">{project.name}</span>
              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

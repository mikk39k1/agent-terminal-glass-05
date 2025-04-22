
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CreateProjectDialogProps {
  onCreateProject: (name: string, description: string) => void;
}

export function CreateProjectDialog({ onCreateProject }: CreateProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleCreateProject = () => {
    if (projectName.trim()) {
      onCreateProject(projectName, projectDescription);
      setProjectName('');
      setProjectDescription('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Create Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
          <Button onClick={handleCreateProject} className="w-full">
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

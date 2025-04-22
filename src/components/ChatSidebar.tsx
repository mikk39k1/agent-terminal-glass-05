
import { useState, useEffect } from 'react';
import { PlusCircle, ChevronRight, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  name: string;
  description: string;
  github_repo: string | null;
  github_owner: string | null;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

export default function ChatSidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchChats(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch projects",
      });
    } else {
      setProjects(data || []);
    }
  };

  const fetchChats = async (projectId: string) => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch chats",
      });
    } else {
      setChats(data || []);
    }
  };

  const handleNewProject = async () => {
    if (!projectName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Project name is required",
      });
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: projectName,
          description: projectDescription,
        }
      ])
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create project",
      });
    } else {
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setProjectName('');
      setProjectDescription('');
      setProjects([data, ...projects]);
      setSelectedProject(data.id);
    }
  };

  const handleNewChat = async () => {
    if (!selectedProject) return;

    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          project_id: selectedProject,
          title: 'New Chat',
        }
      ])
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create chat",
      });
    } else {
      setChats([data, ...chats]);
      setSelectedChat(data.id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="h-full flex flex-col bg-secondary dark:bg-secondary border-r border-border">
      <div className="p-4 space-y-4">
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
              <Button onClick={handleNewProject} className="w-full">
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {selectedProject && (
          <Button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2"
          >
            <PlusCircle size={16} />
            <span>New Chat</span>
          </Button>
        )}

        <Button
          variant="ghost"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">PROJECTS</h2>
            <ul className="space-y-1">
              {projects.map(project => (
                <li key={project.id}>
                  <button
                    onClick={() => setSelectedProject(project.id)}
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

          {selectedProject && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">CHATS</h2>
              <ul className="space-y-1">
                {chats.map(chat => (
                  <li key={chat.id}>
                    <button
                      onClick={() => setSelectedChat(chat.id)}
                      className={`w-full text-left p-2 rounded-md text-sm flex items-center justify-between group hover:bg-accent/20 transition-colors ${
                        selectedChat === chat.id ? 'bg-accent/20 font-medium' : ''
                      }`}
                    >
                      <div className="truncate">
                        <span>{chat.title}</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

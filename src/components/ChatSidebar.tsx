import { useState, useEffect } from 'react';
import { PlusCircle, ChevronRight, LogOut, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface ChatSidebarProps {
  onChatSelect: (chatId: string | null) => void;
}

export default function ChatSidebar({ onChatSelect }: ChatSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchChats(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedChat) {
      onChatSelect(selectedChat);
    }
  }, [selectedChat, onChatSelect]);

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

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a project",
      });
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: projectName,
          description: projectDescription,
          user_id: user.id
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
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a chat",
      });
      return;
    }

    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          project_id: selectedProject,
          title: 'New Chat',
          user_id: user.id
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

  const handleUpdateChat = async () => {
    if (!editingChat || !newChatTitle.trim()) return;

    const { error } = await supabase
      .from('chats')
      .update({ title: newChatTitle })
      .eq('id', editingChat.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update chat",
      });
    } else {
      toast({
        title: "Success",
        description: "Chat updated successfully",
      });
      setEditingChat(null);
      setNewChatTitle('');
      if (selectedProject) {
        fetchChats(selectedProject);
      }
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete chat",
      });
    } else {
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
      if (selectedProject) {
        fetchChats(selectedProject);
      }
      if (selectedChat === chatId) {
        onChatSelect(null);
      }
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
                    <div className="group flex items-center gap-2">
                      <button
                        onClick={() => setSelectedChat(chat.id)}
                        className={`flex-1 text-left p-2 rounded-md text-sm flex items-center justify-between group hover:bg-accent/20 transition-colors ${
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
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              setEditingChat(chat);
                              setNewChatTitle(chat.title);
                            }}
                          >
                            <Edit size={14} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Chat Title</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input
                              placeholder="Chat Title"
                              value={newChatTitle}
                              onChange={(e) => setNewChatTitle(e.target.value)}
                            />
                            <Button onClick={handleUpdateChat} className="w-full">
                              Update Chat
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the chat
                              and all its messages.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteChat(chat.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

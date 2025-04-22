import { useState, useEffect } from 'react';
import { PlusCircle, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { ProjectList } from './sidebar/ProjectList';
import { ChatList } from './sidebar/ChatList';
import { CreateProjectDialog } from './sidebar/CreateProjectDialog';
import { Project, Chat } from '@/types/sidebar';

interface ChatSidebarProps {
  onChatSelect: (chatId: string | null) => void;
}

export default function ChatSidebar({ onChatSelect }: ChatSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
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

  const handleNewProject = async (name: string, description: string) => {
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
          name,
          description,
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
      setProjects([data, ...projects]);
      setSelectedProject(data.id);
    }
  };

  const handleNewChat = async () => {
    if (!selectedProject || !user) return;

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
      onChatSelect(data.id);
    }
  };

  const handleUpdateChat = async (chatId: string, newTitle: string) => {
    const { error } = await supabase
      .from('chats')
      .update({ title: newTitle })
      .eq('id', chatId);

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
        <CreateProjectDialog onCreateProject={handleNewProject} />

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
          <ProjectList
            projects={projects}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />

          {selectedProject && (
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              onChatSelect={setSelectedChat}
              onUpdateChat={handleUpdateChat}
              onDeleteChat={handleDeleteChat}
            />
          )}
        </div>
      </div>
    </div>
  );
}

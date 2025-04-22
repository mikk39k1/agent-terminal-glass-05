
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chat } from '@/types/sidebar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatListProps {
  chats: Chat[];
  selectedChat: string | null;
  onChatSelect: (chatId: string) => void;
  onUpdateChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChat, onChatSelect, onUpdateChat, onDeleteChat }: ChatListProps) {
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');

  const handleUpdateChat = () => {
    if (editingChat && newChatTitle.trim()) {
      onUpdateChat(editingChat.id, newChatTitle);
      setEditingChat(null);
      setNewChatTitle('');
    }
  };

  return (
    <div>
      <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">CHATS</h2>
      <ul className="space-y-1">
        {chats.map(chat => (
          <li key={chat.id}>
            <div className="group flex items-center gap-2">
              <button
                onClick={() => onChatSelect(chat.id)}
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
              </button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <EllipsisVertical size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setEditingChat(chat);
                          setNewChatTitle(chat.title);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
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
                        className="w-full justify-start text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
                        <AlertDialogAction onClick={() => onDeleteChat(chat.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </PopoverContent>
              </Popover>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

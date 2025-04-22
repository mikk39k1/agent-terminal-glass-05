
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Email and password are required",
        });
        return;
      }
      
      // Sign up with email and password
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Email and password are required",
        });
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome to DevOps Agent</h2>
          <p className="text-muted-foreground">Sign in or create an account to continue</p>
        </div>
        
        <Alert className="bg-primary/10 border-primary/20 mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>For new users</AlertTitle>
          <AlertDescription>
            After signing up, you'll need to verify your email before logging in.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Sign In'}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleSignUp}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogIn } from "lucide-react";
import btsLogo from "@/assets/black-tech-street-logo.png";

interface PasswordGateProps {
  children: ReactNode;
  storageKey?: string;
}

const CORRECT_PASSWORD = "aspire";

export function PasswordGate({ children, storageKey = "admin-unlocked" }: PasswordGateProps) {
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(storageKey) === "true";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === CORRECT_PASSWORD) {
      sessionStorage.setItem(storageKey, "true");
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src={btsLogo} 
            alt="Black Tech Street Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => navigate("/auth")}
          >
            <LogIn className="h-4 w-4" />
            Admin Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

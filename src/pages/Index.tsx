import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-5xl font-bold text-foreground mb-4">Prescription Manager</h1>
          <p className="text-xl text-muted-foreground">Digital prescription management system</p>
        </div>
        <Button onClick={handleLogin} size="lg" className="w-full">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/prescription`,
        },
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Account created. You can now log in.",
        });
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate("/prescription");
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "16px",
    }}>
      <div style={{
        background: "#fff",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        textAlign: "center",
        width: "100%",
        maxWidth: "400px",
      }}>
        <h2 style={{ marginTop: 0, color: "#333", fontSize: "clamp(1.5rem, 5vw, 2rem)" }}>
          {isSignUp ? "Create Account" : "Doctor's Login"}
        </h2>
        <p style={{ color: "#666", fontSize: "clamp(0.875rem, 3vw, 1rem)" }}>
          {isSignUp ? "Sign up to get started" : "Please enter credentials to edit."}
        </p>
        <form onSubmit={handleAuth} style={{ marginTop: "20px" }}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginBottom: "15px" }}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginBottom: "15px" }}
          />
          <Button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#0056b3",
              marginBottom: "10px",
            }}
          >
            {loading ? (isSignUp ? "Creating..." : "Logging in...") : (isSignUp ? "Sign Up" : "Login")}
          </Button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            background: "none",
            border: "none",
            color: "#0056b3",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isSignUp ? "Already have an account? Login" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
};

export default Login;

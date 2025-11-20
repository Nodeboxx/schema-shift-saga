import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Home } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      // After successful login, determine role-based redirect
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roleList = (roles || []).map((r: any) => r.role);

      if (roleList.includes("super_admin")) {
        navigate("/admin");
      } else if (roleList.includes("clinic_admin")) {
        navigate("/clinic");
      } else {
        navigate("/dashboard");
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
    }}>
      <div style={{
        background: "#fff",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        textAlign: "center",
        minWidth: "400px",
      }}>
        <h2 style={{ marginTop: 0, color: "#333" }}>
          Doctor's Login
        </h2>
        <p style={{ color: "#666" }}>
          Please enter credentials to edit.
        </p>
        <form onSubmit={handleLogin} style={{ marginTop: "20px" }}>
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
              marginBottom: "15px",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Home className="w-4 h-4" />
          Go to Homepage
        </Button>
      </div>
    </div>
  );
};

export default Login;

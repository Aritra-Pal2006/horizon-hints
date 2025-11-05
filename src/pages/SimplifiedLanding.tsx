import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Mail,
  Lock,
  User,
  Loader2,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SimplifiedLanding = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Welcome back! You're now logged in.");
        setShowAuthModal(false);
        navigate("/home");
      } else {
        await signUp(email, password, name);
        toast.success("Account created successfully! Welcome aboard.");
        setShowAuthModal(false);
        navigate("/home");
      }
    } catch (error: any) {
      toast.error(error.message || (isLogin ? "Failed to log in" : "Failed to create account"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome! You're now logged in with Google.");
      setShowAuthModal(false);
      // Navigate to home page after successful Google sign-in
      navigate("/home");
    } catch (error: any) {
      // Provide more specific error messages
      if (error.message) {
        toast.error(error.message);
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Google sign-in was cancelled. Please try again and complete the sign-in process.");
      } else if (error.code === 'auth/network-request-failed') {
        toast.error("Network error. Please check your internet connection and try again.");
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-blocked') {
        toast.error("Popup was blocked by your browser. Please allow popups for this site and try again.");
      } else {
        toast.error("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Horizon Hints
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12">
            Your AI-Powered Travel Companion
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8 py-6 text-lg"
              onClick={() => setShowAuthModal(true)}
            >
              <User className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </div>
        </motion.div>

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <Card className="p-6 backdrop-blur-xl bg-card/90 border-border">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {isLogin ? "Welcome Back" : "Join Horizon Hints"}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowAuthModal(false)}
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          className="pl-10"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-accent"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : isLogin ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Google
                  </Button>

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin
                        ? "Don't have an account? Sign Up"
                        : "Already have an account? Sign In"}
                    </button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedLanding;
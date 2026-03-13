
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Cpu,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignIn = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Google auth state (ADDED)
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      const errorMessage = typeof error === "string" ? error : (error && typeof error === "object" && "message" in error ? (error as Error).message : "Sign in failed");
      toast.error(errorMessage);
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
  };

  // ✅ Google Sign-In handler (ADDED)
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);

    const { error } = await signInWithGoogle();

    setGoogleLoading(false);

    if (error) {
      const errorMessage = typeof error === "string" ? error : (error && typeof error === "object" && "message" in error ? (error as Error).message : "Google sign-in failed");
      toast.error(errorMessage);
    } else {
      toast.success("Redirecting to Google...");
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">
                Ajashia
              </span>
              <span className="text-[10px] text-muted-foreground -mt-1 tracking-wider">
                TECH STORE
              </span>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`pl-12 text-white placeholder:text-white/60 ${
                    errors.email ? "border-destructive" : ""
                  }`}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`pl-12 text-white placeholder:text-white/60 ${
                    errors.password ? "border-destructive" : ""
                  }`}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
  size="lg"
  className="
    w-full
    bg-white
    text-gray-800
    hover:bg-gray-100
    border border-border
    flex items-center justify-center gap-3
    shadow-sm
  "
  onClick={handleGoogleAuth}
  disabled={googleLoading}
>
  {googleLoading ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
      Connecting to Google...
    </>
  ) : (
    <>
      {/* Google official logo */}
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.23 3.6l6.9-6.9C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.02 6.22C12.36 13.09 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.57-.14-3.09-.4-4.56H24v9.13h12.7c-.55 2.96-2.18 5.47-4.63 7.16l7.18 5.59c4.2-3.88 6.65-9.6 6.65-16.32z"/>
        <path fill="#FBBC05" d="M10.58 28.44c-.5-1.5-.78-3.1-.78-4.74s.28-3.24.78-4.74l-8.02-6.22C.92 16.46 0 20.12 0 24s.92 7.54 2.56 11.26l8.02-6.22z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.9-2.14 15.87-5.82l-7.18-5.59c-1.99 1.33-4.54 2.11-8.69 2.11-6.26 0-11.64-3.59-13.42-8.94l-8.02 6.22C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Continue with Google
    </>
  )}
</Button>


          <p className="text-center text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link
              to="/auth/sign-up"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 grid-pattern opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 text-center text-primary-foreground max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Cpu className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Start Building Today
          </h2>
          <p className="text-lg opacity-90">
            Access thousands of components, sensors, and development boards
            for your next IoT project.
          </p>

          <div className="flex justify-center gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm opacity-80">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm opacity-80">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm opacity-80">Support</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;

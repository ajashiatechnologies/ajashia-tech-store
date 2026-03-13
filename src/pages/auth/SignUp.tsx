import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Cpu,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Google auth state
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse({ name, email, password });
    if (!result.success) {
      const fieldErrors: {
        name?: string;
        email?: string;
        password?: string;
      } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "name") fieldErrors.name = err.message;
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(name, email, password);
    setIsLoading(false);

    if (error) {
      toast.error(typeof error === "string" ? error : (error as any).message || "Sign up failed");
    } else {
      toast.success(
        "Account created successfully! Please check your email to verify your account."
      );
      navigate("/auth/sign-in");
    }
  };

  // ✅ Google Sign-Up handler (ONLY ADDITION)
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);

    const { error } = await signInWithGoogle();

    setGoogleLoading(false);

    if (error) {
      toast.error(typeof error === "string" ? error : error.message || "Google sign-up failed");
    } else {
      toast.success("Redirecting to Google...");
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex">
      {/* Left Side - Visual */}
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
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg opacity-90">
            Create an account and get access to exclusive deals, early product
            launches, and maker resources.
          </p>

          <div className="mt-12 space-y-4 text-left">
            {[
              "Free shipping on orders over $50",
              "Exclusive member discounts",
              "Early access to new products",
              "Priority customer support",
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
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
            Create an account
          </h1>
          <p className="text-muted-foreground mb-8">
            Start your maker journey today
          </p>

          {/* ✅ FORM UNCHANGED */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Full Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={`pl-12 text-white placeholder:text-white/60 ${
                    errors.name ? "border-destructive" : ""
                  }`}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name}
                </p>
              )}
            </div>

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
              <label className="text-sm font-medium text-foreground mb-2 block">
                Password
              </label>
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

              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.met ? "bg-green-500" : "bg-muted"
                      }`}
                    >
                      {req.met && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={
                        req.met
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
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
        Google
    </>
  )}
</Button>

          <p className="text-center text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link
              to="/auth/sign-in"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;

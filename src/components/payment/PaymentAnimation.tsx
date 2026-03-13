import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Check, Loader2, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentAnimationProps {
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentStep = "form" | "processing" | "success";

export const PaymentAnimation = ({ amount, onSuccess, onCancel }: PaymentAnimationProps) => {
  const [step, setStep] = useState<PaymentStep>("form");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const handleSubmit = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-4"
      >
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-border rounded-3xl p-8 shadow-2xl"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
                  <CreditCard className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Secure Payment</h2>
                <p className="text-muted-foreground mt-1">Enter your card details</p>
              </div>

              {/* Amount Display */}
              <div className="text-center mb-8 p-4 rounded-xl bg-muted/50">
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-3xl font-bold text-foreground">${amount.toFixed(2)}</div>
              </div>

              {/* Card Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Card Number</label>
                  <div className="relative">
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className="pl-12"
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Expiry</label>
                    <Input
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">CVV</label>
                    <Input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="123"
                      type="password"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secured by 256-bit SSL encryption</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3}
                >
                  Pay ${amount.toFixed(2)}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border rounded-3xl p-12 shadow-2xl text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center mb-6 shadow-glow"
              >
                <Loader2 className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Processing Payment</h2>
              <p className="text-muted-foreground">Please wait while we process your payment...</p>
              
              {/* Progress Bar */}
              <div className="mt-8 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full gradient-primary"
                />
              </div>

              {/* Security Info */}
              <div className="flex items-center justify-center gap-4 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>Encrypted</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border rounded-3xl p-12 shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-lg"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Check className="w-12 h-12 text-white" />
                </motion.div>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                Payment Successful!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground"
              >
                Thank you for your purchase
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-xl bg-green-500/10 text-green-500"
              >
                <div className="text-sm">Amount Paid</div>
                <div className="text-2xl font-bold">${amount.toFixed(2)}</div>
              </motion.div>

              {/* Confetti Effect */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 1, 
                    y: 0, 
                    x: 0,
                    scale: 1 
                  }}
                  animate={{ 
                    opacity: 0, 
                    y: -200 - Math.random() * 100,
                    x: (Math.random() - 0.5) * 400,
                    scale: 0
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 0.2 + Math.random() * 0.3,
                    ease: "easeOut"
                  }}
                  className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: ["#813FF1", "#1E90FF", "#00FF00", "#FFD700", "#FF6B6B"][Math.floor(Math.random() * 5)]
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

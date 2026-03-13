import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/context/AuthProvider";
import { ProfileProvider } from "./context/ProfileProvider.tsx";


createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ProfileProvider>
      <App />
    </ProfileProvider>
    
    
  </AuthProvider>
);

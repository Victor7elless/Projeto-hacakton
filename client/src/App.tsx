import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DocumentProvider } from "./contexts/DocumentContext";
import { StudentProvider } from "./contexts/StudentContext";
import { Header } from "./components/layout/Header";
import { useEffect } from "react";

// Pages
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import UploadDocuments from "./pages/UploadDocuments";
import AdminDashboard from "./pages/AdminDashboard";
import SearchDocuments from "./pages/SearchDocuments";
import AdminStudents from "./pages/AdminStudents";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ 
  component: Component, 
  allowedTypes 
}: { 
  component: React.ComponentType, 
  allowedTypes?: ("student" | "admin")[] 
}) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    } else if (allowedTypes && user && !allowedTypes.includes(user.type)) {
      // Redirect to correct dashboard if trying to access unauthorized area
      setLocation(user.type === "admin" ? "/admin/dashboard" : "/student/dashboard");
    }
  }, [isAuthenticated, user, allowedTypes, setLocation]);

  if (!isAuthenticated || (allowedTypes && user && !allowedTypes.includes(user.type))) {
    return null;
  }

  return <Component />;
}

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Header 
        userType={user?.type} 
        userName={user?.name} 
        onLogout={logout} 
      />
      
      <main className="flex-1 container py-8">
        <Switch>
          {/* Public Route */}
          <Route path="/" component={Login} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard">
            <ProtectedRoute component={StudentDashboard} allowedTypes={["student"]} />
          </Route>
          <Route path="/upload">
            <ProtectedRoute component={UploadDocuments} allowedTypes={["student"]} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/dashboard">
            <ProtectedRoute component={AdminDashboard} allowedTypes={["admin"]} />
          </Route>
          <Route path="/admin/search">
            <ProtectedRoute component={SearchDocuments} allowedTypes={["admin"]} />
          </Route>
          <Route path="/admin/students">
            <ProtectedRoute component={AdminStudents} allowedTypes={["admin"]} />
          </Route>

          {/* Fallback */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <StudentProvider>
            <DocumentProvider>
              <Toaster position="top-right" richColors />
              <AppContent />
            </DocumentProvider>
          </StudentProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;

import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userType?: "student" | "admin" | null;
  userName?: string;
  onLogout?: () => void;
}

export function Header({ userType, userName, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Gradient Top Bar */}
      <div className="h-1 w-full bg-gradient-brand" />
      
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={userType === "admin" ? "/admin/dashboard" : "/student/dashboard"}>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                SD
              </div>
              <span className="hidden font-bold sm:inline-block text-lg tracking-tight">
                Sistema de Documentos
              </span>
            </div>
          </Link>
        </div>

        {userType && (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {userType === "student" ? (
                <>
                  <Link href="/student/dashboard">
                    <a className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/student/dashboard" ? "text-primary" : "text-muted-foreground")}>
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/upload">
                    <a className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/upload" ? "text-primary" : "text-muted-foreground")}>
                      Enviar Documentos
                    </a>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/admin/dashboard">
                    <a className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/admin/dashboard" ? "text-primary" : "text-muted-foreground")}>
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/admin/students">
                    <a className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/admin/students" ? "text-primary" : "text-muted-foreground")}>
                      Alunos
                    </a>
                  </Link>
                  <Link href="/admin/search">
                    <a className={cn("text-sm font-medium transition-colors hover:text-primary", location === "/admin/search" ? "text-primary" : "text-muted-foreground")}>
                      Documentos
                    </a>
                  </Link>
                </>
              )}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm text-right">
                <p className="font-medium leading-none">{userName}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{userType === "student" ? "Matriculado" : "Secretaria"}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} title="Sair">
                <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive transition-colors" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && userType && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-4 animate-in slide-in-from-top-5">
          <nav className="flex flex-col gap-4">
            {userType === "student" ? (
              <>
                <Link href="/student/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <a className={cn("flex items-center p-2 rounded-md hover:bg-accent", location === "/student/dashboard" ? "bg-accent" : "")}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/upload" onClick={() => setIsMenuOpen(false)}>
                  <a className={cn("flex items-center p-2 rounded-md hover:bg-accent", location === "/upload" ? "bg-accent" : "")}>
                    Enviar Documentos
                  </a>
                </Link>
              </>
            ) : (
              <>
                <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <a className={cn("flex items-center p-2 rounded-md hover:bg-accent", location === "/admin/dashboard" ? "bg-accent" : "")}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/admin/students" onClick={() => setIsMenuOpen(false)}>
                  <a className={cn("flex items-center p-2 rounded-md hover:bg-accent", location === "/admin/students" ? "bg-accent" : "")}>
                    Alunos
                  </a>
                </Link>
                <Link href="/admin/search" onClick={() => setIsMenuOpen(false)}>
                  <a className={cn("flex items-center p-2 rounded-md hover:bg-accent", location === "/admin/search" ? "bg-accent" : "")}>
                    Documentos
                  </a>
                </Link>
              </>
            )}
          </nav>
          <div className="border-t border-border pt-4 flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userType === "student" ? "Matriculado" : "Secretaria"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

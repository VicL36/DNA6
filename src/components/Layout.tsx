import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Mic,
  History,
  LogOut,
  Menu,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Rocket
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User as UserEntity } from "@/entities/User";
import { AnalysisSession } from "@/entities/all";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Nova Análise",
    url: createPageUrl("Analysis"),
    icon: Mic,
  },
  {
    title: "Histórico",
    url: createPageUrl("History"),
    icon: History,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [currentSession, setCurrentSession] = React.useState(null);
  const [userStats, setUserStats] = React.useState({
    totalSessions: 0,
    completedSessions: 0,
    totalResponses: 0,
    totalAudioTime: 0
  });

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);

      // Buscar sessão ativa
      const activeSessions = await AnalysisSession.filter(
        { user_email: currentUser.email, status: 'active' },
        '-created_at',
        1
      );
      
      if (activeSessions.length > 0) {
        setCurrentSession(activeSessions[0]);
      }

      // Carregar estatísticas do usuário
      setUserStats({
        totalSessions: currentUser.total_sessions || 0,
        completedSessions: currentUser.completed_sessions || 0,
        totalResponses: currentUser.total_responses || 0,
        totalAudioTime: currentUser.total_audio_time || 0
      });
    } catch (error) {
      console.log("User not authenticated");
    }
  };

  const handleLogout = async () => {
    try {
      await UserEntity.logout();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getSessionProgress = () => {
    if (!currentSession) return 0;
    return Math.round((currentSession.current_question / currentSession.total_questions) * 100);
  };

  const getSessionStatusIcon = () => {
    if (!currentSession) return null;
    
    switch (currentSession.status) {
      case 'active':
        return <Play className="w-4 h-4 text-neon-blue" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-neon-orange" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-dark-bg neural-bg">
        <Sidebar className="border-r border-white/10 glass-morphism">
          <SidebarHeader className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-orange to-neon-blue rounded-xl animate-pulse-orange"></div>
                <div className="absolute inset-1 bg-dark-surface rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="DNA UP Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-blue rounded-full flex items-center justify-center">
                  <Rocket className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-xl text-text-primary text-glow-orange">DNA UP</h2>
                <p className="text-xs text-neon-blue font-medium">Deep Narrative Analysis</p>
              </div>
            </div>
          </SidebarHeader>
         
          <SidebarContent className="p-3">
            {/* Progresso da Sessão Atual */}
            {currentSession && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-3">
                  Sessão Atual
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-4 py-3 space-y-4">
                    <div className="metallic-elevated rounded-xl p-4 neon-border-blue">
                      <div className="flex items-center gap-2 mb-3">
                        {getSessionStatusIcon()}
                        <span className="text-sm font-semibold text-text-primary">
                          Análise em Andamento
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-text-secondary mb-1">
                            <span>Progresso</span>
                            <span>{getSessionProgress()}%</span>
                          </div>
                          <Progress 
                            value={getSessionProgress()} 
                            className="h-2 bg-dark-surface progress-neon"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-dark-surface/60 rounded-lg neon-border-blue">
                            <div className="font-semibold text-neon-blue">
                              {currentSession.current_question}
                            </div>
                            <div className="text-text-muted">Atual</div>
                          </div>
                          <div className="text-center p-2 bg-dark-surface/60 rounded-lg neon-border-orange">
                            <div className="font-semibold text-neon-orange">
                              {currentSession.total_questions - currentSession.current_question}
                            </div>
                            <div className="text-text-muted">Restantes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Navegação */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-3">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-dark-elevated hover:text-neon-orange transition-all duration-300 rounded-xl mb-1 group ${
                          location.pathname === item.url
                            ? 'bg-gradient-to-r from-neon-orange to-neon-blue text-white shadow-neon-orange'
                            : 'text-text-secondary hover:neon-border-orange'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                            location.pathname === item.url ? 'text-white' : ''
                          }`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Estatísticas Pessoais */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 py-3">
                Suas Estatísticas
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="metallic-surface rounded-lg p-3 neon-border-blue">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">Sessões Completas</span>
                      <span className="font-bold text-neon-blue text-glow-blue">{userStats.completedSessions}</span>
                    </div>
                  </div>
                  
                  <div className="metallic-surface rounded-lg p-3 neon-border-orange">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">Respostas Gravadas</span>
                      <span className="font-bold text-neon-orange text-glow-orange">{userStats.totalResponses}</span>
                    </div>
                  </div>
                  
                  <div className="metallic-surface rounded-lg p-3 neon-border-blue">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">Tempo Total</span>
                      <span className="font-bold text-neon-blue text-glow-blue">
                        {Math.round(userStats.totalAudioTime / 60)}min
                      </span>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/10 p-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 metallic-surface rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-neon-orange to-neon-blue rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm truncate">
                      {user.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-text-secondary hover:text-red-400 hover:border-red-400/30 bg-transparent border-white/20"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="text-center p-3">
                <p className="text-sm text-text-secondary">Carregando...</p>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-dark-surface/80 backdrop-blur-sm border-b border-white/10 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-dark-elevated p-2 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <img 
                  src="/logo.png" 
                  alt="DNA UP Logo" 
                  className="w-6 h-6 object-contain"
                />
                <h1 className="text-xl font-bold text-text-primary">DNA UP</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
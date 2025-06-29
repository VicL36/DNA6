import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Brain,
  LayoutDashboard,
  Mic,
  History,
  Settings,
  LogOut,
  Menu,
  Clock,
  CheckCircle,
  Play,
  Pause
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
        '-created_date',
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
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-amber-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200 bg-white/90 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-900">DNA Platform</h2>
                <p className="text-xs text-amber-600 font-medium">Deep Narrative Analysis</p>
              </div>
            </div>
          </SidebarHeader>
         
          <SidebarContent className="p-3">
            {/* Progresso da Sessão Atual */}
            {currentSession && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                  Sessão Atual
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-4 py-3 space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        {getSessionStatusIcon()}
                        <span className="text-sm font-semibold text-slate-700">
                          Análise em Andamento
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Progresso</span>
                            <span>{getSessionProgress()}%</span>
                          </div>
                          <Progress 
                            value={getSessionProgress()} 
                            className="h-2 bg-slate-200"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-white/60 rounded-lg">
                            <div className="font-semibold text-blue-600">
                              {currentSession.current_question}
                            </div>
                            <div className="text-slate-500">Atual</div>
                          </div>
                          <div className="text-center p-2 bg-white/60 rounded-lg">
                            <div className="font-semibold text-slate-700">
                              {currentSession.total_questions - currentSession.current_question}
                            </div>
                            <div className="text-slate-500">Restantes</div>
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
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 rounded-xl mb-1 group ${
                          location.pathname === item.url
                            ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white shadow-lg'
                            : 'text-slate-600'
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
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Suas Estatísticas
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">Sessões Completas</span>
                      <span className="font-bold text-emerald-600">{userStats.completedSessions}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">Respostas Gravadas</span>
                      <span className="font-bold text-purple-600">{userStats.totalResponses}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">Tempo Total</span>
                      <span className="font-bold text-amber-600">
                        {Math.round(userStats.totalAudioTime / 60)}min
                      </span>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {user.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-slate-600 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="text-center p-3">
                <p className="text-sm text-slate-500">Carregando...</p>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <h1 className="text-xl font-bold text-slate-900">DNA Platform</h1>
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
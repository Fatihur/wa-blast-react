import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  Info
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Koneksi', href: '/whatsapp', icon: MessageSquare },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Blast Message', href: '/blast', icon: Send },
  { name: 'Campaigns', href: '/campaigns', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings }
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="flex h-screen overflow-hidden">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 transform bg-card/95 backdrop-blur-sm border-r shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          collapsed ? "w-20" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-20 px-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
              {!collapsed ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">WA Blast</h1>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg mx-auto">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex hover:bg-primary/10 transition-colors"
                  onClick={() => setCollapsed(!collapsed)}
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                      collapsed ? "justify-center" : "",
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:scale-102 hover:shadow-sm"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="flex-1">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t bg-muted/30">
              {!collapsed ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 px-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-foreground">WA Blast App</p>
                      <p className="text-muted-foreground">Version 1.2.0</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Bulk WhatsApp messaging platform with advanced features
                      </p>
                    </div>
                  </div>
                  <div className="px-2 pt-2 border-t">
                    <p className="text-[10px] text-muted-foreground">
                      © 2024 WA Blast. All rights reserved.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center" title="WA Blast v1.2.0">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <header className="flex items-center justify-between h-20 px-6 border-b bg-card/50 backdrop-blur-sm shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-primary/10 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted/10 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

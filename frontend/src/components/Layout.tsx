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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const navigation = [
  { name: 'Beranda', href: '/', icon: LayoutDashboard },
  { name: 'Koneksi WA', href: '/whatsapp', icon: MessageSquare },
  { name: 'Kontak', href: '/contacts', icon: Users },
  { name: 'Kirim Pesan', href: '/blast', icon: Send },
  { name: 'Kampanye', href: '/campaigns', icon: MessageSquare },
  { name: 'Pengaturan', href: '/settings', icon: Settings }
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="flex h-screen overflow-hidden">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 transform bg-card/95 backdrop-blur-sm border-r shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          collapsed ? "w-20" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            <div className="flex items-center h-20 px-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
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
              <Button 
                variant="ghost" 
                onClick={() => setShowAboutModal(true)}
                className={cn(
                  "w-full gap-2 hover:bg-primary/10 transition-colors",
                  collapsed ? "justify-center px-0" : "justify-start"
                )}
              >
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {!collapsed && <span className="text-sm">Info Aplikasi</span>}
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <header className="flex items-center justify-between h-20 px-6 border-b bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-primary/10 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex hover:bg-primary/10 transition-colors"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
              >
                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            </div>
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
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Pengaturan Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
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

      {/* About App Modal */}
      <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              WA Blast App
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Versi</span>
                <span className="text-sm text-muted-foreground">1.2.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Tanggal Build</span>
                <span className="text-sm text-muted-foreground">2024</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Tentang Aplikasi</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                WA Blast adalah platform pengiriman pesan WhatsApp massal dengan fitur lengkap untuk mengelola kontak, mengirim kampanye, dan melacak pesan.
              </p>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Fitur Utama</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Pengiriman pesan massal dengan personalisasi</li>
                <li>Manajemen kontak & grup</li>
                <li>Pelacakan kampanye real-time</li>
                <li>Batas kuota harian</li>
                <li>Berbagai tipe pesan (teks, gambar, video, dokumen)</li>
              </ul>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Developer</h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Fatih</span>
                </p>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
                    </svg>
                    <span>WhatsApp: +62 877-5896-2661</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2m-.2 2C5.6 4 4 5.6 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8c1.99 0 3.6-1.61 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 011.25 1.25 1.25 1.25 0 01-1.25 1.25 1.25 1.25 0 01-1.25-1.25 1.25 1.25 0 011.25-1.25M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z"/>
                    </svg>
                    <a href="https://www.instagram.com/fatihur.r/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      Instagram: @fatihur.r
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    <a href="https://www.linkedin.com/in/fatihur-royyan-111a84190" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      LinkedIn
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <a href="https://www.facebook.com/fatihur.royyan.9" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                © 2024 WA Blast. Semua hak dilindungi.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Mail, Lock, CheckCircle, Send, Users } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.data.token, response.data.user);
      toast.success('Login berhasil!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Send, text: 'Kirim pesan massal dengan mudah' },
    { icon: Users, text: 'Kelola kontak & grup terorganisir' },
    { icon: CheckCircle, text: 'Lacak status pengiriman real-time' },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        
        {/* Decorative Circles */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                WA Blast
              </h1>
              <p className="text-sm text-muted-foreground">Platform Pesan Massal WhatsApp</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                Kirim Pesan WhatsApp<br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Ke Ribuan Kontak
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Platform terlengkap untuk mengelola kampanye WhatsApp blast Anda dengan mudah dan efisien.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-muted-foreground">
          © 2024 WA Blast. Semua hak dilindungi.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="p-8 lg:p-10">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  WA Blast
                </h1>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Selamat Datang</h2>
              <p className="text-muted-foreground">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-destructive" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-destructive" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sedang masuk...
                  </div>
                ) : (
                  'Masuk'
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-muted-foreground bg-white dark:bg-slate-900">atau</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Belum punya akun?{' '}
                  <Link 
                    to="/register" 
                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

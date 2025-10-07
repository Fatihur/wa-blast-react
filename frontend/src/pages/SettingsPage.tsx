import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, RefreshCw, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/user/profile');
      return response.data;
    }
  });

  const regenerateKeyMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/user/regenerate-api-key');
    },
    onSuccess: () => {
      toast.success('API Key berhasil dibuat ulang');
      window.location.reload();
    },
    onError: () => {
      toast.error('Gagal membuat ulang API key');
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pengaturan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Detail akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nama</Label>
            <Input value={profile?.name || ''} disabled />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={profile?.email || ''} disabled />
          </div>
          <div>
            <Label>Batas Kuota Harian</Label>
            <Input value={profile?.quotaLimit || 0} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>Gunakan kunci ini untuk integrasi API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={profile?.apiKey || ''}
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(profile?.apiKey || '')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="destructive"
            onClick={() => regenerateKeyMutation.mutate()}
            disabled={regenerateKeyMutation.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Buat Ulang API Key
          </Button>
          <p className="text-sm text-muted-foreground">
            Peringatan: Membuat ulang akan membatalkan API key Anda saat ini
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URL Dasar API</CardTitle>
          <CardDescription>Gunakan URL ini untuk permintaan API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(import.meta.env.VITE_API_URL || 'http://localhost:3001/api')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
          <CardDescription>Sesuaikan tampilan aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Mode Gelap</Label>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, QrCode, CheckCircle, XCircle } from 'lucide-react';

export default function WhatsAppPage() {
  const [showQR, setShowQR] = useState(false);
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const response = await api.get('/whatsapp/status');
      return response.data;
    },
    refetchInterval: 5000
  });

  const { data: qrCode, refetch: refetchQR } = useQuery({
    queryKey: ['whatsapp-qr'],
    queryFn: async () => {
      const response = await api.get('/whatsapp/qr');
      return response.data;
    },
    enabled: showQR,
    retry: false
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/whatsapp/disconnect');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] });
      toast.success('Terputus dari WhatsApp');
      setShowQR(false);
    },
    onError: () => {
      toast.error('Gagal memutuskan koneksi');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/whatsapp/restore');
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] });
      if (response.data.connected) {
        toast.success('Sesi berhasil dipulihkan!');
      } else {
        toast.info('Silakan pindai kode QR untuk terhubung');
        setShowQR(true);
      }
    },
    onError: () => {
      toast.error('Gagal memulihkan sesi');
    }
  });

  const handleConnect = () => {
    setShowQR(true);
    refetchQR();
  };

  const isConnected = status?.status === 'connected';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Koneksi WhatsApp</h1>

      <Card>
        <CardHeader>
          <CardTitle>Status Koneksi</CardTitle>
          <CardDescription>Kelola koneksi WhatsApp Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">
              {isConnected ? 'Terhubung' : 'Terputus'}
            </span>
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>

          {!isConnected && !showQR && (
            <div className="flex gap-2">
              <Button onClick={handleConnect}>
                <QrCode className="h-4 w-4 mr-2" />
                Hubungkan WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={() => restoreMutation.mutate()}
                disabled={restoreMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {restoreMutation.isPending ? 'Memulihkan...' : 'Pulihkan Sesi'}
              </Button>
            </div>
          )}

          {isConnected && (
            <Button variant="destructive" onClick={() => disconnectMutation.mutate()}>
              Putuskan Koneksi
            </Button>
          )}
        </CardContent>
      </Card>

      {showQR && !isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Pindai Kode QR</CardTitle>
            <CardDescription>
              Buka WhatsApp di ponsel Anda dan pindai kode QR ini untuk terhubung
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qrCode?.qr ? (
              <>
                <img src={qrCode.qr} alt="QR Code" className="w-64 h-64 border rounded-lg" />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Buka WhatsApp → Pengaturan → Perangkat Tertaut → Tautkan Perangkat
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetchQR()}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Perbarui Kode QR
                </Button>
              </>
            ) : (
              <div className="text-center">
                <p>Membuat kode QR...</p>
                <p className="text-sm text-muted-foreground mt-2">Mohon tunggu sebentar</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Petunjuk</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Klik tombol "Hubungkan WhatsApp" di atas</li>
            <li>Buka WhatsApp di ponsel Anda</li>
            <li>Buka Pengaturan → Perangkat Tertaut</li>
            <li>Ketuk "Tautkan Perangkat"</li>
            <li>Pindai kode QR yang ditampilkan di atas</li>
            <li>Tunggu hingga koneksi terbentuk</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

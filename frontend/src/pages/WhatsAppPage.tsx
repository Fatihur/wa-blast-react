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
      toast.success('Disconnected from WhatsApp');
      setShowQR(false);
    },
    onError: () => {
      toast.error('Failed to disconnect');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/whatsapp/restore');
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] });
      if (response.data.connected) {
        toast.success('Session restored successfully!');
      } else {
        toast.info('Please scan QR code to connect');
        setShowQR(true);
      }
    },
    onError: () => {
      toast.error('Failed to restore session');
    }
  });

  const handleConnect = () => {
    setShowQR(true);
    refetchQR();
  };

  const isConnected = status?.status === 'connected';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">WhatsApp Connection</h1>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Manage your WhatsApp connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
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
                Connect WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={() => restoreMutation.mutate()}
                disabled={restoreMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {restoreMutation.isPending ? 'Restoring...' : 'Restore Session'}
              </Button>
            </div>
          )}

          {isConnected && (
            <Button variant="destructive" onClick={() => disconnectMutation.mutate()}>
              Disconnect
            </Button>
          )}
        </CardContent>
      </Card>

      {showQR && !isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Open WhatsApp on your phone and scan this QR code to connect
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qrCode?.qr ? (
              <>
                <img src={qrCode.qr} alt="QR Code" className="w-64 h-64 border rounded-lg" />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Open WhatsApp → Settings → Linked Devices → Link a Device
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetchQR()}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh QR Code
                </Button>
              </>
            ) : (
              <div className="text-center">
                <p>Generating QR code...</p>
                <p className="text-sm text-muted-foreground mt-2">Please wait a moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Connect WhatsApp" button above</li>
            <li>Open WhatsApp on your phone</li>
            <li>Go to Settings → Linked Devices</li>
            <li>Tap on "Link a Device"</li>
            <li>Scan the QR code displayed above</li>
            <li>Wait for the connection to be established</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

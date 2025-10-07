import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getQRCode, getConnectionStatus, disconnectWhatsApp, restoreSession, getSession } from '../services/whatsapp';

const router = express.Router();

router.get('/qr', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const qr = await getQRCode(req.userId!);
    res.json({ qr });
  } catch (error: any) {
    console.error('QR generation error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate QR code' });
  }
});

router.get('/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const status = await getConnectionStatus(req.userId!);
    res.json({ status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

router.post('/disconnect', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await disconnectWhatsApp(req.userId!);
    res.json({ message: 'Disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

router.post('/restore', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await restoreSession(req.userId!);
    const session = await getSession(req.userId!);
    res.json({ 
      message: 'Session restore attempted',
      connected: !!session
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to restore session' });
  }
});

export default router;

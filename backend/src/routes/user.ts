import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        apiKey: true,
        quotaLimit: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        apiKey: true
      }
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/change-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.post('/regenerate-api-key', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const newApiKey = `wa_${uuidv4().replace(/-/g, '')}`;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { apiKey: newApiKey },
      select: { apiKey: true }
    });

    res.json({ message: 'API key regenerated', apiKey: user.apiKey });
  } catch (error) {
    res.status(500).json({ error: 'Failed to regenerate API key' });
  }
});

router.get('/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [totalContacts, totalMessages, successMessages, failedMessages] = await Promise.all([
      prisma.contact.count({ where: { userId: req.userId } }),
      prisma.message.count({ where: { userId: req.userId } }),
      prisma.message.count({ where: { userId: req.userId, status: 'success' } }),
      prisma.message.count({ where: { userId: req.userId, status: 'failed' } })
    ]);

    res.json({
      totalContacts,
      totalMessages,
      successMessages,
      failedMessages,
      pendingMessages: totalMessages - successMessages - failedMessages
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;

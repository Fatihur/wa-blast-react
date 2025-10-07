import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sendBulkMessages } from '../services/whatsapp';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

router.post('/', authenticateToken, upload.single('mediaFile'), async (req: AuthRequest, res) => {
  try {
    const { name, messageTemplate, contactIds, messageType = 'text' } = req.body;
    const mediaFile = req.file;

    if (!contactIds || JSON.parse(contactIds).length === 0) {
      return res.status(400).json({ error: 'Contact IDs are required' });
    }

    if (!messageTemplate || messageTemplate.trim() === '') {
      return res.status(400).json({ error: 'Message template is required' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId: req.userId!,
        name,
        messageTemplate
      }
    });

    const parsedContactIds = JSON.parse(contactIds);
    const mediaPath = mediaFile ? mediaFile.path : undefined;

    sendBulkMessages(req.userId!, campaign.id, parsedContactIds, messageTemplate, messageType, mediaPath).catch(error => {
      console.error('Campaign error:', error.message);
    });

    res.status(201).json({ 
      message: 'Campaign started successfully', 
      campaign,
      status: 'Messages are being sent in background. Check dashboard for progress.'
    });
  } catch (error: any) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create campaign' });
  }
});

router.get('/:id/progress', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: req.userId }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const total = campaign.totalSent;
    const success = campaign.totalSuccess;
    const failed = campaign.totalFailed;
    const pending = total > 0 ? 0 : 1;

    res.json({
      campaignId: id,
      total,
      success,
      failed,
      pending,
      percentage: total > 0 ? Math.round((success + failed) / total * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: req.userId }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const messages = await prisma.message.findMany({
      where: { userId: req.userId, createdAt: { gte: campaign.createdAt } },
      include: { contact: true }
    });

    res.json({ campaign, messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.campaign.delete({
      where: { id, userId: req.userId }
    });

    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;

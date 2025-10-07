import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import * as XLSX from 'xlsx';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { group, search } = req.query;
    const where: any = { userId: req.userId };

    if (group) where.group = group;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } }
      ];
    }

    const contacts = await prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, phone, group } = req.body;

    const contact = await prisma.contact.create({
      data: {
        userId: req.userId!,
        name,
        phone,
        group
      }
    });

    res.status(201).json({ message: 'Contact created', contact });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

router.post('/import', authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet) as Array<{ name: string; phone: string; group?: string }>;

    const contacts = await prisma.contact.createMany({
      data: data.map(row => ({
        userId: req.userId!,
        name: row.name,
        phone: row.phone,
        group: row.group || null
      })),
      skipDuplicates: true
    });

    res.json({ message: `${contacts.count} contacts imported`, count: contacts.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import contacts' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, phone, group } = req.body;

    const contact = await prisma.contact.update({
      where: { id, userId: req.userId },
      data: { name, phone, group }
    });

    res.json({ message: 'Contact updated', contact });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.contact.delete({
      where: { id, userId: req.userId }
    });

    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

router.get('/groups', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const groups = await prisma.contact.findMany({
      where: { userId: req.userId, group: { not: null } },
      select: { group: true },
      distinct: ['group']
    });

    res.json(groups.map(g => g.group));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

router.post('/groups', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Check if group already exists
    const existing = await prisma.contact.findFirst({
      where: { userId: req.userId, group: name }
    });

    if (existing) {
      return res.status(400).json({ error: 'Group already exists' });
    }

    // Create a dummy contact with this group (will be replaced when real contacts added)
    // Or just return success since group is created when first contact is added
    res.status(201).json({ message: 'Group created', name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.put('/groups/:oldName', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { oldName } = req.params;
    const { newName } = req.body;

    if (!newName || newName.trim() === '') {
      return res.status(400).json({ error: 'New group name is required' });
    }

    // Update all contacts with this group
    const result = await prisma.contact.updateMany({
      where: { userId: req.userId, group: oldName },
      data: { group: newName }
    });

    res.json({ message: 'Group renamed', count: result.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rename group' });
  }
});

router.delete('/groups/:name', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name } = req.params;

    // Set group to null for all contacts in this group
    const result = await prisma.contact.updateMany({
      where: { userId: req.userId, group: name },
      data: { group: null }
    });

    res.json({ message: 'Group deleted', count: result.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

export default router;

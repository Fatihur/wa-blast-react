import makeWASocket, { DisconnectReason, useMultiFileAuthState, WASocket } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';
import pino from 'pino';
import path from 'path';
import fs from 'fs';

const sessions = new Map<string, WASocket>();
const qrCodes = new Map<string, string>();

const logger = pino({ level: 'info' });

async function connectToWhatsApp(userId: string) {
  const authDir = path.join(__dirname, '../../auth_sessions', userId);
  
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger,
    browser: ['WA Blast', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const qrDataURL = await QRCode.toDataURL(qr);
      qrCodes.set(userId, qrDataURL);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      await prisma.session.updateMany({
        where: { userId },
        data: { status: 'disconnected' }
      });

      sessions.delete(userId);
      qrCodes.delete(userId);

      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(userId), 3000);
      }
    } else if (connection === 'open') {
      sessions.set(userId, sock);
      qrCodes.delete(userId);

      await prisma.session.upsert({
        where: { userId },
        update: { status: 'connected', sessionData: JSON.stringify({ connected: true }) },
        create: { userId, status: 'connected', sessionData: JSON.stringify({ connected: true }) }
      });

      console.log(`✅ WhatsApp connected for user: ${userId}`);
    }
  });

  return sock;
}

export async function getQRCode(userId: string): Promise<string> {
  if (sessions.has(userId)) {
    throw new Error('Already connected');
  }

  if (!qrCodes.has(userId)) {
    connectToWhatsApp(userId);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (!qrCodes.has(userId)) {
      throw new Error('QR code not generated yet, please try again');
    }
  }

  return qrCodes.get(userId)!;
}

export async function getConnectionStatus(userId: string): Promise<string> {
  const session = await prisma.session.findUnique({
    where: { userId }
  });

  if (sessions.has(userId)) {
    return 'connected';
  }

  return session?.status || 'disconnected';
}

export async function disconnectWhatsApp(userId: string): Promise<void> {
  const sock = sessions.get(userId);
  if (sock) {
    await sock.logout();
    sessions.delete(userId);
  }

  await prisma.session.updateMany({
    where: { userId },
    data: { status: 'disconnected' }
  });
}

function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/[^0-9]/g, '');
  
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.substring(1);
  } else if (!normalized.startsWith('62')) {
    normalized = '62' + normalized;
  }
  
  return normalized + '@s.whatsapp.net';
}

function getMimeType(filename: string): string {
  const path = require('path');
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export async function getSession(userId: string): Promise<WASocket | null> {
  return sessions.get(userId) || null;
}

export async function restoreSession(userId: string): Promise<void> {
  if (sessions.has(userId)) {
    console.log(`Session already exists for user: ${userId}`);
    return;
  }

  const session = await prisma.session.findUnique({
    where: { userId }
  });

  if (session && session.status === 'connected') {
    console.log(`Restoring session for user: ${userId}`);
    await connectToWhatsApp(userId);
  }
}

export async function sendBulkMessages(
  userId: string,
  campaignId: string,
  contactIds: string[],
  messageTemplate: string,
  messageType: string = 'text',
  mediaPath?: string
): Promise<void> {
  try {
    let sock = sessions.get(userId);

    if (!sock) {
      console.log('WhatsApp not connected, attempting to restore session...');
      await restoreSession(userId);
      sock = sessions.get(userId);
      
      if (!sock) {
        throw new Error('WhatsApp not connected. Please scan QR code first.');
      }
    }

    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds }, userId }
    });

    console.log(`Starting bulk send for campaign ${campaignId}: ${contacts.length} contacts`);

    // Read media file ONCE before loop to avoid re-reading for each contact
    let mediaBuffer: Buffer | undefined;
    if (mediaPath && messageType !== 'text') {
      const fs = require('fs');
      try {
        mediaBuffer = fs.readFileSync(mediaPath);
        console.log(`Media file loaded: ${mediaPath} (${mediaBuffer.length} bytes)`);
      } catch (error) {
        console.error(`Failed to read media file: ${mediaPath}`, error);
        throw new Error('Failed to read media file');
      }
    }

    for (const contact of contacts) {
      try {
        const personalizedMessage = messageTemplate.replace(/\{\{nama\}\}/g, contact.name).replace(/<[^>]*>/g, '');
        
        const jid = normalizePhoneNumber(contact.phone);
        console.log(`Sending to ${contact.name} (${jid})...`);
        
        if (messageType === 'text') {
          await sock.sendMessage(jid, { text: personalizedMessage });
        } else if (mediaBuffer) {
          const messageOptions: any = { caption: personalizedMessage };
          
          if (messageType === 'image') {
            messageOptions.image = mediaBuffer;
          } else if (messageType === 'video') {
            messageOptions.video = mediaBuffer;
          } else if (messageType === 'document') {
            messageOptions.document = mediaBuffer;
            messageOptions.fileName = require('path').basename(mediaPath!);
            messageOptions.mimetype = getMimeType(mediaPath!);
          }
          
          await sock.sendMessage(jid, messageOptions);
        } else {
          await sock.sendMessage(jid, { text: personalizedMessage });
        }

        await prisma.message.create({
          data: {
            userId,
            contactId: contact.id,
            content: personalizedMessage,
            type: messageType as any,
            status: 'success',
            sentAt: new Date()
          }
        });

        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            totalSent: { increment: 1 },
            totalSuccess: { increment: 1 }
          }
        });

        console.log(`✅ Sent to ${contact.name}`);

        const delay = 3000 + Math.random() * 3000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error: any) {
        console.error(`❌ Failed to send to ${contact.name}:`, error.message);
        
        await prisma.message.create({
          data: {
            userId,
            contactId: contact.id,
            content: personalizedMessage,
            type: 'text',
            status: 'failed'
          }
        });

        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            totalSent: { increment: 1 },
            totalFailed: { increment: 1 }
          }
        });
      }
    }

    console.log(`✅ Campaign ${campaignId} completed`);
  } catch (error: any) {
    console.error('Bulk send error:', error.message);
    throw error;
  }
}

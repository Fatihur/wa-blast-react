# ✅ Improvements v1.2.0 - Implementation Guide

## Status: 2/10 COMPLETED ⏳

### ✅ **Completed:**
1. ✅ **Collapse Sidebar** - Tombol collapse dengan state toggle
2. ✅ **Profile Dropdown** - Menu profile & logout di kanan atas

### 🔄 **In Progress / Pending:**

---

## 3. **Auto Format Nomor Telepon** 📱

**File:** `frontend/src/pages/ContactsPageNew.tsx`

**Add Function:**
```typescript
const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Convert 08xxx to 628xxx
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  // Add 62 if missing
  else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
};
```

**Update handleSaveContact:**
```typescript
const handleSaveContact = () => {
  const formattedPhone = formatPhoneNumber(newContact.phone);
  
  if (editContact) {
    updateContactMutation.mutate({ 
      id: editContact.id, 
      data: { ...newContact, phone: formattedPhone } 
    });
  } else {
    addContactMutation.mutate({ ...newContact, phone: formattedPhone });
  }
};
```

**Update Input onChange:**
```tsx
<Input
  id="phone"
  placeholder="08123456789 or 628123456789"
  value={newContact.phone}
  onChange={(e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNewContact({ ...newContact, phone: formatted });
  }}
  onBlur={(e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNewContact({ ...newContact, phone: formatted });
  }}
/>
```

---

## 4. **Hilangkan Tab di Kontak, Tambah Menu Grup** 📇

**Changes:**
- Remove Tabs component
- Add separate "Groups" page/section
- Keep contacts in simple table with filter dropdown

**File:** `frontend/src/pages/ContactsPageNew.tsx`

**Replace Tabs with:**
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>All Contacts</CardTitle>
      <div className="flex gap-2">
        <select
          className="px-3 py-2 border rounded-lg"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">All Groups</option>
          {groups?.map((group: string) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
        <Button variant="outline" asChild>
          <Link to="/groups">Manage Groups</Link>
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    {/* Contacts table */}
  </CardContent>
</Card>
```

---

## 5. **Fix Dokumen Terkirim ke Semua Nomor** 🐛

**Problem:** Loop tidak berjalan dengan benar untuk file documents

**File:** `backend/src/services/whatsapp.ts`

**Current Code Issue:**
```typescript
// Bug: variable scoping issue
for (const contact of contacts) {
  const fs = require('fs'); // WRONG: imported inside loop
  const messageOptions: any = { caption: personalizedMessage };
  
  if (messageType === 'document') {
    messageOptions.document = fs.readFileSync(mediaPath);
    // File read ONCE but sent multiple times uses same buffer
  }
}
```

**Fix:**
```typescript
import fs from 'fs';

// Read file ONCE outside loop
let mediaBuffer: Buffer | undefined;
if (mediaPath && messageType !== 'text') {
  mediaBuffer = fs.readFileSync(mediaPath);
}

for (const contact of contacts) {
  try {
    const personalizedMessage = messageTemplate.replace(/\{\{nama\}\}/g, contact.name).replace(/<[^>]*>/g, '');
    const jid = normalizePhoneNumber(contact.phone);
    
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
        messageOptions.fileName = path.basename(mediaPath!);
        messageOptions.mimetype = getMimeType(mediaPath!);
      }
      
      await sock.sendMessage(jid, messageOptions);
    }
    
    // Save message record
    await prisma.message.create({...});
    
    // Update campaign
    await prisma.campaign.update({...});
    
    // Delay between messages
    const delay = 3000 + Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
  } catch (error: any) {
    console.error(`Failed to send to ${contact.name}:`, error.message);
    // Save failed message
  }
}
```

**Add getMimeType helper:**
```typescript
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
```

---

## 6. **Modal Pemilihan Kontak di Blast** 📋

**File:** `frontend/src/pages/BlastPageNew.tsx`

**Add State:**
```typescript
const [showContactModal, setShowContactModal] = useState(false);
```

**Replace inline contact selection with:**
```tsx
<Button 
  variant="outline" 
  onClick={() => setShowContactModal(true)}
  className="w-full"
>
  <Users className="h-4 w-4 mr-2" />
  Select Contacts ({selectedContacts.length})
</Button>

<Dialog open={showContactModal} onOpenChange={setShowContactModal}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
    <DialogHeader>
      <DialogTitle>Select Contacts</DialogTitle>
    </DialogHeader>
    <div className="flex items-center gap-2 mb-4">
      <Input 
        placeholder="Search contacts..."
        value={contactSearch}
        onChange={(e) => setContactSearch(e.target.value)}
      />
      <Button size="sm" onClick={selectAll}>Select All</Button>
    </div>
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {contacts?.filter((c: any) => 
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.phone.includes(contactSearch)
      ).map((contact: any) => (
        <label key={contact.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
          <input
            type="checkbox"
            checked={selectedContacts.includes(contact.id)}
            onChange={() => toggleContact(contact.id)}
          />
          <div className="flex-1">
            <p className="font-medium">{contact.name}</p>
            <p className="text-sm text-muted-foreground">{contact.phone}</p>
          </div>
          {contact.group && <Badge>{contact.group}</Badge>}
        </label>
      ))}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowContactModal(false)}>
        Cancel
      </Button>
      <Button onClick={() => setShowContactModal(false)}>
        Done ({selectedContacts.length} selected)
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 7. **Setting Delay Custom** ⏱️

**File:** `frontend/src/pages/BlastPageNew.tsx`

**Add State:**
```typescript
const [minDelay, setMinDelay] = useState(3);
const [maxDelay, setMaxDelay] = useState(6);
```

**Add UI in Campaign Details:**
```tsx
<div className="space-y-2">
  <Label>Delay Between Messages (seconds)</Label>
  <div className="grid grid-cols-2 gap-2">
    <div>
      <Input
        type="number"
        min="1"
        max="30"
        value={minDelay}
        onChange={(e) => setMinDelay(parseInt(e.target.value))}
        placeholder="Min"
      />
      <p className="text-xs text-muted-foreground mt-1">Min: 1-30s</p>
    </div>
    <div>
      <Input
        type="number"
        min="1"
        max="30"
        value={maxDelay}
        onChange={(e) => setMaxDelay(parseInt(e.target.value))}
        placeholder="Max"
      />
      <p className="text-xs text-muted-foreground mt-1">Max: 1-30s</p>
    </div>
  </div>
  <p className="text-xs text-muted-foreground">
    Random delay between {minDelay}-{maxDelay} seconds to avoid detection
  </p>
</div>
```

**Send to backend:**
```typescript
formData.append('minDelay', minDelay.toString());
formData.append('maxDelay', maxDelay.toString());
```

**Backend:** `backend/src/routes/campaigns.ts`
```typescript
const { minDelay = 3, maxDelay = 6 } = req.body;
sendBulkMessages(userId, campaignId, contactIds, messageTemplate, messageType, mediaPath, minDelay, maxDelay);
```

**Backend:** `backend/src/services/whatsapp.ts`
```typescript
export async function sendBulkMessages(
  userId: string,
  campaignId: string,
  contactIds: string[],
  messageTemplate: string,
  messageType: string = 'text',
  mediaPath?: string,
  minDelay: number = 3,
  maxDelay: number = 6
): Promise<void> {
  // ... in loop ...
  const delayMs = (minDelay * 1000) + Math.random() * ((maxDelay - minDelay) * 1000);
  await new Promise(resolve => setTimeout(resolve, delayMs));
}
```

---

## 8. **Daily Quota Limit** 📊

**Backend:** `backend/src/routes/campaigns.ts`

**Add before sendBulkMessages:**
```typescript
// Check daily quota
const today = new Date();
today.setHours(0, 0, 0, 0);

const sentToday = await prisma.message.count({
  where: {
    userId: req.userId,
    createdAt: { gte: today },
    status: { in: ['success', 'pending'] }
  }
});

const user = await prisma.user.findUnique({
  where: { id: req.userId },
  select: { quotaLimit: true }
});

if (sentToday + parsedContactIds.length > user!.quotaLimit) {
  return res.status(403).json({ 
    error: `Daily quota exceeded. You have sent ${sentToday}/${user!.quotaLimit} messages today. 
            This campaign requires ${parsedContactIds.length} more messages.` 
  });
}
```

**Frontend:** Show quota in dashboard
```tsx
<Card>
  <CardHeader>
    <CardTitle>Daily Quota</CardTitle>
  </CardHeader>
  <CardContent>
    <Progress value={(stats.totalMessages / profile.quotaLimit) * 100} />
    <p className="text-sm text-muted-foreground mt-2">
      {stats.totalMessages} / {profile.quotaLimit} messages used today
    </p>
  </CardContent>
</Card>
```

---

## 9. **Pagination + Bulk Actions** 📄

**File:** `frontend/src/pages/ContactsPageNew.tsx`

**Add States:**
```typescript
const [page, setPage] = useState(1);
const [pageSize] = useState(20);
const [selectedIds, setSelectedIds] = useState<string[]>([]);
```

**Update Query:**
```typescript
const { data: contactsData } = useQuery({
  queryKey: ['contacts', searchTerm, page],
  queryFn: async () => {
    const response = await api.get(`/contacts?search=${searchTerm}&page=${page}&limit=${pageSize}`);
    return response.data;
  }
});
```

**Add Bulk Actions:**
```tsx
{selectedIds.length > 0 && (
  <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
    <span className="text-sm font-medium">{selectedIds.length} selected</span>
    <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
      Clear
    </Button>
    <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
      Delete Selected
    </Button>
    <Button size="sm" variant="outline" onClick={handleBulkExport}>
      Export Selected
    </Button>
  </div>
)}
```

**Add Pagination:**
```tsx
<div className="flex items-center justify-between mt-4">
  <div className="text-sm text-muted-foreground">
    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, contactsData.total)} of {contactsData.total}
  </div>
  <div className="flex gap-2">
    <Button 
      size="sm" 
      variant="outline" 
      onClick={() => setPage(p => Math.max(1, p - 1))}
      disabled={page === 1}
    >
      Previous
    </Button>
    <Button 
      size="sm" 
      variant="outline" 
      onClick={() => setPage(p => p + 1)}
      disabled={page * pageSize >= contactsData.total}
    >
      Next
    </Button>
  </div>
</div>
```

**Backend:** Update contacts endpoint
```typescript
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const { group, search, page = 1, limit = 20 } = req.query;
  
  const where: any = { userId: req.userId };
  if (group) where.group = group;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string } }
    ];
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.contact.count({ where })
  ]);

  res.json({ contacts, total, page: Number(page), limit: Number(limit) });
});
```

---

## 10. **Progress Bar Fixes** 🔧

**File:** `frontend/src/pages/BlastPageNew.tsx`

**Ensure proper polling:**
```typescript
useEffect(() => {
  if (!currentCampaignId) return;

  const interval = setInterval(async () => {
    try {
      const response = await api.get(`/campaigns/${currentCampaignId}/progress`);
      const data = response.data;
      
      setProgress(data);
      
      // Stop when 100% OR when total === success + failed
      if (data.total > 0 && (data.success + data.failed >= data.total)) {
        clearInterval(interval);
        toast.success(`Campaign completed! ${data.success} sent, ${data.failed} failed`);
        setCurrentCampaignId(null);
        setProgress(null);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      clearInterval(interval);
    }
  }, 2000); // Poll every 2 seconds

  return () => clearInterval(interval);
}, [currentCampaignId]);
```

---

## 🚀 Implementation Priority

1. ✅ Collapse Sidebar - DONE
2. ✅ Profile Dropdown - DONE
3. 🔧 **Auto Format Phone** - Critical (prevents errors)
4. 🐛 **Fix Document Sending** - Critical bug
5. 📊 **Quota Limit** - Important (prevents abuse)
6. ⏱️ **Custom Delay** - Important (avoids bans)
7. 📋 **Contact Modal** - UX improvement
8. 🔧 **Progress Bar Fix** - Important
9. 📄 **Pagination** - Performance
10. 📇 **Remove Tabs** - UI cleanup

---

## 📝 Quick Apply Script

Run these in order:

```bash
# 1. Install new dependencies
cd frontend && npm install @radix-ui/react-dropdown-menu

# 2. Apply remaining changes manually following guide above
# OR wait for automated implementation

# 3. Test
npm run dev
```

---

**Status:** 2/10 completed, 8 remaining
**Next:** Auto format phone + Fix document bug (highest priority)

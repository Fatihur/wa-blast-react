import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import RichTextEditor from '@/components/RichTextEditor';
import { Send, Image, Video, FileText, X, CheckCircle, XCircle, Clock, Users, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function BlastPageNew() {
  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'image' | 'video' | 'document'>('text');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [minDelay, setMinDelay] = useState(3);
  const [maxDelay, setMaxDelay] = useState(6);

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await api.get('/contacts');
      return response.data;
    }
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await api.get('/contacts/groups');
      return response.data;
    }
  });

  // Poll progress
  useEffect(() => {
    if (!currentCampaignId) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/campaigns/${currentCampaignId}/progress`);
        const data = response.data;
        setProgress(data);
        
        // Stop when all messages processed (success + failed >= total)
        if (data.total > 0 && (data.success + data.failed >= data.total)) {
          clearInterval(interval);
          toast.success(`Campaign completed! ${data.success} sent, ${data.failed} failed`);
          setTimeout(() => {
            setCurrentCampaignId(null);
            setProgress(null);
          }, 3000);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentCampaignId]);

  const sendBlastMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await api.post('/campaigns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: (response) => {
      toast.success(response.data.message || 'Campaign started!');
      setCurrentCampaignId(response.data.campaign.id);
      setCampaignName('');
      setMessage('');
      setSelectedContacts([]);
      setSelectedGroup('');
      setMediaFile(null);
      setMessageType('text');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to start campaign';
      toast.error(errorMessage);
    }
  });

  const handleSend = () => {
    if (!campaignName || !campaignName.trim()) {
      toast.error('Please enter campaign name');
      return;
    }

    if (!message || !message.trim()) {
      toast.error('Please enter message template');
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact');
      return;
    }

    const formData = new FormData();
    formData.append('name', campaignName.trim());
    formData.append('messageTemplate', message.trim());
    formData.append('contactIds', JSON.stringify(selectedContacts));
    formData.append('messageType', messageType);
    formData.append('minDelay', minDelay.toString());
    formData.append('maxDelay', maxDelay.toString());
    
    if (mediaFile) {
      formData.append('mediaFile', mediaFile);
    }

    sendBlastMutation.mutate(formData);
  };

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group);
    if (group) {
      const groupContacts = contacts?.filter((c: any) => c.group === group).map((c: any) => c.id) || [];
      setSelectedContacts(groupContacts);
    } else {
      setSelectedContacts([]);
    }
  };

  const toggleContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedContacts(contacts?.map((c: any) => c.id) || []);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Blast Message
        </h1>
        <p className="text-muted-foreground mt-1">Send bulk WhatsApp messages to your contacts</p>
      </div>

      {/* Progress Bar */}
      {currentCampaignId && progress && (
        <Card className="border-primary/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sending in progress...</h3>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {progress.percentage}%
                </Badge>
              </div>
              <Progress value={progress.percentage} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Success:</span>
                  <span className="font-semibold">{progress.success}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">Failed:</span>
                  <span className="font-semibold">{progress.failed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">{progress.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Campaign Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Configure your blast message campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campaign Name */}
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Promo Ramadan 2024"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            {/* Message Type */}
            <div className="space-y-2">
              <Label>Message Type</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant={messageType === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setMessageType('text');
                    setMediaFile(null);
                  }}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Text
                </Button>
                <Button
                  type="button"
                  variant={messageType === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageType('image')}
                  className="gap-2"
                >
                  <Image className="h-4 w-4" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant={messageType === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageType('video')}
                  className="gap-2"
                >
                  <Video className="h-4 w-4" />
                  Video
                </Button>
                <Button
                  type="button"
                  variant={messageType === 'document' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageType('document')}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  File
                </Button>
              </div>
            </div>

            {/* File Upload */}
            {messageType !== 'text' && (
              <div className="space-y-2">
                <Label htmlFor="media-file">Upload {messageType}</Label>
                <div className="flex gap-2">
                  <Input
                    id="media-file"
                    type="file"
                    accept={
                      messageType === 'image' ? 'image/*' :
                      messageType === 'video' ? 'video/*' :
                      '*/*'
                    }
                    onChange={handleFileSelect}
                  />
                  {mediaFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setMediaFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {mediaFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

            {/* Message Template */}
            <div className="space-y-2">
              <Label>Message Template</Label>
              <RichTextEditor
                content={message}
                onChange={setMessage}
                placeholder="Write your message here... Use {{nama}} for personalization"
              />
            </div>

            {/* Group Selection */}
            <div className="space-y-2">
              <Label>Select Group</Label>
              <select
                className="w-full p-2 border rounded-lg bg-background"
                value={selectedGroup}
                onChange={(e) => handleGroupSelect(e.target.value)}
              >
                <option value="">All Contacts</option>
                {groups?.map((group: string) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            {/* Delay Settings */}
            <div className="space-y-2">
              <Label>Delay Between Messages (seconds)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={minDelay}
                    onChange={(e) => setMinDelay(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
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
                    onChange={(e) => setMaxDelay(Math.max(1, Math.min(30, parseInt(e.target.value) || 6)))}
                    placeholder="Max"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Max: 1-30s</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Random delay between {minDelay}-{maxDelay} seconds to avoid detection
              </p>
            </div>

            {/* Send Button */}
            <Button 
              onClick={handleSend} 
              className="w-full gap-2 shadow-lg shadow-primary/30" 
              disabled={sendBlastMutation.isPending || selectedContacts.length === 0}
              size="lg"
            >
              <Send className="h-5 w-5" />
              {sendBlastMutation.isPending ? 'Starting Campaign...' : `Send to ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
            </Button>

            {selectedContacts.length > 0 && (
              <div className="text-sm text-muted-foreground space-y-1 p-4 bg-muted/30 rounded-lg">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Estimated time: ~{Math.ceil(selectedContacts.length * 4 / 60)} minutes
                </p>
                <p>💡 Messages will be sent with 3-6 seconds delay between each</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Selection - Button to open modal */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Select Contacts</CardTitle>
            <CardDescription>Choose recipients for your message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setShowContactModal(true)}
              className="w-full h-20 text-lg"
            >
              <Users className="h-5 w-5 mr-2" />
              {selectedContacts.length > 0 
                ? `${selectedContacts.length} Contact${selectedContacts.length > 1 ? 's' : ''} Selected`
                : 'Click to Select Contacts'}
            </Button>

            {selectedContacts.length > 0 && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">
                    {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedContacts([])}
                  >
                    Clear All
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click button above to change selection
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Selection Modal */}
        <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Contacts</DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or phone..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={selectAll}>
                Select All
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {contacts
                ?.filter((c: any) => 
                  c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                  c.phone.includes(contactSearch)
                )
                .map((contact: any) => (
                  <label
                    key={contact.id}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContact(contact.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{contact.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{contact.phone}</p>
                    </div>
                    {contact.group && (
                      <Badge variant="outline">{contact.group}</Badge>
                    )}
                  </label>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedContacts.length} of {contacts?.length || 0} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowContactModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowContactModal(false)}>
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

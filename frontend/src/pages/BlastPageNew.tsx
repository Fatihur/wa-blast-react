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
import { Send, Image, Video, FileText, X, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function BlastPageNew() {
  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'image' | 'video' | 'document'>('text');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);

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
        setProgress(response.data);
        
        // Stop polling when complete
        if (response.data.percentage >= 100) {
          clearInterval(interval);
          toast.success('Campaign completed!');
          setCurrentCampaignId(null);
        }
      } catch (error) {
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

        {/* Contact Selection */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Contacts</CardTitle>
                <CardDescription>Choose recipients for your message</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {contacts?.map((contact: any) => (
                <label
                  key={contact.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{contact.phone}</p>
                  </div>
                  {contact.group && (
                    <Badge variant="outline">{contact.group}</Badge>
                  )}
                </label>
              ))}
            </div>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-semibold text-center">
                Selected: {selectedContacts.length} / {contacts?.length || 0} contacts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

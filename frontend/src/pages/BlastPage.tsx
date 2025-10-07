import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';

export default function BlastPage() {
  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');

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

  const sendBlastMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/campaigns', data);
    },
    onSuccess: (response) => {
      toast.success(response.data.message || 'Campaign started! Messages are being sent.');
      toast.info(response.data.status || 'Check dashboard for progress.');
      setCampaignName('');
      setMessage('');
      setSelectedContacts([]);
      setSelectedGroup('');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to start campaign';
      toast.error(errorMessage);
      
      if (errorMessage.includes('not connected')) {
        toast.error('Please connect WhatsApp first!', {
          action: {
            label: 'Connect',
            onClick: () => window.location.href = '/whatsapp'
          }
        });
      }
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

    sendBlastMutation.mutate({
      name: campaignName.trim(),
      messageTemplate: message.trim(),
      contactIds: selectedContacts
    });
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Blast Message</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Promo Ramadan 2024"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="message">Message Template</Label>
              <textarea
                id="message"
                className="w-full min-h-[200px] p-3 border rounded-md bg-background"
                placeholder="Halo {{nama}}, kami ada promo spesial untuk Anda..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use {`{{nama}}`} to personalize with contact name
              </p>
            </div>

            <div>
              <Label>Select Group</Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedGroup}
                onChange={(e) => handleGroupSelect(e.target.value)}
              >
                <option value="">All Contacts</option>
                {groups?.map((group: string) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <Button 
              onClick={handleSend} 
              className="w-full" 
              disabled={sendBlastMutation.isPending || selectedContacts.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendBlastMutation.isPending ? 'Starting Campaign...' : `Send to ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
            </Button>
            
            {sendBlastMutation.isPending && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please wait, campaign is being started...
              </p>
            )}
            
            {selectedContacts.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p>⏱️ Estimated time: ~{Math.ceil(selectedContacts.length * 3.5 / 60)} minutes</p>
                <p>💡 Messages will be sent with 3-6 seconds delay between each</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Contacts</CardTitle>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {contacts?.map((contact: any) => (
                <label
                  key={contact.id}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                  {contact.group && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded">
                      {contact.group}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Selected: {selectedContacts.length} contacts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

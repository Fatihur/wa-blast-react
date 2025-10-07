import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Trash2, Edit, Users, Search } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  group: string | null;
}

export default function ContactsPageNew() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({ name: '', phone: '', group: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const queryClient = useQueryClient();

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', searchTerm],
    queryFn: async () => {
      const response = await api.get(`/contacts?search=${searchTerm}`);
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

  const addContactMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/contacts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Contact added successfully');
      setShowAddModal(false);
      setNewContact({ name: '', phone: '', group: '' });
    },
    onError: () => {
      toast.error('Failed to add contact');
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.put(`/contacts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Contact updated successfully');
      setEditContact(null);
    },
    onError: () => {
      toast.error('Failed to update contact');
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted');
    }
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/contacts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Contacts imported successfully');
    } catch (error) {
      toast.error('Failed to import contacts');
    }
  };

  const handleSaveContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      toast.error('Please fill name and phone');
      return;
    }

    const formattedPhone = formatPhoneNumber(newContact.phone);
    const contactData = { ...newContact, phone: formattedPhone };

    if (editContact) {
      updateContactMutation.mutate({ id: editContact.id, data: contactData });
    } else {
      addContactMutation.mutate(contactData);
    }
  };

  const openEditModal = (contact: Contact) => {
    setEditContact(contact);
    setNewContact({ name: contact.name, phone: contact.phone, group: contact.group || '' });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditContact(null);
    setNewContact({ name: '', phone: '', group: '' });
  };

  const filteredContacts = selectedGroup === 'all' 
    ? contacts 
    : contacts?.filter((c: Contact) => c.group === selectedGroup);

  const contactsByGroup = contacts?.reduce((acc: any, contact: Contact) => {
    const group = contact.group || 'Ungrouped';
    if (!acc[group]) acc[group] = [];
    acc[group].push(contact);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Contacts
          </h1>
          <p className="text-muted-foreground mt-1">Manage your WhatsApp contacts</p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="import-file" className="cursor-pointer">
            <Button variant="outline" className="gap-2" type="button">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          </label>
          <input
            id="import-file"
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={handleImport}
          />
          <Dialog open={showAddModal} onOpenChange={(open) => !open && closeModal()}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/30">
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editContact ? 'Edit Contact' : 'Add New Contact'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="08123456789 or 628123456789"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    onBlur={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setNewContact({ ...newContact, phone: formatted });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Will auto-format to: 628xxx
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group">Group (Optional)</Label>
                  <Input
                    id="group"
                    placeholder="Customer, Reseller, etc"
                    value={newContact.group}
                    onChange={(e) => setNewContact({ ...newContact, group: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button onClick={handleSaveContact} disabled={!newContact.name || !newContact.phone}>
                  {editContact ? 'Update' : 'Save'} Contact
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedGroup === 'all' ? 'all' : selectedGroup} onValueChange={setSelectedGroup}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            All Contacts
            <Badge variant="secondary">{contacts?.length || 0}</Badge>
          </TabsTrigger>
          {groups?.slice(0, 3).map((group: string) => (
            <TabsTrigger key={group} value={group} className="gap-2">
              {group}
              <Badge variant="secondary">
                {contacts?.filter((c: Contact) => c.group === group).length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Contacts Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Contacts
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading contacts...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts?.map((contact: Contact) => (
                      <TableRow key={contact.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                        <TableCell>
                          {contact.group ? (
                            <Badge variant="outline">{contact.group}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(contact)}
                              className="hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteContactMutation.mutate(contact.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Group Tabs */}
        {groups?.map((group: string) => (
          <TabsContent key={group} value={group} className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {group}
                  <Badge variant="secondary">
                    {contactsByGroup?.[group]?.length || 0} contacts
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactsByGroup?.[group]?.map((contact: Contact) => (
                      <TableRow key={contact.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(contact)}
                              className="hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteContactMutation.mutate(contact.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

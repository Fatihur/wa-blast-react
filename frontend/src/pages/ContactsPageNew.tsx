import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Trash2, Edit, Users, Search, FolderOpen } from 'lucide-react';

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
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editGroup, setEditGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [deleteGroupName, setDeleteGroupName] = useState<string | null>(null);
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

  const addGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      return await api.post('/contacts/groups', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created successfully');
      setShowGroupModal(false);
      setNewGroupName('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create group');
    }
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }) => {
      return await api.put(`/contacts/groups/${encodeURIComponent(oldName)}`, { newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Group renamed successfully');
      setShowGroupModal(false);
      setEditGroup(null);
      setNewGroupName('');
    },
    onError: () => {
      toast.error('Failed to rename group');
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      return await api.delete(`/contacts/groups/${encodeURIComponent(name)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Group deleted successfully');
      setDeleteGroupName(null);
    },
    onError: () => {
      toast.error('Failed to delete group');
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

  const handleSaveGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter group name');
      return;
    }

    if (editGroup) {
      updateGroupMutation.mutate({ oldName: editGroup, newName: newGroupName });
    } else {
      addGroupMutation.mutate(newGroupName);
    }
  };

  const openEditGroup = (group: string) => {
    setEditGroup(group);
    setNewGroupName(group);
    setShowGroupModal(true);
  };

  const closeGroupModal = () => {
    setShowGroupModal(false);
    setEditGroup(null);
    setNewGroupName('');
  };

  const filteredContacts = selectedGroup === 'all' 
    ? contacts 
    : contacts?.filter((c: Contact) => c.group === selectedGroup);

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
          <Button 
            className="gap-2 shadow-lg shadow-primary/30"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts" className="gap-2">
            <Users className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Groups
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          {/* Contacts Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {selectedGroup === 'all' ? 'All Contacts' : selectedGroup}
                  <Badge variant="secondary">{filteredContacts?.length || 0}</Badge>
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border rounded-md bg-background text-sm"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <option value="all">All Groups ({contacts?.length || 0})</option>
                    {groups?.map((group: string) => (
                      <option key={group} value={group}>
                        {group} ({contacts?.filter((c: Contact) => c.group === group).length || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading contacts...</p>
              ) : filteredContacts?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No contacts found</p>
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
                            <span className="text-muted-foreground text-sm">No group</span>
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

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Manage Groups
                </CardTitle>
                <Button 
                  onClick={() => setShowGroupModal(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Group
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!groups || groups.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No groups yet. Create a group to organize your contacts.
                    </p>
                    <Button 
                      onClick={() => setShowGroupModal(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create First Group
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group: string) => {
                      const groupCount = contacts?.filter((c: Contact) => c.group === group).length || 0;
                      return (
                        <Card key={group} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1">
                                  <h3 className="font-semibold text-lg">{group}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {groupCount} contact{groupCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-lg">
                                  {groupCount}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditGroup(group)}
                                  className="flex-1 gap-2"
                                >
                                  <Edit className="h-3 w-3" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteGroupName(group)}
                                  className="flex-1 gap-2 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Contact Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
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
                  <div className="relative">
                    <Input
                      id="group"
                      list="group-suggestions"
                      placeholder="Select or type new group name"
                      value={newContact.group}
                      onChange={(e) => setNewContact({ ...newContact, group: e.target.value })}
                      className="pr-10"
                    />
                    <datalist id="group-suggestions">
                      {groups?.map((group: string) => (
                        <option key={group} value={group} />
                      ))}
                    </datalist>
                    {newContact.group && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setNewContact({ ...newContact, group: '' })}
                      >
                        <span className="sr-only">Clear</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    )}
                  </div>
                  {groups && groups.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Available groups: {groups.slice(0, 3).join(', ')}
                      {groups.length > 3 && ` +${groups.length - 3} more`}
                    </p>
                  )}
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

      {/* Add/Edit Group Modal */}
      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editGroup ? 'Edit Group' : 'Add New Group'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="e.g., Customer, Reseller, VIP"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveGroup()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeGroupModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup} disabled={!newGroupName.trim()}>
              {editGroup ? 'Update' : 'Create'} Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <Dialog open={!!deleteGroupName} onOpenChange={(open) => !open && setDeleteGroupName(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Delete Group</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the group <span className="font-semibold text-foreground">"{deleteGroupName}"</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Contacts in this group will not be deleted, but they will no longer be associated with this group.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGroupName(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteGroupName && deleteGroupMutation.mutate(deleteGroupName)}
            >
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

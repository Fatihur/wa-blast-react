import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Trash2, Edit, Users, Search, FolderOpen, Check, ChevronDown, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  
  // Pagination & Bulk Actions
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showBulkGroupModal, setShowBulkGroupModal] = useState(false);
  const [bulkGroupName, setBulkGroupName] = useState('');
  
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

  // Bulk Actions
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return await Promise.all(ids.map(id => api.delete(`/contacts/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success(`${selectedContacts.length} kontak berhasil dihapus`);
      setSelectedContacts([]);
    },
    onError: () => {
      toast.error('Gagal menghapus kontak');
    }
  });

  const bulkAssignGroupMutation = useMutation({
    mutationFn: async ({ ids, group }: { ids: string[]; group: string }) => {
      return await Promise.all(ids.map(id => api.put(`/contacts/${id}`, { group })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success(`${selectedContacts.length} kontak berhasil dipindahkan ke grup`);
      setSelectedContacts([]);
      setShowBulkGroupModal(false);
      setBulkGroupName('');
    },
    onError: () => {
      toast.error('Gagal memindahkan kontak ke grup');
    }
  });

  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) return;
    if (confirm(`Hapus ${selectedContacts.length} kontak yang dipilih?`)) {
      bulkDeleteMutation.mutate(selectedContacts);
    }
  };

  const handleBulkAssignGroup = () => {
    if (!bulkGroupName.trim()) {
      toast.error('Pilih grup terlebih dahulu');
      return;
    }
    bulkAssignGroupMutation.mutate({ ids: selectedContacts, group: bulkGroupName });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedContacts?.map((c: Contact) => c.id) || [];
      setSelectedContacts(allIds);
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, id]);
    } else {
      setSelectedContacts(selectedContacts.filter(cid => cid !== id));
    }
  };

  const handleExport = () => {
    if (!filteredContacts || filteredContacts.length === 0) {
      toast.error('Tidak ada kontak untuk diekspor');
      return;
    }

    const csvContent = [
      ['Nama', 'Telepon', 'Grup'],
      ...filteredContacts.map((c: Contact) => [c.name, c.phone, c.group || ''])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kontak_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Kontak berhasil diekspor');
  };

  // Pagination
  const filteredContacts = selectedGroup === 'all' 
    ? contacts 
    : contacts?.filter((c: Contact) => c.group === selectedGroup);

  const totalItems = filteredContacts?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContacts = filteredContacts?.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedContacts([]);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setSelectedContacts([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Kontak
          </h1>
          <p className="text-muted-foreground mt-1">Kelola kontak WhatsApp Anda</p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="import-file" className="cursor-pointer">
            <Button variant="outline" className="gap-2" type="button">
              <Upload className="h-4 w-4" />
              Impor CSV
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
            Tambah Kontak
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts" className="gap-2">
            <Users className="h-4 w-4" />
            Kontak
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Grup
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          {/* Contacts Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {selectedGroup === 'all' ? 'Semua Kontak' : selectedGroup}
                    <Badge variant="secondary">{totalItems}</Badge>
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari kontak..."
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
                      <option value="all">Semua Grup ({contacts?.length || 0})</option>
                      {groups?.map((group: string) => (
                        <option key={group} value={group}>
                          {group} ({contacts?.filter((c: Contact) => c.group === group).length || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedContacts.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium">
                      {selectedContacts.length} kontak dipilih
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBulkGroupModal(true)}
                        className="gap-2"
                      >
                        <FolderOpen className="h-4 w-4" />
                        Pindah ke Grup
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Ekspor
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Memuat kontak...</p>
              ) : filteredContacts?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Tidak ada kontak</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedContacts.length === paginatedContacts?.length && paginatedContacts?.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Telepon</TableHead>
                        <TableHead>Grup</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedContacts?.map((contact: Contact) => (
                        <TableRow key={contact.id} className="hover:bg-muted/50">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedContacts.includes(contact.id)}
                              onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                          <TableCell>
                            {contact.group ? (
                              <Badge variant="outline">{contact.group}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Tanpa grup</span>
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

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Tampilkan</span>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>dari {totalItems} kontak</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-9 h-9"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Berikutnya
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Halaman {currentPage} dari {totalPages}
                    </div>
                  </div>
                </>
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
                  Kelola Grup
                </CardTitle>
                <Button 
                  onClick={() => setShowGroupModal(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Grup
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!groups || groups.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Belum ada grup. Buat grup untuk mengorganisir kontak Anda.
                    </p>
                    <Button 
                      onClick={() => setShowGroupModal(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Buat Grup Pertama
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
                                    {groupCount} kontak
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
                                  Ubah
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteGroupName(group)}
                                  className="flex-1 gap-2 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Hapus
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
                  {editContact ? 'Ubah Kontak' : 'Tambah Kontak Baru'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    placeholder="Nama Lengkap"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
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
                    Akan diformat otomatis: 628xxx
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group">Grup (Opsional)</Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        !newContact.group && "text-muted-foreground"
                      )}
                    >
                      <span className="truncate">
                        {newContact.group || "Pilih atau buat grup..."}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                    </button>
                    
                    {showGroupDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowGroupDropdown(false)}
                        />
                        <div className="absolute z-50 w-full mt-1 bg-popover rounded-md border shadow-md overflow-hidden">
                          <div className="p-2 border-b">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Cari atau buat baru..."
                                value={groupSearchTerm}
                                onChange={(e) => setGroupSearchTerm(e.target.value)}
                                className="pl-8 h-8"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto p-1">
                            {groupSearchTerm && !groups?.includes(groupSearchTerm) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setNewContact({ ...newContact, group: groupSearchTerm });
                                  setShowGroupDropdown(false);
                                  setGroupSearchTerm('');
                                }}
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                              >
                                <Plus className="h-4 w-4 text-primary" />
                                <span>Buat "<strong>{groupSearchTerm}</strong>"</span>
                              </button>
                            )}
                            
                            {groups && groups.length > 0 ? (
                              <>
                                {groups
                                  .filter((g: string) => 
                                    g.toLowerCase().includes(groupSearchTerm.toLowerCase())
                                  )
                                  .map((group: string) => (
                                    <button
                                      key={group}
                                      type="button"
                                      onClick={() => {
                                        setNewContact({ ...newContact, group });
                                        setShowGroupDropdown(false);
                                        setGroupSearchTerm('');
                                      }}
                                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                                    >
                                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                      <span className="flex-1 text-left">{group}</span>
                                      {newContact.group === group && (
                                        <Check className="h-4 w-4 text-primary" />
                                      )}
                                    </button>
                                  ))}
                                {groups.filter((g: string) => 
                                  g.toLowerCase().includes(groupSearchTerm.toLowerCase())
                                ).length === 0 && groupSearchTerm && (
                                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                    Grup tidak ditemukan
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                Belum ada grup. Ketik untuk membuat baru.
                              </div>
                            )}
                            
                            {newContact.group && (
                              <>
                                <div className="h-px bg-border my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewContact({ ...newContact, group: '' });
                                    setShowGroupDropdown(false);
                                    setGroupSearchTerm('');
                                  }}
                                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-destructive transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                  <span>Hapus pilihan</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {groups && groups.length > 0 && !showGroupDropdown && (
                    <p className="text-xs text-muted-foreground">
                      {groups.length} grup tersedia
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Batal
                </Button>
                <Button onClick={handleSaveContact} disabled={!newContact.name || !newContact.phone}>
                  {editContact ? 'Perbarui' : 'Simpan'} Kontak
                </Button>
              </DialogFooter>
            </DialogContent>
      </Dialog>

      {/* Add/Edit Group Modal */}
      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editGroup ? 'Ubah Grup' : 'Tambah Grup Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Nama Grup</Label>
              <Input
                id="groupName"
                placeholder="Contoh: Pelanggan, Reseller, VIP"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveGroup()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeGroupModal}>
              Batal
            </Button>
            <Button onClick={handleSaveGroup} disabled={!newGroupName.trim()}>
              {editGroup ? 'Perbarui' : 'Buat'} Grup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <Dialog open={!!deleteGroupName} onOpenChange={(open) => !open && setDeleteGroupName(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Hapus Grup</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus grup <span className="font-semibold text-foreground">"{deleteGroupName}"</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Kontak dalam grup ini tidak akan dihapus, tetapi tidak lagi terkait dengan grup ini.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGroupName(null)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteGroupName && deleteGroupMutation.mutate(deleteGroupName)}
            >
              Hapus Grup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Group Modal */}
      <Dialog open={showBulkGroupModal} onOpenChange={setShowBulkGroupModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Pindahkan ke Grup</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Pindahkan {selectedContacts.length} kontak yang dipilih ke grup:
            </p>
            <div className="space-y-2">
              <Label htmlFor="bulk-group">Pilih Grup</Label>
              <select
                id="bulk-group"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={bulkGroupName}
                onChange={(e) => setBulkGroupName(e.target.value)}
              >
                <option value="">-- Pilih Grup --</option>
                {groups?.map((group: string) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBulkGroupModal(false);
                setBulkGroupName('');
              }}
            >
              Batal
            </Button>
            <Button 
              onClick={handleBulkAssignGroup}
              disabled={!bulkGroupName.trim()}
            >
              Pindahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

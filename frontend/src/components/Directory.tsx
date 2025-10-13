import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { User, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { createNumber, listNumbers, PhoneNumber, PaginatedNumbers } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { Switch } from './ui/switch';

type Contact = { id: string; name: string; number: string };

interface DirectoryProps {
  onSelectContact: (c: Contact) => void;
}

const Directory: React.FC<DirectoryProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<PhoneNumber[]>([]);
  const [hasMoreContacts, setHasMoreContacts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactNumber, setNewContactNumber] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [newContactDesignation, setNewContactDesignation] = useState('');
  const [newContactProvider, setNewContactProvider] = useState('');
  const [newContactActive, setNewContactActive] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadNumbers = async (page = 1, limit = 20, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const result: PaginatedNumbers = await listNumbers(page, limit);

      if (append) {
        setContacts(prev => [...prev, ...result.numbers]);
      } else {
        setContacts(result.numbers);
      }

      setHasMoreContacts(result.pagination.hasNext);
      setCurrentPage(page);
    } catch (e: any) {
      setError(e?.message || 'Failed to load directory');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreContacts = () => {
    if (hasMoreContacts && !loadingMore) {
      loadNumbers(currentPage + 1, 20, true);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more when user scrolls to within 100px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMoreContacts();
    }
  };

  useEffect(() => {
    loadNumbers();
    // live updates via socket
    const socket = getSocket();
    const handler = () => loadNumbers(currentPage);
    socket.on('numbers:update', handler);
    return () => {
      socket.off('numbers:update', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectContact = (contact: PhoneNumber) => {
    onSelectContact({ id: contact.id, name: contact.name || contact.phone, number: contact.phone });
  };

  const handleAddContact = async () => {
    if (!newContactNumber) return;
    try {
      setError(null);
      const created = await createNumber({
        phone: newContactNumber,
        label: newContactName || null,
        name: newContactName || null,
        email: newContactEmail || null,
        address: newContactAddress || null,
        designation: newContactDesignation || null,
        provider: newContactProvider || null,
        active: newContactActive,
      });
      setContacts((prev) => [created, ...prev]);
      setNewContactName('');
      setNewContactNumber('');
      setNewContactEmail('');
      setNewContactAddress('');
      setNewContactDesignation('');
      setNewContactProvider('');
      setNewContactActive(true);
      setIsDialogOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to add number');
    }
  };

  return (
    <Card className="w-full h-full bg-neutral-50/10 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Directory</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="w-96">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">
                  Number
                </Label>
                <Input
                  id="number"
                  value={newContactNumber}
                  onChange={(e) => setNewContactNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={newContactAddress}
                  onChange={(e) => setNewContactAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="designation" className="text-right">
                  Designation
                </Label>
                <Input
                  id="designation"
                  value={newContactDesignation}
                  onChange={(e) => setNewContactDesignation(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="provider" className="text-right">
                  Provider
                </Label>
                <Input
                  id="provider"
                  value={newContactProvider}
                  onChange={(e) => setNewContactProvider(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="active"
                  checked={newContactActive}
                  onCheckedChange={setNewContactActive}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddContact}>Save contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto" onScroll={handleScroll}>
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 border rounded-lg mb-2 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleSelectContact(contact)}
            >
              <div className="flex items-center flex-1">
                <User className="h-5 w-5 mr-3 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {contact.name || contact.phone}
                  </div>
                  <div className="text-xs text-gray-500">{contact.phone}</div>
                  {contact.designation && (
                    <div className="text-xs text-blue-600 mt-1">
                      {contact.designation}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${contact.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {contact.active ? 'Active' : 'Inactive'}
                </span>
                <Button size="sm" variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  handleSelectContact(contact);
                }}>
                  Select
                </Button>
              </div>
            </div>
          ))}
          {loadingMore && (
            <div className="text-sm text-gray-500 text-center py-4">
              Loading more contacts...
            </div>
          )}
          {!hasMoreContacts && contacts.length > 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No more contacts to load
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Directory;

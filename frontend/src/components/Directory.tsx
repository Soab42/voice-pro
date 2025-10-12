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
import { createNumber, listNumbers, PhoneNumber } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { Switch } from './ui/switch';

type Contact = { id: string; name: string; number: string };

interface DirectoryProps {
  onSelectContact: (c: Contact) => void;
}

const Directory: React.FC<DirectoryProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
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

  const mapToContact = (n: PhoneNumber): Contact => ({
    id: n.id,
    name: n.name ?? n.phone,
    number: n.phone,
  });

  const loadNumbers = async () => {
    try {
      setLoading(true);
      setError(null);
      const nums = await listNumbers();
      setContacts(nums.map(mapToContact));
    } catch (e: any) {
      setError(e?.message || 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNumbers();
    // live updates via socket
    const socket = getSocket();
    const handler = () => loadNumbers();
    socket.on('numbers:update', handler);
    return () => {
      socket.off('numbers:update', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const newContact = mapToContact(created);
      setContacts((prev) => [newContact, ...prev]);
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
        <div className="space-y-2">
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <div>
                  <div>{contact.name}</div>
                  <div className="text-xs text-gray-500">{contact.number}</div>
                </div>
              </div>
              <Button size="sm" onClick={() => onSelectContact(contact)}>
                Select
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Directory;

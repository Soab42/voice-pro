import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
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
import { Switch } from './ui/switch';

const Numbers = () => {
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [newNumber, setNewNumber] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [newActive, setNewActive] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNumbers = async () => {
    try {
      setLoading(true);
      setError(null);
      const nums = await listNumbers();
      setNumbers(nums);
    } catch (e: any) {
      setError(e?.message || 'Failed to load numbers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNumbers();
  }, []);

  const handleAddNumber = async () => {
    if (!newNumber) return;
    try {
      setError(null);
      const created = await createNumber({
        phone: newNumber,
        label: newLabel || null,
        name: newName || null,
        email: newEmail || null,
        address: newAddress || null,
        designation: newDesignation || null,
        provider: newProvider || null,
        active: newActive,
      });
      setNumbers((prev) => [created, ...prev]);
      setNewNumber('');
      setNewLabel('');
      setNewName('');
      setNewEmail('');
      setNewAddress('');
      setNewDesignation('');
      setNewProvider('');
      setNewActive(true);
      setIsDialogOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to add number');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Phone Numbers</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Number
            </Button>
          </DialogTrigger>
          <DialogContent className="w-96">
            <DialogHeader>
              <DialogTitle>Add New Number</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">
                  Number
                </Label>
                <Input
                  id="number"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label" className="text-right">
                  Label
                </Label>
                <Input
                  id="label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="designation" className="text-right">
                  Designation
                </Label>
                <Input
                  id="designation"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="provider" className="text-right">
                  Provider
                </Label>
                <Input
                  id="provider"
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="active"
                  checked={newActive}
                  onCheckedChange={setNewActive}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddNumber}>Save number</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Number</th>
                  <th className="p-2 text-left">Label</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Active</th>
                  <th className="p-2 text-left">Added On</th>
                </tr>
              </thead>
              <tbody>
                {numbers.map((number) => (
                  <tr key={number.id} className="border-b">
                    <td className="p-2">{number.phone}</td>
                    <td className="p-2">{number.label}</td>
                    <td className="p-2">{number.name}</td>
                    <td className="p-2">{number.email}</td>
                    <td className="p-2">{number.active ? 'Yes' : 'No'}</td>
                    <td className="p-2">{new Date(number.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Numbers;

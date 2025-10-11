
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Phone } from 'lucide-react';

const queueData = [
  {
    id: 1,
    customerName: 'John Smith',
    waitTime: '02:30',
    issue: 'Billing inquiry',
    priority: 'High',
  },
  {
    id: 2,
    customerName: 'Emily Davis',
    waitTime: '01:45',
    issue: 'Technical support',
    priority: 'Medium',
  },
  {
    id: 3,
    customerName: 'Robert Wilson',
    waitTime: '01:15',
    issue: 'Product question',
    priority: 'Low',
  },
  {
    id: 4,
    customerName: 'Sarah Johnson',
    waitTime: '00:50',
    issue: 'Account update',
    priority: 'Medium',
  },
];

const Queue = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Call Queue</CardTitle>
          <CardDescription>Customers waiting for assistance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Wait Time</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queueData.map((call) => (
                <TableRow key={call.id}>
                  <TableCell>{call.customerName}</TableCell>
                  <TableCell>{call.waitTime}</TableCell>
                  <TableCell>{call.issue}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        call.priority === 'High'
                          ? 'bg-red-100 text-red-700'
                          : call.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }
                    >
                      {call.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">
                      <Phone className="mr-2 h-4 w-4" />
                      Answer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Queue;

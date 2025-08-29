import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { apiClient, Member, CreateMemberRequest } from '@/lib/api';
import { toast } from 'sonner';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  // Fetch members from API
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMembers({
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setMembers(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  // Fetch members when component mounts or filters change
  useEffect(() => {
    fetchMembers();
  }, [filterStatus, searchTerm]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingMember) {
        // Update existing member
        const response = await apiClient.updateMember(editingMember.id, formData);
        
        if (response.success && response.data) {
          setMembers(prev => prev.map(member => 
            member.id === editingMember.id ? response.data! : member
          ));
          toast.success('Member updated successfully!');
          setEditingMember(null);
        } else {
          toast.error(response.error || 'Failed to update member');
        }
      } else {
        // Create new member
        const newMemberData: CreateMemberRequest = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address || undefined,
          status: formData.status,
        };

        const response = await apiClient.createMember(newMemberData);
        
        if (response.success && response.data) {
          setMembers(prev => [...prev, response.data!]);
          toast.success('Member added successfully!');
        } else {
          toast.error(response.error || 'Failed to add member');
        }
      }
      
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', address: '', status: 'active' });
    } catch (error) {
      console.error('Error submitting member:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address || '',
      status: member.status,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.deleteMember(memberId);
      
      if (response.success) {
        setMembers(prev => prev.filter(member => member.id !== memberId));
        toast.success('Member deleted successfully!');
      } else {
        toast.error(response.error || 'Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingMember(null);
    setFormData({ name: '', email: '', phone: '', address: '', status: 'active' });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your youth ministry members
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Members Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Members List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner />
            ) : filteredMembers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No members found"
                description="Get started by adding your first member to the system."
                action={
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Total Paid</TableHead>
                    <TableHead className="hidden lg:table-cell">Owing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredMembers.map((member, index) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-gray-600 dark:text-gray-300">
                          {member.email}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-600 dark:text-gray-300">
                          {member.phone}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          GHS {member.total_paid.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className={member.total_owing > 0 ? 'text-red-600' : 'text-green-600'}>
                            GHS {member.total_owing.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(member)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(member.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Member Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </DialogTitle>
            <DialogDescription>
              {editingMember ? 'Update member information' : 'Fill in the details to add a new member'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-teal-600" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingMember ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  `${editingMember ? 'Update' : 'Add'} Member`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
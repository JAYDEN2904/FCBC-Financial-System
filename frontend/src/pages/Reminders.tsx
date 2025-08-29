import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, Send, Calendar, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { apiClient, Member } from '@/lib/api';
import { toast } from 'sonner';

interface ReminderSettings {
  autoReminders: boolean;
  reminderDay: number; // Day of month (15th for mid-month)
  preDueMessage: string;
  overdueMessage: string;
  smsProvider: string;
  fromNumber: string;
}

interface BulkReminderData {
  selectedMembers: string[];
  reminderType: 'pre-due' | 'overdue';
  customMessage: string;
  scheduleDate: string;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export function Reminders() {
  const [settings, setSettings] = useState<ReminderSettings>({
    autoReminders: true,
    reminderDay: 15, // Mid-month
    preDueMessage: 'Hi {memberName}, this is a reminder that your youth ministry dues of GHS {amount} ({monthCount} month{s}) are due. Please pay before month end. Thank you!',
    overdueMessage: 'Hi {memberName}, your youth ministry dues of GHS {amount} ({monthCount} month{s}) are overdue. Please settle your payment. God bless!',
    smsProvider: 'hubtel', // Ghanaian SMS provider
    fromNumber: '+233 50 123 4567', // Example Ghana number
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [bulkData, setBulkData] = useState<BulkReminderData>({
    selectedMembers: [],
    reminderType: 'pre-due',
    customMessage: '',
    scheduleDate: new Date().toISOString().split('T')[0],
  });

  // Fetch members from API
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMembers();
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

  useEffect(() => {
    fetchMembers();
  }, []);

  // Get members who owe money (mock calculation for now)
  const membersOwing = members.filter(member => member.total_owing > 0);

  // Mock SMS stats (since we don't have real SMS data yet)
  const smsStats = {
    totalSent: 0,
    delivered: 0,
    failed: 0,
    membersOwing: membersOwing.length,
  };

  const handleSendReminder = async (_memberId: string, _type: 'pre-due' | 'overdue') => {
    try {
      // This would integrate with a real SMS service
      toast.success('Reminder sent successfully!');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const handleBulkSend = async () => {
    try {
      // This would integrate with a real SMS service
      toast.success(`Reminders sent to ${bulkData.selectedMembers.length} members!`);
      setIsSendReminderOpen(false);
      setBulkData({
        selectedMembers: [],
        reminderType: 'pre-due',
        customMessage: '',
        scheduleDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error('Failed to send bulk reminders');
    }
  };

  const handleScheduleReminders = async () => {
    try {
      // This would integrate with a real scheduling service
      toast.success('Reminders scheduled successfully!');
      setIsScheduleOpen(false);
    } catch (error) {
      toast.error('Failed to schedule reminders');
    }
  };

  const previewMessage = (template: string, member: Member) => {
    return template
      .replace('{memberName}', member.name)
      .replace('{amount}', member.total_owing.toFixed(2))
      .replace('{monthCount}', '1')
      .replace('{s}', '');
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SMS Reminders</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage payment reminders for Ghana members
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button
            onClick={() => setIsSendReminderOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
        </div>
      </motion.div>

      {/* SMS Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsStats.totalSent}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{smsStats.delivered}</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{smsStats.failed}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members Owing</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsStats.membersOwing}</div>
            <p className="text-xs text-muted-foreground">Need reminders</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">SMS Templates</TabsTrigger>
            <TabsTrigger value="history">Reminder History</TabsTrigger>
          </TabsList>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Members Owing */}
            <Card>
              <CardHeader>
                <CardTitle>Members Owing ({membersOwing.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {membersOwing.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No members owing"
                    description="All members are up to date with their payments."
                  />
                ) : (
                  <div className="space-y-4">
                    {membersOwing.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            GHS {member.total_owing.toLocaleString()} owing
                          </p>
                          <p className="text-xs text-gray-500">{member.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(member.id, 'pre-due')}
                          >
                            Remind
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSendReminder(member.id, 'overdue')}
                          >
                            Overdue
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SMS Templates */}
            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pre-Due Reminder Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="preDueMessage">Message (160 characters max)</Label>
                    <Textarea
                      id="preDueMessage"
                      value={settings.preDueMessage}
                      onChange={(e) => setSettings(prev => ({ ...prev, preDueMessage: e.target.value }))}
                      className="min-h-[100px]"
                      maxLength={160}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {settings.preDueMessage.length}/160 characters
                    </p>
                  </div>
                  {membersOwing.length > 0 && (
                    <div>
                      <Label>Preview:</Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                        {previewMessage(settings.preDueMessage, membersOwing[0])}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overdue Reminder Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="overdueMessage">Message (160 characters max)</Label>
                    <Textarea
                      id="overdueMessage"
                      value={settings.overdueMessage}
                      onChange={(e) => setSettings(prev => ({ ...prev, overdueMessage: e.target.value }))}
                      className="min-h-[100px]"
                      maxLength={160}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {settings.overdueMessage.length}/160 characters
                    </p>
                  </div>
                  {membersOwing.length > 0 && (
                    <div>
                      <Label>Preview:</Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                        {previewMessage(settings.overdueMessage, membersOwing[0])}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Reminder History</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    icon={Bell}
                    title="No reminders sent yet"
                    description="Start sending reminders to see the history here."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>

      {/* Send Reminder Modal */}
      <Dialog open={isSendReminderOpen} onOpenChange={setIsSendReminderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Bulk Reminders</DialogTitle>
            <DialogDescription>
              Select members and send reminders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reminder Type</Label>
              <Select value={bulkData.reminderType} onValueChange={(value: 'pre-due' | 'overdue') => setBulkData(prev => ({ ...prev, reminderType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-due">Pre-Due Reminder</SelectItem>
                  <SelectItem value="overdue">Overdue Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Members</Label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {membersOwing.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.id}
                      checked={bulkData.selectedMembers.includes(member.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkData(prev => ({
                            ...prev,
                            selectedMembers: [...prev.selectedMembers, member.id]
                          }));
                        } else {
                          setBulkData(prev => ({
                            ...prev,
                            selectedMembers: prev.selectedMembers.filter(id => id !== member.id)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={member.id} className="text-sm">
                      {member.name} - GHS {member.total_owing}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendReminderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkSend} disabled={bulkData.selectedMembers.length === 0}>
              Send to {bulkData.selectedMembers.length} members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Reminders Modal */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Reminders</DialogTitle>
            <DialogDescription>
              Set up automatic reminder scheduling
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoReminders"
                checked={settings.autoReminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoReminders: checked }))}
              />
              <Label htmlFor="autoReminders">Enable automatic reminders</Label>
            </div>
            <div>
              <Label htmlFor="reminderDay">Reminder Day of Month</Label>
              <Select value={settings.reminderDay.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, reminderDay: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleReminders}>
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
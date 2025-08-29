import { Server as SocketIOServer } from 'socket.io';
import { supabase, REALTIME_CHANNELS } from '../config/supabase.js';
import { DashboardStats, Member, Payment, Donation, Expense, Reminder } from '../types/index.js';

// Setup real-time event handlers
export const setupRealtimeHandlers = (io: SocketIOServer): void => {
  console.log('Setting up real-time handlers...');

  // Members changes
  supabase
    .channel(REALTIME_CHANNELS.MEMBERS)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'members' 
      }, 
      (payload: any) => {
        console.log('Members change:', payload);
        io.to('admin-room').emit('members:changed', payload);
      }
    )
    .subscribe();

  // Payments changes
  supabase
    .channel(REALTIME_CHANNELS.PAYMENTS)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'payments' 
      }, 
      (payload: any) => {
        console.log('Payments change:', payload);
        io.to('admin-room').emit('payments:changed', payload);
        
        // Emit to specific user if they have a room
        if (payload.new?.member_id) {
          io.to(`user-${payload.new.member_id}`).emit('payment:received', payload);
        }
      }
    )
    .subscribe();

  // Donations changes
  supabase
    .channel(REALTIME_CHANNELS.DONATIONS)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'donations' 
      }, 
      (payload: any) => {
        console.log('Donations change:', payload);
        io.to('admin-room').emit('donations:changed', payload);
      }
    )
    .subscribe();

  // Expenses changes
  supabase
    .channel(REALTIME_CHANNELS.EXPENSES)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'expenses' 
      }, 
      (payload: any) => {
        console.log('Expenses change:', payload);
        io.to('admin-room').emit('expenses:changed', payload);
      }
    )
    .subscribe();

  // Reminders changes
  supabase
    .channel(REALTIME_CHANNELS.REMINDERS)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'reminders' 
      }, 
      (payload: any) => {
        console.log('Reminders change:', payload);
        io.to('admin-room').emit('reminders:changed', payload);
      }
    )
    .subscribe();

  // Dashboard updates (aggregated data)
  supabase
    .channel(REALTIME_CHANNELS.DASHBOARD)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'payments' 
      }, 
      async (payload: any) => {
        // Emit dashboard update when payments change
        io.to('admin-room').emit('dashboard:update', {
          type: 'payment',
          data: payload
        });
      }
    )
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'donations' 
      }, 
      async (payload: any) => {
        // Emit dashboard update when donations change
        io.to('admin-room').emit('dashboard:update', {
          type: 'donation',
          data: payload
        });
      }
    )
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'expenses' 
      }, 
      async (payload: any) => {
        // Emit dashboard update when expenses change
        io.to('admin-room').emit('dashboard:update', {
          type: 'expense',
          data: payload
        });
      }
    )
    .subscribe();

  console.log('Real-time handlers setup complete');
};

// Helper function to emit dashboard statistics update
export const emitDashboardUpdate = (io: SocketIOServer, stats: DashboardStats): void => {
  io.to('admin-room').emit('dashboard:stats', stats);
};

// Helper function to emit member-specific updates
export const emitMemberUpdate = (io: SocketIOServer, memberId: string, update: Partial<Member>): void => {
  io.to(`user-${memberId}`).emit('member:update', update);
  io.to('admin-room').emit('member:update', { memberId, update });
};

// Helper function to emit payment notifications
export const emitPaymentNotification = (io: SocketIOServer, memberId: string, payment: Payment): void => {
  io.to(`user-${memberId}`).emit('payment:notification', payment);
  io.to('admin-room').emit('payment:notification', { memberId, payment });
};

// Helper function to emit reminder notifications
export const emitReminderNotification = (io: SocketIOServer, memberId: string, reminder: Reminder): void => {
  io.to(`user-${memberId}`).emit('reminder:notification', reminder);
  io.to('admin-room').emit('reminder:notification', { memberId, reminder });
};

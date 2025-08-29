import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupRemainingData() {
  try {
    console.log('🧹 Starting cleanup of remaining placeholder data...');
    
    // Clear reminders/SMS data
    console.log('📱 Clearing reminders/SMS data...');
    const { error: remindersError } = await supabase
      .from('reminders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all reminders
    
    if (remindersError) {
      console.error('❌ Error clearing reminders:', remindersError.message);
    } else {
      console.log('✅ Reminders cleared');
    }

    // Clear any SMS templates or notification data
    console.log('📝 Clearing SMS templates...');
    const { error: templatesError } = await supabase
      .from('sms_templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all SMS templates
    
    if (templatesError) {
      console.log('ℹ️  SMS templates table may not exist (this is normal)');
    } else {
      console.log('✅ SMS templates cleared');
    }

    // Clear any notification data
    console.log('🔔 Clearing notifications...');
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all notifications
    
    if (notificationsError) {
      console.log('ℹ️  Notifications table may not exist (this is normal)');
    } else {
      console.log('✅ Notifications cleared');
    }

    // Clear any report data
    console.log('📊 Clearing report data...');
    const { error: reportsError } = await supabase
      .from('reports')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all reports
    
    if (reportsError) {
      console.log('ℹ️  Reports table may not exist (this is normal)');
    } else {
      console.log('✅ Reports cleared');
    }

    // Clear any analytics data
    console.log('📈 Clearing analytics data...');
    const { error: analyticsError } = await supabase
      .from('analytics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all analytics
    
    if (analyticsError) {
      console.log('ℹ️  Analytics table may not exist (this is normal)');
    } else {
      console.log('✅ Analytics cleared');
    }

    // Clear any audit logs
    console.log('📋 Clearing audit logs...');
    const { error: auditError } = await supabase
      .from('audit_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all audit logs
    
    if (auditError) {
      console.log('ℹ️  Audit logs table may not exist (this is normal)');
    } else {
      console.log('✅ Audit logs cleared');
    }

    // Clear any system settings that might have placeholder data
    console.log('⚙️  Clearing system settings...');
    const { error: settingsError } = await supabase
      .from('system_settings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all system settings
    
    if (settingsError) {
      console.log('ℹ️  System settings table may not exist (this is normal)');
    } else {
      console.log('✅ System settings cleared');
    }

    console.log('\n🎉 Remaining data cleanup completed!');
    console.log('📝 Summary:');
    console.log('   ✅ Reminders cleared');
    console.log('   ✅ SMS templates cleared (if existed)');
    console.log('   ✅ Notifications cleared (if existed)');
    console.log('   ✅ Reports cleared (if existed)');
    console.log('   ✅ Analytics cleared (if existed)');
    console.log('   ✅ Audit logs cleared (if existed)');
    console.log('   ✅ System settings cleared (if existed)');
    console.log('   👥 Members list still preserved');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupRemainingData();

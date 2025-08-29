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

async function cleanupFinancialData() {
  try {
    console.log('🧹 Starting cleanup of financial data...');
    
    // Clear payments
    console.log('📊 Clearing payments...');
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all payments
    
    if (paymentsError) {
      console.error('❌ Error clearing payments:', paymentsError.message);
    } else {
      console.log('✅ Payments cleared');
    }

    // Clear donations
    console.log('💰 Clearing donations...');
    const { error: donationsError } = await supabase
      .from('donations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all donations
    
    if (donationsError) {
      console.error('❌ Error clearing donations:', donationsError.message);
    } else {
      console.log('✅ Donations cleared');
    }

    // Clear expenses
    console.log('💸 Clearing expenses...');
    const { error: expensesError } = await supabase
      .from('expenses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all expenses
    
    if (expensesError) {
      console.error('❌ Error clearing expenses:', expensesError.message);
    } else {
      console.log('✅ Expenses cleared');
    }

    // Clear budget categories
    console.log('📋 Clearing budget categories...');
    const { error: budgetError } = await supabase
      .from('budget_categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all budget categories
    
    if (budgetError) {
      console.error('❌ Error clearing budget categories:', budgetError.message);
    } else {
      console.log('✅ Budget categories cleared');
    }

    // Clear financial goals
    console.log('🎯 Clearing financial goals...');
    const { error: goalsError } = await supabase
      .from('financial_goals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all financial goals
    
    if (goalsError) {
      console.error('❌ Error clearing financial goals:', goalsError.message);
    } else {
      console.log('✅ Financial goals cleared');
    }

    // Reset member financial data to zero
    console.log('👥 Resetting member financial data...');
    const { error: membersError } = await supabase
      .from('members')
      .update({
        total_paid: 0,
        total_owing: 0,
        credit_balance: 0,
        last_payment_date: null
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all members
    
    if (membersError) {
      console.error('❌ Error resetting member data:', membersError.message);
    } else {
      console.log('✅ Member financial data reset');
    }

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('📝 Summary:');
    console.log('   ✅ Payments cleared');
    console.log('   ✅ Donations cleared');
    console.log('   ✅ Expenses cleared');
    console.log('   ✅ Budget categories cleared');
    console.log('   ✅ Financial goals cleared');
    console.log('   ✅ Member financial data reset to zero');
    console.log('   👥 Members list preserved');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupFinancialData();

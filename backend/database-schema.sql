-- Church Management System Database Schema
-- PostgreSQL for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'treasurer', 'member')),
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Members table
CREATE TABLE public.members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    join_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    total_paid DECIMAL(10,2) DEFAULT 0,
    total_owing DECIMAL(10,2) DEFAULT 0,
    credit_balance DECIMAL(10,2) DEFAULT 0,
    last_payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member payment history
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    method TEXT NOT NULL CHECK (method IN ('cash', 'mobile_money')),
    notes TEXT,
    months_paid TEXT[], -- Array of months in YYYY-MM format
    is_advance_payment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE public.donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donor_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    donation_date DATE DEFAULT CURRENT_DATE,
    purpose TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('cash', 'mobile_money')),
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    description TEXT,
    budget_category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget categories
CREATE TABLE public.budget_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    budgeted_amount DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial goals
CREATE TABLE public.financial_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    category TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Reminders
CREATE TABLE public.reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sms', 'email')),
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('pre-due', 'overdue')),
    owing_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminder settings
CREATE TABLE public.reminder_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auto_reminders BOOLEAN DEFAULT TRUE,
    reminder_day INTEGER DEFAULT 15 CHECK (reminder_day >= 1 AND reminder_day <= 31),
    pre_due_message TEXT,
    overdue_message TEXT,
    sms_provider TEXT DEFAULT 'hubtel',
    from_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member owing months tracking
CREATE TABLE public.member_owing_months (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- YYYY-MM format
    amount DECIMAL(10,2) DEFAULT 10.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, month)
);

-- Member credit months tracking
CREATE TABLE public.member_credit_months (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- YYYY-MM format
    amount DECIMAL(10,2) DEFAULT 10.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, month)
);

-- System settings
CREATE TABLE public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_members_phone ON public.members(phone);
CREATE INDEX idx_payments_member_id ON public.payments(member_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_donations_date ON public.donations(donation_date);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_reminders_member_id ON public.reminders(member_id);
CREATE INDEX idx_reminders_date ON public.reminders(sent_date);
CREATE INDEX idx_owing_months_member_id ON public.member_owing_months(member_id);
CREATE INDEX idx_credit_months_member_id ON public.member_credit_months(member_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_owing_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_credit_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all operations for authenticated users)
CREATE POLICY "Users can view all data" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can manage members" ON public.members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage payments" ON public.payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage donations" ON public.donations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage expenses" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage budget categories" ON public.budget_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage financial goals" ON public.financial_goals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage reminders" ON public.reminders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage reminder settings" ON public.reminder_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage owing months" ON public.member_owing_months FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage credit months" ON public.member_credit_months FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage system settings" ON public.system_settings FOR ALL USING (auth.role() = 'authenticated');

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON public.budget_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON public.financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON public.reminder_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update member totals when payment is made
CREATE OR REPLACE FUNCTION update_member_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update member's total_paid and last_payment_date
    UPDATE public.members 
    SET 
        total_paid = total_paid + NEW.amount,
        last_payment_date = NEW.payment_date,
        updated_at = NOW()
    WHERE id = NEW.member_id;
    
    -- Handle owing months and credit months based on payment
    IF NEW.is_advance_payment THEN
        -- For advance payments, add credit months
        INSERT INTO public.member_credit_months (member_id, month, amount)
        SELECT NEW.member_id, month, 10.00
        FROM unnest(NEW.months_paid) AS month
        WHERE month != 'credit'
        ON CONFLICT (member_id, month) DO NOTHING;
        
        -- Update credit balance
        UPDATE public.members 
        SET credit_balance = credit_balance + NEW.amount
        WHERE id = NEW.member_id;
    ELSE
        -- For regular payments, remove owing months
        DELETE FROM public.member_owing_months 
        WHERE member_id = NEW.member_id 
        AND month = ANY(NEW.months_paid);
        
        -- Update total_owing
        UPDATE public.members 
        SET total_owing = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM public.member_owing_months 
            WHERE member_id = NEW.member_id
        )
        WHERE id = NEW.member_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update member totals on payment
CREATE TRIGGER update_member_totals_trigger 
    AFTER INSERT ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION update_member_totals();

-- Insert default data
INSERT INTO public.budget_categories (name, budgeted_amount, color) VALUES
('Programs & Events', 300.00, '#0D9488'),
('Equipment & Maintenance', 150.00, '#3B82F6'),
('Materials & Resources', 100.00, '#8B5CF6'),
('Outreach & Missions', 120.00, '#F59E0B');

INSERT INTO public.reminder_settings (pre_due_message, overdue_message) VALUES
('Hi {memberName}, this is a reminder that your youth ministry dues of GHS {amount} ({monthCount} month{s}) are due. Please pay before month end. Thank you!', 
 'Hi {memberName}, your youth ministry dues of GHS {amount} ({monthCount} month{s}) are overdue. Please settle your payment. God bless!');

INSERT INTO public.system_settings (key, value, description) VALUES
('monthly_dues_amount', '10.00', 'Monthly dues amount in GHS'),
('currency', 'GHS', 'Default currency'),
('church_name', 'Youth Ministry', 'Church/Ministry name'),
('sms_enabled', 'true', 'Enable SMS reminders');

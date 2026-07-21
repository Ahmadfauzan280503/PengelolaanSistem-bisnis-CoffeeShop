-- Create the table for cashier/digital orders
CREATE TABLE IF NOT EXISTS cashier_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    table_number TEXT,
    order_mode TEXT DEFAULT 'dinein',
    cabang TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC NOT NULL DEFAULT 0,
    service_charge NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'QRIS',
    payment_status TEXT DEFAULT 'PENDING',
    order_status TEXT DEFAULT 'QUEUED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE cashier_orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for cashier dashboard to see orders)
CREATE POLICY "Allow public read access" ON cashier_orders FOR SELECT USING (true);

-- Allow public insert (for customer order page)
CREATE POLICY "Allow public insert" ON cashier_orders FOR INSERT WITH CHECK (true);

-- Allow public update (for cashier to update order status)
CREATE POLICY "Allow public update" ON cashier_orders FOR UPDATE USING (true);

-- Create index for faster queries
CREATE INDEX idx_cashier_orders_status ON cashier_orders(order_status);
CREATE INDEX idx_cashier_orders_payment ON cashier_orders(payment_status);
CREATE INDEX idx_cashier_orders_created ON cashier_orders(created_at DESC);

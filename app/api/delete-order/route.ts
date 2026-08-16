import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client will be created inside the handler

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    if (orderId === 'ALL') {
       // Delete all orders
       const { error } = await supabaseAdmin
         .from('cashier_orders')
         .delete()
         .neq("id", "00000000-0000-0000-0000-000000000000"); // Valid UUID to match all records
         
       if (error) throw error;
    } else {
       // Delete a specific order
       const { error } = await supabaseAdmin
         .from('cashier_orders')
         .delete()
         .eq('id', orderId);
         
       if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

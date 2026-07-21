const { Client } = require('pg');

const connectionString = "postgres://postgres.cjnlbefawsnyqscqvkib:Jfo90mKWeXkYbASW@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function disableRLS() {
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    await client.query("ALTER TABLE cashier_accounts DISABLE ROW LEVEL SECURITY;");
    console.log("RLS disabled for cashier_accounts.");

  } catch (error) {
    console.error("Error disabling RLS:", error);
  } finally {
    await client.end();
    console.log("Connection closed.");
  }
}

disableRLS();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgres://postgres.cjnlbefawsnyqscqvkib:Jfo90mKWeXkYbASW@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";
const sqlPath = path.join(__dirname, '../lib/sql/create_cashier_orders.sql');

async function run() {
  console.log("Reading SQL file...");
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log("Connecting to Supabase PostgreSQL database...");
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    console.log("Executing SQL script...");
    await client.query(sql);
    console.log("SQL script executed successfully! Table and policies created.");

  } catch (err) {
    console.error("Error executing SQL script:", err);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

run();

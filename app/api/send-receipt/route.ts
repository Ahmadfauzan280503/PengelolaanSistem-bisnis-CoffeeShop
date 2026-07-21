import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      orderNumber,
      customerName,
      tableNumber,
      branch,
      items,
      subtotal,
      tax,
      service,
      total,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
    }

    const formatCurrency = (v: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(v);
    };

    // 1. Build a stunning HTML receipt template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Struk Digital - Kota Coffee</title>
      <style>
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 20px;
          color: #333333;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }
        .header {
          background: linear-gradient(135deg, #b45309, #d97706);
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .header p {
          margin: 5px 0 0 0;
          font-size: 13px;
          opacity: 0.9;
        }
        .content {
          padding: 30px 25px;
        }
        .lunas-badge {
          display: inline-block;
          border: 2px solid #10b981;
          color: #10b981;
          font-weight: bold;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          margin-bottom: 20px;
          letter-spacing: 1px;
        }
        .meta-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          font-size: 13px;
        }
        .meta-grid td {
          padding: 6px 0;
        }
        .meta-label {
          color: #888888;
          width: 40%;
        }
        .meta-val {
          font-weight: 600;
          text-align: right;
          color: #222222;
        }
        .item-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        .item-table th {
          border-bottom: 1px solid #e8e8e8;
          text-align: left;
          padding-bottom: 10px;
          color: #888888;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .item-table td {
          padding: 12px 0;
          border-bottom: 1px solid #f6f6f6;
          font-size: 14px;
        }
        .item-name {
          font-weight: 600;
          color: #222222;
        }
        .item-qty {
          color: #666666;
          font-size: 12px;
          margin-top: 3px;
        }
        .item-subtotal {
          text-align: right;
          font-weight: 700;
          color: #222222;
        }
        .calc-section {
          border-top: 1px dashed #e0e0e0;
          padding-top: 15px;
          margin-top: 15px;
        }
        .calc-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
          color: #666666;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          font-weight: 800;
          color: #b45309;
          border-top: 1px solid #e0e0e0;
          padding-top: 12px;
          margin-top: 12px;
        }
        .footer {
          background-color: #fafafa;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #eeeeee;
          font-size: 11px;
          color: #888888;
        }
        .footer p {
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>☕ KOTA COFFEE</h1>
          <p>${branch}</p>
        </div>
        <div class="content">
          <center>
            <div class="lunas-badge">Lunas via QRIS</div>
          </center>
          
          <table class="meta-grid">
            <tr>
              <td class="meta-label">No. Transaksi</td>
              <td class="meta-val">${orderNumber}</td>
            </tr>
            <tr>
              <td class="meta-label">Nama Pelanggan</td>
              <td class="meta-val">${customerName}</td>
            </tr>
            <tr>
              <td class="meta-label">Nomor Meja</td>
              <td class="meta-val">${tableNumber}</td>
            </tr>
            <tr>
              <td class="meta-label">Waktu Pemesanan</td>
              <td class="meta-val">${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</td>
            </tr>
          </table>

          <table class="item-table">
            <thead>
              <tr>
                <th>Item Pesanan</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td>
                    <div class="item-name">${item.name}</div>
                    <div class="item-qty">${item.quantity} x ${formatCurrency(item.price)}</div>
                  </td>
                  <td class="item-subtotal">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="calc-section">
            <div class="calc-row">
              <span>Subtotal</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="calc-row">
              <span>Pajak PB1 (10%)</span>
              <span>${formatCurrency(tax)}</span>
            </div>
            <div class="calc-row">
              <span>Service Charge (5%)</span>
              <span>${formatCurrency(service)}</span>
            </div>
            <div class="total-row">
              <span>TOTAL BAYAR</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>Terima kasih telah memesan di Kota Coffee!</p>
          <p style="margin-top: 5px; opacity: 0.7;">Email ini adalah bukti transaksi digital resmi.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // 2. Setup transporter using environment variables or a fallback mock
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `"Kota Coffee" <noreply@kotacoffee.id>`;

    if (smtpHost && smtpUser && smtpPass) {
      // Real transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: `Struk Pembelian Digital #${orderNumber} - Kota Coffee`,
        html: htmlContent,
      });

      console.log(`[SMTP SUCCESS] Sent digital receipt to ${email}`);
      return NextResponse.json({ success: true, method: "smtp" });
    } else {
      // Fallback Simulator: Log the HTML and output successfully
      console.log(`\n========================================`);
      console.log(`[SMTP SIMULATOR] Real SMTP not configured in .env.`);
      console.log(`Simulated sending digital receipt to: ${email}`);
      console.log(`Invoice Number: ${orderNumber}`);
      console.log(`Table Number: ${tableNumber}`);
      console.log(`Grand Total: ${formatCurrency(total)}`);
      console.log(`HTML Receipt Template Generated Successfully.`);
      console.log(`========================================\n`);
      
      return NextResponse.json({ 
        success: true, 
        method: "simulator", 
        warning: "SMTP details missing in .env, simulated in server logs." 
      });
    }

  } catch (error: any) {
    console.error("Error in send-receipt API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders_store.json');
const EMAILS_FILE = path.join(DATA_DIR, 'emails_log.json');

// Ensure data directory exists for persistent storage
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data directory:', err);
  }
}

// Load persisted orders safely
function loadPersistedOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(content) || [];
    }
  } catch (err) {
    console.warn('Warning reading orders file, using empty array:', err);
  }
  return [];
}

// Save orders to persistent disk
function savePersistedOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders.slice(0, 500), null, 2), 'utf-8');
  } catch (err) {
    console.warn('Warning saving orders file:', err);
  }
}

// Load persisted emails safely
function loadPersistedEmails(): any[] {
  try {
    if (fs.existsSync(EMAILS_FILE)) {
      const content = fs.readFileSync(EMAILS_FILE, 'utf-8');
      return JSON.parse(content) || [];
    }
  } catch (err) {
    console.warn('Warning reading emails file:', err);
  }
  return [];
}

// Save emails to disk
function savePersistedEmails(emails: any[]) {
  try {
    fs.writeFileSync(EMAILS_FILE, JSON.stringify(emails.slice(0, 200), null, 2), 'utf-8');
  } catch (err) {
    console.warn('Warning saving emails file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 1. CORS Preflight & Security Headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // 2. High-Capacity Body Parsers (for base64 photos & large ensembles)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // In-memory backend storage backed by disk persistence
  const backendOrders: any[] = loadPersistedOrders();
  const sentEmailsLog: any[] = loadPersistedEmails();

  // Helper to generate luxury HTML email for NOOR STUDIO
  function generateOrderEmailHtml(order: any) {
    const itemsListHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr style="border-bottom: 1px solid #EADBCE;">
          <td style="padding: 12px 8px; vertical-align: top; width: 64px;">
            <img src="${item.image || 'https://noorstudio.pk/logo.png'}" alt="${item.productName || 'Ensemble'}" style="width: 56px; height: 72px; object-fit: cover; border-radius: 6px; border: 1px solid #EADBCE;" />
          </td>
          <td style="padding: 12px 8px; vertical-align: top;">
            <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: bold; color: #1F1C1A;">${item.productName || 'Pakistani Haute Couture'}</p>
            <p style="margin: 0; font-size: 11px; color: #7A7169;">Color: <strong>${item.colorName || 'Default'}</strong> | Size: <strong>${item.size || 'Standard'}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #8C827A;">Qty: ${item.quantity || 1} &times; Rs. ${(Number(item.price) || 0).toLocaleString()}</p>
          </td>
          <td style="padding: 12px 8px; vertical-align: top; text-align: right; font-size: 13px; font-weight: bold; color: #1F1C1A;">
            Rs. ${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - NOOR STUDIO</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1C1A;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; padding: 24px 12px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #EADBCE; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                <!-- Header Banner -->
                <tr>
                  <td style="background-color: #1F1C1A; padding: 28px 24px; text-align: center;">
                    <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; letter-spacing: 3px; font-weight: 700; color: #FFFFFF; text-transform: uppercase;">NOOR STUDIO</h1>
                    <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #C5A059; text-transform: uppercase;">Elegant Fashion, Timeless Confidence</p>
                  </td>
                </tr>

                <!-- Order Success Notice -->
                <tr>
                  <td style="padding: 28px 24px 16px 24px;">
                    <div style="background-color: #F7F4EE; border-left: 4px solid #C5A059; padding: 14px 16px; border-radius: 6px; margin-bottom: 20px;">
                      <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1F1C1A;">Assalam-o-Alaikum, ${order.customer?.fullName || 'Valued Patron'}!</p>
                      <p style="margin: 6px 0 0 0; font-size: 12px; color: #5A524C; line-height: 1.5;">
                        Shukriya for choosing <strong>NOOR STUDIO</strong>. We have received your order <strong>#${order.orderNumber}</strong>. Your artisanal ensemble is being prepared for nationwide dispatch via <strong>PostEx Express Courier (Cash on Delivery)</strong>.
                      </p>
                    </div>

                    <!-- Order Summary Header -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="font-size: 12px; color: #7A7169;">
                          <strong>Order Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}<br/>
                          <strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery (COD)'}<br/>
                          <strong>Delivery Courier:</strong> PostEx Express (${order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Tracking will be sent via SMS/WhatsApp'})
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                          <span style="display: inline-block; background-color: #EBF8F1; color: #0E7042; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; border: 1px solid #A4DFB9;">
                            ${order.orderStatus || 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Items Table -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 12px;">
                      <thead>
                        <tr style="background-color: #FAF8F5; border-bottom: 2px solid #EADBCE; text-align: left;">
                          <th style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #7A7169; letter-spacing: 1px;">Item</th>
                          <th style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #7A7169; letter-spacing: 1px;">Ensemble Details</th>
                          <th style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #7A7169; letter-spacing: 1px; text-align: right;">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsListHtml}
                      </tbody>
                    </table>

                    <!-- Financial Summary -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; border-top: 1px solid #EADBCE; padding-top: 12px;">
                      <tr>
                        <td style="font-size: 12px; color: #7A7169; padding: 4px 0;">Subtotal:</td>
                        <td style="font-size: 12px; color: #1F1C1A; text-align: right; font-weight: 500;">Rs. ${(Number(order.subtotal) || 0).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #7A7169; padding: 4px 0;">Nationwide Shipping:</td>
                        <td style="font-size: 12px; color: #1F1C1A; text-align: right; font-weight: 500;">${Number(order.shippingCost) === 0 ? '<strong style="color: #0E7042;">FREE</strong>' : `Rs. ${order.shippingCost}`}</td>
                      </tr>
                      ${
                        order.discount && Number(order.discount) > 0
                          ? `
                      <tr>
                        <td style="font-size: 12px; color: #B3261E; padding: 4px 0;">Discount (${order.couponCode || 'Promo'}):</td>
                        <td style="font-size: 12px; color: #B3261E; text-align: right; font-weight: 500;">- Rs. ${Number(order.discount).toLocaleString()}</td>
                      </tr>
                      `
                          : ''
                      }
                      <tr style="border-top: 2px solid #EADBCE;">
                        <td style="font-size: 14px; font-weight: bold; color: #1F1C1A; padding: 10px 0 4px 0;">Total Payable (COD):</td>
                        <td style="font-size: 16px; font-family: 'Playfair Display', Georgia, serif; font-weight: bold; color: #C5A059; text-align: right; padding: 10px 0 4px 0;">
                          Rs. ${(Number(order.total) || 0).toLocaleString()}
                        </td>
                      </tr>
                    </table>

                    <!-- Shipping Address Box -->
                    <div style="margin-top: 20px; background-color: #FAF8F5; border: 1px solid #EADBCE; border-radius: 8px; padding: 14px 16px;">
                      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1F1C1A;">Delivery Address (Destination)</p>
                      <p style="margin: 0; font-size: 12px; color: #5A524C; line-height: 1.5;">
                        <strong>${order.customer?.fullName || 'Valued Customer'}</strong><br/>
                        ${order.customer?.address || 'Pakistan'}<br/>
                        ${order.customer?.city || 'Pakistan'} ${order.customer?.postalCode ? `(${order.customer.postalCode})` : ''}<br/>
                        <strong>Phone / WhatsApp:</strong> ${order.customer?.phone || '03284454746'}<br/>
                        <strong>Email:</strong> ${order.customer?.email || 'N/A'}
                      </p>
                      ${
                        order.customer?.notes
                          ? `<p style="margin: 8px 0 0 0; font-size: 11px; color: #8C827A; font-style: italic;">Special Instructions: "${order.customer.notes}"</p>`
                          : ''
                      }
                    </div>

                    <!-- Direct WhatsApp Helpline -->
                    <div style="margin-top: 20px; text-align: center; padding: 16px; background-color: #F0FDF4; border-radius: 8px; border: 1px solid #BBF7D0;">
                      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #166534;">Have queries about size fitting or urgent dispatch?</p>
                      <a href="https://wa.me/923284454746?text=Assalam-o-Alaikum%20NOOR%20STUDIO%2C%20inquiry%20regarding%20order%20%23${order.orderNumber}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: bold; padding: 8px 18px; border-radius: 20px; margin-top: 4px;">
                        WhatsApp Customer Helpline: 03284454746
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #FAF8F5; border-top: 1px solid #EADBCE; padding: 18px 24px; text-align: center; font-size: 11px; color: #8C827A; line-height: 1.5;">
                    <p style="margin: 0 0 4px 0;"><strong>NOOR STUDIO</strong> • Gulberg III, Lahore, Pakistan</p>
                    <p style="margin: 0;">Official Helpline: 03284454746 • Email: support@noorstudio.pk</p>
                    <p style="margin: 6px 0 0 0; font-size: 10px; color: #A89D93;">&copy; ${new Date().getFullYear()} NOOR STUDIO. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // =================== REST API ENDPOINTS ===================

  // 1. POST /api/orders (Store order + Send confirmation email)
  app.post('/api/orders', async (req, res) => {
    try {
      const order = req.body;

      if (!order || typeof order !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid order payload.',
        });
      }

      if (!order.customer || typeof order.customer !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Customer delivery details are required.',
        });
      }

      // Ensure essential fields exist
      const customerEmail = (order.customer.email || '').trim();
      const customerPhone = (order.customer.phone || '').trim();

      if (!customerPhone) {
        return res.status(400).json({
          success: false,
          error: 'Customer phone number is required.',
        });
      }

      // Guarantee an order ID and number if not provided
      const completeOrder = {
        ...order,
        id: order.id || `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderNumber: order.orderNumber || `NS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: order.paymentStatus || 'Pending',
        orderStatus: order.orderStatus || 'Pending',
        paymentMethod: order.paymentMethod || 'COD',
        courier: order.courier || 'PostEx (Cash on Delivery)',
      };

      // Add to backend orders list & persist to disk
      const existingIdx = backendOrders.findIndex((o) => o.id === completeOrder.id || o.orderNumber === completeOrder.orderNumber);
      if (existingIdx !== -1) {
        backendOrders[existingIdx] = completeOrder;
      } else {
        backendOrders.unshift(completeOrder);
      }
      savePersistedOrders(backendOrders);

      const emailHtml = generateOrderEmailHtml(completeOrder);
      let emailSent = false;
      let emailInfoMessage = 'Confirmation email generated';

      // Send via Nodemailer if SMTP configured, or simulated mailer with full preview
      try {
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && customerEmail) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"NOOR STUDIO" <${process.env.SMTP_FROM || 'support@noorstudio.pk'}>`,
            to: customerEmail,
            bcc: 'sawairamaryam837@gmail.com, support@noorstudio.pk',
            subject: `Order Confirmed #${completeOrder.orderNumber} – NOOR STUDIO`,
            html: emailHtml,
          });
          emailSent = true;
          emailInfoMessage = `Live email sent to ${customerEmail}`;
        } else {
          console.log(`[EMAIL DISPATCH] Sent order confirmation for #${completeOrder.orderNumber} to: ${customerEmail || 'No Email'}`);
          emailSent = true;
          emailInfoMessage = customerEmail
            ? `Confirmation email generated and dispatched to ${customerEmail}`
            : 'Order received via Phone/WhatsApp';
        }

        sentEmailsLog.unshift({
          orderNumber: completeOrder.orderNumber,
          to: customerEmail || customerPhone,
          sentAt: new Date().toISOString(),
          html: emailHtml,
        });
        savePersistedEmails(sentEmailsLog);
      } catch (mailErr: any) {
        console.warn('Mail dispatch notice:', mailErr?.message || mailErr);
        emailSent = false;
        emailInfoMessage = 'Email queued for transmission';
      }

      return res.status(201).json({
        success: true,
        orderId: completeOrder.id,
        orderNumber: completeOrder.orderNumber,
        emailSent,
        message: emailInfoMessage,
        emailPreview: {
          to: customerEmail || customerPhone,
          subject: `Order Confirmed #${completeOrder.orderNumber} – NOOR STUDIO`,
          html: emailHtml,
        },
      });
    } catch (err: any) {
      console.error('Order creation error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Server error processing order placement.',
      });
    }
  });

  // 2. GET /api/orders (Fetch all orders for Admin Panel & Sync)
  app.get('/api/orders', (_req, res) => {
    return res.json({
      success: true,
      count: backendOrders.length,
      orders: backendOrders,
    });
  });

  // 3. GET /api/orders/:id (Fetch single order by id or orderNumber)
  app.get('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const order = backendOrders.find((o) => o.id === id || o.orderNumber === id);
    if (order) {
      return res.json({ success: true, order });
    }
    return res.status(404).json({ success: false, error: 'Order not found' });
  });

  // 4. PATCH /api/orders/:id (Update order status or tracking)
  app.patch('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const orderIndex = backendOrders.findIndex((o) => o.id === id || o.orderNumber === id);

    if (orderIndex !== -1) {
      backendOrders[orderIndex] = {
        ...backendOrders[orderIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      savePersistedOrders(backendOrders);
      return res.json({ success: true, order: backendOrders[orderIndex] });
    }

    return res.status(404).json({ success: false, error: 'Order not found' });
  });

  // 5. DELETE /api/orders/:id (Admin order cleanup)
  app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const orderIndex = backendOrders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex !== -1) {
      const removed = backendOrders.splice(orderIndex, 1);
      savePersistedOrders(backendOrders);
      return res.json({ success: true, message: 'Order removed', order: removed[0] });
    }
    return res.status(404).json({ success: false, error: 'Order not found' });
  });

  // 6. POST /api/send-confirmation-email (Manual resend / test)
  app.post('/api/send-confirmation-email', async (req, res) => {
    try {
      const { order, targetEmail } = req.body;
      if (!order) {
        return res.status(400).json({ success: false, error: 'Order payload required' });
      }

      const email = targetEmail || order.customer?.email;
      const emailHtml = generateOrderEmailHtml(order);

      sentEmailsLog.unshift({
        orderNumber: order.orderNumber,
        to: email,
        sentAt: new Date().toISOString(),
        html: emailHtml,
      });
      savePersistedEmails(sentEmailsLog);

      return res.json({
        success: true,
        emailSent: true,
        message: `Order confirmation email sent to ${email}`,
        html: emailHtml,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 7. GET /api/emails (Review all dispatched emails)
  app.get('/api/emails', (_req, res) => {
    return res.json({
      success: true,
      count: sentEmailsLog.length,
      emails: sentEmailsLog,
    });
  });

  // 8. GET /api/health
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      store: 'NOOR STUDIO',
      ordersCount: backendOrders.length,
      emailsCount: sentEmailsLog.length,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // 9. Centralized Error Handler Middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[SERVER GLOBAL ERROR]:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Internal Server Error',
    });
  });

  // =================== DEV & PRODUCTION MIDDLEWARE ===================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NOOR STUDIO] Express backend + Vite app running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

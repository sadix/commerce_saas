// src/lib/email.ts

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendOrderConfirmationEmail(order: any) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #4F46E5; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="content">
            <p>Hi ${order.customer.name},</p>
            <p>Your order has been confirmed and will be shipped soon.</p>
            
            <div class="order-details">
              <h2>Order #${order.orderNumber}</h2>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              
              <h3>Items:</h3>
              ${order.items.map((item: any) => `
                <div class="item">
                  <strong>${item.productName}</strong>
                  ${item.variationName ? `<br/><small>${item.variationName}</small>` : ''}
                  <br/>
                  Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}
                </div>
              `).join('')}
              
              <div class="total">
                <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
                <p>Shipping: $${order.shipping.toFixed(2)}</p>
                <p>Tax: $${order.tax.toFixed(2)}</p>
                <p>Total: $${order.total.toFixed(2)}</p>
              </div>
              
              <h3>Shipping Address:</h3>
              <p>
                ${order.address.firstName} ${order.address.lastName}<br/>
                ${order.address.address1}<br/>
                ${order.address.address2 ? `${order.address.address2}<br/>` : ''}
                ${order.address.city}, ${order.address.state} ${order.address.zipCode}<br/>
                ${order.address.country}
              </p>
            </div>
            
            <p>You can track your order status in your account dashboard.</p>
          </div>
          
          <div class="footer">
            <p>Questions? Contact us at ${order.shop.emailReplyTo || order.shop.emailFrom || 'support@yourstore.com'}</p>
            <p>&copy; ${new Date().getFullYear()} ${order.shop.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: order.shop.emailFrom || process.env.SMTP_USER,
    to: order.customer.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: emailHtml,
  });
}

export async function sendOrderStatusEmail(order: any, newStatus: string) {
  const statusMessages: Record<string, string> = {
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update</h1>
          </div>
          <div class="content">
            <p>Hi ${order.customer.name},</p>
            <p><strong>${statusMessages[newStatus]}</strong></p>
            <p>Order #${order.orderNumber}</p>
            ${order.trackingNumber ? `<p>Tracking Number: ${order.trackingNumber}</p>` : ''}
            <p>You can view your order details in your account dashboard.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: order.shop.emailFrom || process.env.SMTP_USER,
    to: order.customer.email,
    subject: `Order Update - ${order.orderNumber}`,
    html: emailHtml,
  });
}

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmationLink = `${domain}/verify-email?token=${token}`

    const logo_url = `${domain}/_next/static/media/logo-baobuy-colored.9d6b8b24.png`;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #4F46E5; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .logo { height: 50px; width: auto; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
             <img src="${logo_url}" alt="Logo" class="logo" />
            <h1>Email Verification</h1>
            <p>Welcome to Baobuy!</p>
          </div>
          
          <div class="content">
            <p>Hi there,</p>
            <p>Thank you for signing up:</p>
            
            <p>Click <a href="${confirmationLink}" target="_blank">here</a> to verify your email.</p>
            
            <p>Yours,</p>
            <p>The Baobuy Team</p>
          </div>
          
          <div class="footer">
            <p>Questions? Contact us at </p>
            <p>&copy; ${new Date().getFullYear()} . Baobuy All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;  

    await transporter.sendMail({
        from: "contact@baobuy.site",
        to: email,
        subject: "Verify your email",
        html: emailHtml,
    })
}

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  /* host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, */
  service:'gmail',
  auth: {
    user: "serignetine08@gmail.com",
    pass: "wiji oypd zfvz atnb",
  },
});

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
            <p>Hi Saliou</p>
            <p>Your order has been confirmed and will be shipped soon.</p>
            
            <div class="order-details">
              <h2>Order #</h2>
              <p><strong>Date:</strong> </p>
              
              <h3>Items:</h3>
              
              
              <div class="total">
               
              </div>
              
              <h3>Shipping Address:</h3>
              <p>
                
              </p>
            </div>
            
            <p>You can track your order status in your account dashboard.</p>
          </div>
          
          <div class="footer">
            <p>Questions? Contact us at 'support@yourstore.com'}</p>
            <p>&copy; 2026. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
async function main() {
  

await transporter.sendMail({
    from: "contact@baobuy.site",
    to: "salioutine2@hotmail.com",
    subject: `Order Confirmation - TEST`,
    html: emailHtml,
  });

}

main();
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Testing Email Configuration...');
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('🔑 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***SET***' : '***NOT SET***');
  console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email configuration missing!');
    return;
  }
  
  console.log('✅ Email configuration found, testing email sending...');
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    console.log('📧 Transporter created, sending test email...');
    
    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'PayBridge Email Test',
      html: `
        <h1>PayBridge Email Test</h1>
        <p>This is a test email to verify the email configuration is working.</p>
        <p>If you receive this email, the email system is working correctly!</p>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Check your inbox for the test email!');
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail(); 
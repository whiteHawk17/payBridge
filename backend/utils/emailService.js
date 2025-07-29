const nodemailer = require('nodemailer');

// Create transporter (you'll need to configure this with your email service)
const createTransporter = () => {
  // For development, you can use Gmail or other services
  // For production, use services like SendGrid, AWS SES, etc.
  
  return nodemailer.createTransport({
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Email templates
const createInvitationEmail = (roomData, roomId, inviterName) => {
  const oppositeRole = roomData.role === 'buyer' ? 'seller' : 'buyer';
  
  return {
    subject: `PayBridge: New Transaction Invitation from ${inviterName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">PayBridge</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Secure Transaction Platform</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">You've been invited to a transaction!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <strong>${inviterName}</strong> has invited you to participate in a secure transaction on PayBridge.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Transaction Details:</h3>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li><strong>Description:</strong> ${roomData.description}</li>
              <li><strong>Price:</strong> ₹${roomData.price}</li>
              <li><strong>Completion Date:</strong> ${new Date(roomData.date).toLocaleDateString()}</li>
              <li><strong>Your Role:</strong> ${oppositeRole.charAt(0).toUpperCase() + oppositeRole.slice(1)}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/rooms/${roomId}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Join Transaction Room
            </a>
          </div>
          
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="color: #0c5460; margin: 0; font-size: 14px;">
              <strong>Room ID:</strong> ${roomId}<br>
              <strong>Security:</strong> This transaction is protected by our secure escrow system.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This email was sent by PayBridge. If you didn't expect this invitation, please ignore this email.</p>
          <p>&copy; 2024 PayBridge. All rights reserved.</p>
        </div>
      </div>
    `
  };
};

// Send invitation email
const sendInvitationEmail = async (toEmail, roomData, roomId, inviterName) => {
  try {
    const transporter = createTransporter();
    const emailContent = createInvitationEmail(roomData, roomId, inviterName);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@paybridge.com',
      to: toEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Invitation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: error.message };
  }
};

// Verify email format and domain
const verifyEmail = async (email) => {
  try {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }
    
    // Extract domain
    const domain = email.split('@')[1];
    
    // Check if domain has valid MX records (basic domain validation)
    const dns = require('dns').promises;
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords.length === 0) {
        return { isValid: false, message: 'Invalid email domain' };
      }
    } catch (dnsError) {
      return { isValid: false, message: 'Invalid email domain' };
    }
    
    return { isValid: true, message: 'Email is valid' };
  } catch (error) {
    console.error('Email verification error:', error);
    return { isValid: false, message: 'Email verification failed' };
  }
};

module.exports = {
  sendInvitationEmail,
  verifyEmail
}; 
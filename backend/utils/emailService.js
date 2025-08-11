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
            <a href="${process.env.FRONTEND_URL || 'https://paybridge.site'}/rooms/${roomId}" 
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

// Payment notification emails
exports.sendPaymentReleasedEmail = async (sellerEmail, sellerName, amount, roomId, payoutId) => {
  try {
    const transporter = createTransporter(); // Re-create transporter for each email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@paybridge.com', // Use process.env.EMAIL_USER for consistency
      to: sellerEmail,
      subject: '💰 Payment Released - Funds Transferred to Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Payment Released!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your hard work has been rewarded</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
              <h2 style="color: #28a745; margin: 0 0 15px 0;">Payment Details</h2>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 600;">Amount:</span>
                <span style="color: #28a745; font-size: 18px; font-weight: 600;">₹${amount.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 600;">Payout ID:</span>
                <span style="font-family: monospace;">${payoutId}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 600;">Room ID:</span>
                <span style="font-family: monospace;">${roomId}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-weight: 600;">Status:</span>
                <span style="color: #28a745; font-weight: 600;">✅ Processing</span>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c3e6c3;">
              <h3 style="margin: 0 0 15px 0; color: #155724;">What happens next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #155724;">
                <li>Funds will be transferred to your registered bank account/UPI within 24-48 hours</li>
                <li>You'll receive an SMS notification when the transfer is complete</li>
                <li>Check your bank statement for the transaction</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.FRONTEND_URL || 'https://paybridge.site'}/dashboard" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Dashboard</a>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px;">
              <p>Thank you for using PayBridge! 🚀</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment released email sent to ${sellerEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send payment released email:', error);
    return false;
  }
};

exports.sendPaymentReleaseConfirmationEmail = async (buyerEmail, buyerName, amount, sellerName, roomId) => {
  try {
    const transporter = createTransporter(); // Re-create transporter for each email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@paybridge.com', // Use process.env.EMAIL_USER for consistency
      to: buyerEmail,
      subject: '✅ Payment Released Successfully - Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">✅ Payment Released</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your payment has been successfully transferred</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
              <h2 style="color: #28a745; margin: 0 0 15px 0;">Transaction Summary</h2>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 600;">Amount Paid:</span>
                <span style="color: #28a745; font-size: 18px; font-weight: 600;">₹${amount.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 600;">Recipient:</span>
                <span style="font-weight: 600;">${sellerName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 600;">Room ID:</span>
                <span style="font-family: monospace;">${roomId}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-weight: 600;">Status:</span>
                <span style="color: #28a745; font-weight: 600;">✅ Completed</span>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c3e6c3;">
              <h3 style="margin: 0 0 15px 0; color: #155724;">What happens next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #155724;">
                <li>The seller will receive the funds within 24-48 hours</li>
                <li>You'll receive a receipt for your records</li>
                <li>The room status has been updated to "Completed"</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.FRONTEND_URL || 'https://paybridge.site'}/dashboard" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Dashboard</a>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px;">
              <p>Thank you for using PayBridge! 🚀</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment release confirmation email sent to ${buyerEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send payment release confirmation email:', error);
    return false;
  }
};

exports.sendPaymentDetailsUpdatedEmail = async (sellerEmail, sellerName) => {
  try {
    const transporter = createTransporter(); // Re-create transporter for each email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@paybridge.com', // Use process.env.EMAIL_USER for consistency
      to: sellerEmail,
      subject: '🔐 Payment Details Updated Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Payment Details Updated</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your payment information has been successfully updated</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
              <h2 style="color: #28a745; margin: 0 0 15px 0;">Update Confirmation</h2>
              <p style="margin: 0; color: #6c757d; line-height: 1.6;">
                Hello ${sellerName},<br><br>
                Your payment details have been successfully updated in our system. 
                You can now receive payments when buyers release funds for completed work.
              </p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #c3e6c3;">
              <h3 style="margin: 0 0 15px 0; color: #155724;">Next Steps</h3>
              <ul style="margin: 0; padding-left: 20px; color: #155724;">
                <li>Complete your work assignments</li>
                <li>Wait for buyer verification and approval</li>
                <li>Receive payments directly to your account</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.FRONTEND_URL || 'https://paybridge.site'}/dashboard" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Go to Dashboard</a>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px;">
              <p>Thank you for using PayBridge! 🚀</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment details updated email sent to ${sellerEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send payment details updated email:', error);
    return false;
  }
};

module.exports = {
  sendInvitationEmail,
  verifyEmail
}; 
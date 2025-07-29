# Email Setup Guide for PayBridge

## Overview
PayBridge now includes email invitation functionality that sends beautiful HTML emails to invite other parties to transaction rooms.

## Email Configuration

### 1. Environment Variables
Add these to your `.env` file in the backend directory:

```env
# Email Configuration (for Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3001
```

### 2. Gmail Setup (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. This is required to generate App Passwords

#### Step 2: Generate App Password
1. Go to Google Account → Security
2. Find "App passwords" under 2-Step Verification
3. Select "Mail" and "Other (Custom name)"
4. Name it "PayBridge"
5. Copy the generated 16-character password

#### Step 3: Update .env File
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

### 3. Alternative Email Services

#### SendGrid (Recommended for Production)
```javascript
// In emailService.js, replace createTransporter with:
const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

#### AWS SES
```javascript
const transporter = nodemailer.createTransporter({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASSWORD
  }
});
```

## Features

### Email Validation
- ✅ Real-time email format validation
- ✅ Domain MX record verification
- ✅ Backend email verification endpoint

### Email Template
- ✅ Beautiful HTML email design
- ✅ Transaction details included
- ✅ Direct link to join room
- ✅ Room ID for reference
- ✅ Professional branding

### Security
- ✅ Email verification before sending
- ✅ Error handling for failed emails
- ✅ Room creation continues even if email fails

## Testing

### 1. Test Email Validation
```bash
curl -X POST http://localhost:3002/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Test Room Creation with Email
1. Fill out the CreateRoomForm with a valid email
2. Submit the form
3. Check the email inbox for the invitation

## Troubleshooting

### Common Issues

#### "Invalid email format"
- Check email regex validation
- Ensure email contains @ and domain

#### "Invalid email domain"
- Domain must have valid MX records
- Check DNS configuration

#### "Email sending failed"
- Verify EMAIL_USER and EMAIL_PASSWORD
- Check Gmail App Password setup
- Ensure 2FA is enabled

#### "Authentication failed"
- Use App Password, not regular password
- Check Gmail security settings
- Verify email credentials

## Production Deployment

### Recommended Email Services
1. **SendGrid** - Reliable, good deliverability
2. **AWS SES** - Cost-effective, scalable
3. **Mailgun** - Developer-friendly
4. **Postmark** - High deliverability

### Environment Variables for Production
```env
# SendGrid Example
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_SERVICE=sendgrid

# AWS SES Example
AWS_SES_USER=your-ses-user
AWS_SES_PASSWORD=your-ses-password
EMAIL_SERVICE=ses
```

## Email Template Customization

The email template is in `backend/utils/emailService.js`. You can customize:
- Colors and styling
- Content and messaging
- Logo and branding
- Call-to-action buttons

## Security Considerations

1. **Rate Limiting**: Implement rate limiting for email verification
2. **Email Validation**: Always validate emails before sending
3. **Error Handling**: Don't expose sensitive information in errors
4. **Logging**: Log email sending attempts for debugging
5. **Spam Prevention**: Use proper email headers and authentication 
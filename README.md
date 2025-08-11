# PayBridge - Secure Payment Escrow Platform

A full-stack web application that provides secure payment escrow services for buyers and sellers, featuring real-time communication, video calls, and automated payment processing.

## 🚀 Features

### Core Functionality
- **Secure Payment Escrow**: Hold payments until work completion
- **Real-time Chat**: WebSocket-based messaging system
- **Video Calls**: ZegoCloud-powered video conferencing
- **Work Progress Tracking**: Seller updates with buyer approval workflow
- **Payment Release**: Automated payment processing via Razorpay
- **File Sharing**: Document and image uploads
- **Dispute Resolution**: AI-powered chatbot for conflict resolution

### User Management
- **Role-based Access**: Buyer/Seller roles with different permissions
- **Authentication**: JWT-based secure login system
- **Profile Management**: User settings and preferences
- **Admin Panel**: User management and system monitoring

### Payment Integration
- **Razorpay Integration**: Secure payment processing
- **UPI & Bank Transfers**: Multiple payment methods
- **Automated Payouts**: Seller payment distribution
- **Transaction History**: Complete payment records

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **CSS Modules** for styling
- **Socket.IO Client** for real-time features
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **Razorpay SDK** for payments

### Infrastructure
- **ZegoCloud** for video calls
- **Nodemailer** for email services
- **JWT** for secure authentication

## 📋 Prerequisites

- Node.js 16+ 
- MongoDB 5+
- Razorpay account
- ZegoCloud account
- SMTP email service

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd payBridge
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Configure the following variables:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/paybridge
JWT_SECRET=your_jwt_secret_here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
ZEGOCLOUD_APP_ID=your_zegocloud_app_id
ZEGOCLOUD_SERVER_SECRET=your_zegocloud_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

```env
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_ZEGOCLOUD_APP_ID=your_zegocloud_app_id
```

### 4. Database Setup
```bash
# Start MongoDB
mongod

# Create admin user (optional)
cd backend
node scripts/createAdmin.js
```

### 5. Start Development Servers
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm start
```

## 🔧 Development

### Project Structure
```
payBridge/
├── backend/                 # Node.js/Express backend
│   ├── controllers/        # Business logic
│   ├── middleware/         # Authentication & validation
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── utils/             # Helper functions
│   └── app.js            # Main server file
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript definitions
│   └── public/            # Static assets
└── README.md              # This file
```

### Available Scripts

#### Backend
```bash
npm start          # Start development server
npm run dev        # Start with nodemon
npm test           # Run tests
npm run build      # Build for production
```

#### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 🔐 Authentication & Security

### JWT Implementation
- Secure token-based authentication
- Automatic token refresh
- Role-based access control
- Protected API endpoints

### Payment Security
- Razorpay secure payment gateway
- Encrypted transaction data
- Secure payout processing
- Audit logging for all transactions

## 💰 Payment Flow

1. **Buyer creates room** and makes payment
2. **Payment held in escrow** until work completion
3. **Seller starts work** and submits progress updates
4. **Buyer reviews** and approves/rejects work
5. **Payment released** to seller upon approval
6. **Transaction completed** with full audit trail

## 📱 Real-time Features

### WebSocket Integration
- Live chat messaging
- Real-time notifications
- Work status updates
- Payment status changes

### Video Calling
- ZegoCloud integration
- Screen sharing capabilities
- High-quality video/audio
- Cross-platform compatibility

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB
3. Set up SSL certificates
4. Configure production Razorpay keys
5. Set up monitoring and logging

### Environment Variables
Ensure all production environment variables are properly configured:
- Database connection strings
- API keys and secrets
- SMTP configuration
- Payment gateway credentials

## 🐛 Troubleshooting

### Common Issues

#### Frontend Not Loading
- Check if backend is running on port 3001
- Verify environment variables
- Clear browser cache

#### Database Connection Issues
- Ensure MongoDB is running
- Check connection string format
- Verify network access

#### Payment Integration Problems
- Validate Razorpay credentials
- Check webhook configurations
- Verify account status

#### Video Call Issues
- Confirm ZegoCloud credentials
- Check browser permissions
- Verify network connectivity

## 📞 Support

For technical support or questions:
- Check the issue tracker
- Review the documentation
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🔄 Version History

- **v1.0.0** - Initial release with core escrow functionality
- **v1.1.0** - Added video calling and real-time chat
- **v1.2.0** - Enhanced payment processing and dispute resolution
- **v1.3.0** - Improved UI/UX and performance optimizations

---

**PayBridge** - Making secure payments simple and transparent. 💰🔒✨

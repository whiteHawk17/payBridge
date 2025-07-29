# 🚀 Local Development Guide

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
NODE_ENV=development npm start
```

### 2. Frontend Setup  
```bash
cd frontend
npm install
npm start
```

## 🔧 Environment Configuration

### Backend (.env file in backend folder)
```env
# Development Settings
NODE_ENV=development
PORT=3002
MONGO_URI=mongodb://localhost:27017/paybridge
JWT_SECRET=your_local_jwt_secret_here

# Google OAuth (use your own credentials)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3002/auth/google/callback

# Frontend URL for development
FRONTEND_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email settings (optional for local dev)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

### Frontend (.env file in frontend folder)
```env
# Development Backend URL
REACT_APP_BACKEND_URL=http://localhost:3002
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **Socket.IO**: http://localhost:3002

## 🔄 Environment Detection

The app automatically detects if it's running in development mode:

- **Development**: Uses `localhost` URLs, relaxed CORS, no secure cookies
- **Production**: Uses `paybridge.site` URLs, strict CORS, secure cookies

## 📝 Key Features

✅ **No code changes needed** - Environment variables handle everything  
✅ **Production config preserved** - Git ignores local .env files  
✅ **Hot reload** - Changes reflect immediately  
✅ **Full functionality** - All features work locally  

## 🚨 Important Notes

1. **MongoDB**: Make sure MongoDB is running locally or use MongoDB Atlas
2. **Google OAuth**: Create a separate OAuth app for development
3. **Environment Files**: Never commit `.env` files to git
4. **Ports**: Backend runs on 3002, Frontend on 3000

## 🐛 Troubleshooting

### CORS Errors
- Check that `NODE_ENV=development` is set
- Verify backend is running on port 3002

### Authentication Issues  
- Clear browser cookies for localhost
- Check Google OAuth callback URL matches

### Socket Connection
- Ensure backend is running before frontend
- Check console for connection logs 
#!/bin/bash

echo "🚀 Setting up PayBridge for local development..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   brew services start mongodb-community"
    echo "   or"
    echo "   mongod"
    echo ""
fi

# Backend setup
echo "📦 Setting up backend..."
cd backend
if [ ! -f .env ]; then
    echo "📝 Creating .env file for backend..."
    cat > .env << EOF
# Development Settings
NODE_ENV=development
PORT=3002
MONGO_URI=mongodb://localhost:27017/paybridge
JWT_SECRET=local_development_secret_123

# Google OAuth (update with your credentials)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3002/auth/google/callback

# Frontend URL for development
FRONTEND_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email settings (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EOF
    echo "✅ Backend .env created. Please update Google OAuth credentials."
else
    echo "✅ Backend .env already exists."
fi

npm install
echo "✅ Backend dependencies installed."

# Frontend setup
echo "📦 Setting up frontend..."
cd ../frontend
if [ ! -f .env ]; then
    echo "📝 Creating .env file for frontend..."
    cat > .env << EOF
# Development Backend URL
REACT_APP_BACKEND_URL=http://localhost:3002
EOF
    echo "✅ Frontend .env created."
else
    echo "✅ Frontend .env already exists."
fi

npm install
echo "✅ Frontend dependencies installed."

echo ""
echo "🎉 Setup complete! To start development:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  NODE_ENV=development npm start"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "🌐 Your app will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3002"
echo ""
echo "📝 Don't forget to:"
echo "  1. Update Google OAuth credentials in backend/.env"
echo "  2. Start MongoDB if not already running"
echo "  3. Never commit .env files to git" 
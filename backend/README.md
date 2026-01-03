# Backend API Project

A basic Express.js backend API with a clean, organized structure ready for development.

## 🚀 Features

- ✅ Express.js server with middleware
- ✅ Security headers with Helmet
- ✅ CORS enabled
- ✅ Request logging with Morgan
- ✅ Environment variable configuration
- ✅ Error handling middleware
- ✅ RESTful API structure
- ✅ Sample CRUD operations
- ✅ Health check endpoints

## 📁 Project Structure

```
backend/
├── config/
│   └── config.js          # Configuration settings
├── controllers/
│   └── userController.js  # Business logic controllers
├── middleware/
│   ├── asyncHandler.js    # Async error handler
│   ├── errorHandler.js    # Global error handler
│   └── validation.js      # Request validation
├── models/                # Data models (when using database)
├── routes/
│   ├── health.js          # Health check routes
│   └── users.js           # User routes
├── utils/                 # Utility functions
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## 🛠️ Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional dependencies**
   ```bash
   npm install cors helmet morgan dotenv
   npm install --save-dev nodemon
   ```

4. **Set up environment variables**
   - Copy the `.env` file and configure your settings
   - Update the PORT and other configurations as needed

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📋 API Endpoints

### Health Check
- `GET /` - Root endpoint with server info
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health information

### Users (Sample CRUD)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Example User Object
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development
```

### Available npm Scripts
- `npm start` - Run the server in production mode
- `npm run dev` - Run the server in development mode with nodemon
- `npm test` - Run tests (to be implemented)

## 📦 Dependencies

### Production Dependencies
- **express** - Web framework
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logger
- **dotenv** - Environment variable loader

### Development Dependencies
- **nodemon** - Auto-restart server during development

## 🚀 Next Steps

To extend this backend further, consider adding:

1. **Database Integration**
   - MongoDB with Mongoose
   - PostgreSQL with Sequelize
   - SQLite for development

2. **Authentication & Authorization**
   - JWT tokens
   - Passport.js
   - Role-based access control

3. **Validation**
   - Joi for request validation
   - Express-validator

4. **Testing**
   - Jest for unit testing
   - Supertest for API testing

5. **Documentation**
   - Swagger/OpenAPI
   - Postman collections

6. **Additional Features**
   - File upload handling
   - Email services
   - Caching (Redis)
   - Rate limiting

## 🐛 Testing the API

You can test the API using:

### Using curl
```bash
# Health check
curl http://localhost:3000/api/health

# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Johnson","email":"alice@example.com","role":"user"}'
```

### Using a REST client
- Postman
- Insomnia
- VS Code REST Client extension

## 📝 License

ISC License

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
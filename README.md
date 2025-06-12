# Social Application Backend

A scalable microservices-based social media application backend built with Node.js, featuring user authentication, post management, media handling, and search capabilities.

## 🏗️ Architecture Overview

This application follows a microservices architecture pattern with the following services:

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    │    (Port 3000)  │
                    └─────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ User Service │    │Post Service │    │Media Service │
│  (Port 3001) │    │ (Port 3002) │    │ (Port 3003)  │
└──────────────┘    └─────────────┘    └──────────────┘
        │                    │                    │
        │            ┌───────┴───────┐            │
        │            │               │            │
        │            ▼               ▼            ▼
        │    ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
        │    │Search Service│ │   RabbitMQ  │ │  Cloudinary  │
        │    │ (Port 3004)  │ │Message Queue│ │Media Storage │
        │    └──────────────┘ └─────────────┘ └──────────────┘
        │            │               ▲            
        │            │               │            
        ▼            ▼               │            
┌───────────────┐ ┌─────────┐      │            
│   MongoDB     │ │  Redis  │──────┘            
│  (Database)   │ │ (Cache) │                   
│               │ │         │                   
│ • User Data   │ │ • Posts │                   
│ • Posts       │ │ • Search│                   
│ • Media Meta  │ │ • Cache │                   
│ • Search Data │ └─────────┘                   
└───────────────┘                               
```

**Data Flow:**
- **MongoDB**: Used by all services for persistent data storage
- **Redis**: Used by Post Service (caching feeds) and Search Service (caching search results)
- **RabbitMQ**: Message queue between Post, Media, and Search services for async processing
- **Cloudinary**: External service for media storage and transformations

## 🚀 Services

### API Gateway
- **Port**: `3000`
- Entry point for all client requests
- Request routing and load balancing
- Rate limiting and request validation
- Authentication middleware

### User Service
- **Port**: `3001`
- User registration and authentication
- JWT token generation and validation
- Password encryption and security

### Post Service
- **Port**: `3002`
- CRUD operations for posts

### Media Service
- **Port**: `3003`
- File upload and storage via Cloudinary
- Image/video processing and optimization
- Media metadata management
- Automatic image transformations and CDN delivery

### Search Service
- **Port**: `3004`
- Full-text search for posts and users

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Database**: MongoDB
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT (JSON Web Tokens)
- **Media Storage**: Cloudinary

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) and Docker Compose
- [MongoDB](https://www.mongodb.com/) (if running locally)
- [Redis](https://redis.io/) (if running locally)
- [RabbitMQ](https://www.rabbitmq.com/) (if running locally)

## 🏃‍♂️ Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/ritik6559/Node-microservices.git
   cd Node-microservices
   ```

2. **Environment Setup**
   ```bash
   # Edit .env file with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running**
   ```bash
   docker-compose ps
   ```

The API Gateway will be available at `http://localhost:3000`

### Manual Setup

1. **Install dependencies for each service**
   ```bash
   # API Gateway
   cd api-gateway && npm install && cd ..
   
   # User Service
   cd user-service && npm install && cd ..
   
   # Post Service
   cd post-service && npm install && cd ..
   
   # Media Service
   cd media-service && npm install && cd ..
   
   # Search Service
   cd search-service && npm install && cd ..
   ```

2. **Start infrastructure services**
   ```bash
   # Start MongoDB, Redis, and RabbitMQ
   docker-compose up -d mongodb redis rabbitmq
   ```

3. **Start microservices**
   ```bash
   # Terminal 1
   cd api-gateway && npm start
   
   # Terminal 2
   cd user-service && npm start
   
   # Terminal 3
   cd post-service && npm start
   
   # Terminal 4
   cd media-service && npm start
   
   # Terminal 5
   cd search-service && npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in each service directory:

```env
# API-GATEWAY .env
PORT=3000
NODE_ENV=development
USER_SERVICE_URL=http://localhost:3001
POST_SERVICE_URL=http://localhost:3002
MEDIA_SERVICE_URL=http://localhost:3003
SEARCH_SERVICE_URL=http://localhost:3004
REDIS_URL=redis://localhost:6379
JWT_SECRET=

# CLOUDINARY
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=

# REST
PORT=3003
MONGODB_URI=
NODE_ENV=development
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672



# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

- **Ritik Joshi**

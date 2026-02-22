# Game Screenshot Identifier

A React-based web application that allows gamers to identify games by uploading screenshots. The application uses an ML model (placeholder ready) to identify games and stores the results in a MongoDB database.

## Features

- 📸 Upload game screenshots
- 🤖 ML model integration (placeholder ready for your model)
- 💾 Save identified games to database
- 📚 View identification history
- 🎨 Modern, responsive UI

## Project Structure

```
GP/
├── my-app/          # React frontend
│   └── src/
│       ├── GameIdentifier.jsx    # Main identification page
│       ├── GameHistory.jsx       # History page
│       ├── App.jsx               # Main app with routing
│       └── Navbar.jsx            # Navigation component
└── server/          # Express backend
    ├── index.js     # Main server file
    └── uploads/     # Screenshot storage (created automatically)
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/gameidentifier
PORT=5000
```

Start MongoDB (if running locally):
```bash
# Windows (if MongoDB is installed as a service, it should start automatically)
# Or download and run MongoDB Community Server

# Mac/Linux
mongod
```

Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd my-app
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## ML Model Integration

The backend has a placeholder endpoint ready for your ML model. In `server/index.js`, find the `/api/games/identify` endpoint and replace the mock result with your ML model call:

```javascript
// Current placeholder:
const mockResult = { ... };

// Replace with:
const mlResult = await identifyGameWithML(screenshotPath);
const result = {
  gameName: mlResult.name,
  gameId: mlResult.id,
  confidence: mlResult.confidence,
  metadata: mlResult.metadata,
};
```

You can add your ML model integration function in a separate file (e.g., `server/mlModel.js`) and import it:

```javascript
// server/mlModel.js
async function identifyGameWithML(imagePath) {
  // Your ML model code here
  // This could call a Python API, TensorFlow.js, or any ML service
  return {
    name: 'Identified Game',
    id: 'game-id',
    confidence: 0.95,
    metadata: { ... }
  };
}

module.exports = { identifyGameWithML };
```

## API Endpoints

### POST `/api/games/identify`
Upload a screenshot and get game identification (calls ML model)

**Request:** FormData with `screenshot` file
**Response:** 
```json
{
  "gameName": "Game Name",
  "gameId": "game-id",
  "confidence": 0.85,
  "metadata": { ... },
  "screenshotUrl": "/uploads/filename.jpg"
}
```

### POST `/api/games/save`
Save an identified game to the database

**Request:** FormData with `screenshot`, `gameName`, `gameId`, `confidence`, `metadata`
**Response:** Saved game object

### GET `/api/games`
Get all saved game identifications

**Response:** Array of game objects

### GET `/api/games/:id`
Get a specific game by ID

### DELETE `/api/games/:id`
Delete a game identification

## Database Schema

```javascript
{
  gameName: String (required),
  gameId: String,
  screenshotUrl: String (required),
  screenshotPath: String (required),
  confidence: Number (0-1),
  metadata: Map (key-value pairs),
  createdAt: Date
}
```

## Usage

1. Navigate to the "Identify Game" page
2. Upload a screenshot of a game
3. Click "Identify Game" (currently returns mock data until ML model is integrated)
4. Review the identification result
5. Click "Save to Database" to store it
6. View all saved identifications in the "History" page

## Technologies Used

- **Frontend:** React, React Router, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **File Upload:** Multer
- **Styling:** CSS with modern gradients and responsive design

## Development

- Frontend runs on Vite dev server with hot reload
- Backend uses nodemon for auto-restart
- Screenshots are stored in `server/uploads/` directory
- MongoDB connection is configured via `.env` file

## Next Steps

1. Integrate your ML model into the `/api/games/identify` endpoint
2. Add user authentication if needed
3. Add more game metadata fields
4. Implement image preprocessing if required by your ML model
5. Add pagination for the history page
6. Add search/filter functionality

## Troubleshooting

- **MongoDB connection error:** Make sure MongoDB is running and the connection string in `.env` is correct
- **Port already in use:** Change the PORT in `.env` or kill the process using that port
- **File upload errors:** Check that the `uploads` directory exists and has write permissions
- **CORS errors:** The backend has CORS enabled, but make sure frontend URL matches

## License

ISC

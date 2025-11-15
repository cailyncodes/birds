# Birds

A basic Python Sanic API with Qwik frontend that displays information about various bird species.

## Project Structure

- **Backend**: Python Sanic API (`main.py`)
- **Frontend**: Qwik application (`frontend/`)

## Features

- RESTful API endpoints for bird data
- Interactive frontend to display bird information
- CORS enabled for frontend-backend communication
- Sample data for 5 different bird species

## Prerequisites

- Python 3.12+
- Node.js 20+
- npm 10+

## Setup and Running

### Backend (Sanic API)

1. Install Python dependencies:
```bash
pip3 install -r requirements.txt
```

2. Run the Sanic server:
```bash
python3 main.py
```

The API will be available at `http://localhost:8000`

### API Endpoints

- `GET /` - Welcome message
- `GET /api/birds` - Get all birds
- `GET /api/birds/<id>` - Get a specific bird by ID

### Frontend (Qwik)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Run the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:5173`

## Development

The frontend uses Vite proxy to forward API requests from `/api` to `http://localhost:8000`, so make sure the backend is running before starting the frontend.

## Tech Stack

- **Backend**: 
  - Sanic 23.12.1 (Python async web framework)
  - sanic-cors 2.2.0 (CORS support)

- **Frontend**:
  - Qwik (Resumable framework)
  - Vite (Build tool)
  - TypeScript
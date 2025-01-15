# Weather-Based Travel Planner Backend

A Node.js/Express backend service that integrates multiple APIs to provide weather-based travel recommendations and activity suggestions.

## Features

- City/Location search with coordinates mapping
- Real-time weather data and 7-day forecasts
- Weather-based activity recommendations
- User authentication and profile management
- Favorites list functionality
- Map integration for location visualization

## Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **API Integrations:**
  - OpenWeatherMap API (weather data)
  - Mapbox API (geocoding)
  - Foursquare API (places and activities)

## Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- npm or yarn package manager
- Firebase account and project
- API keys for:
  - OpenWeatherMap
  - Mapbox
  - Foursquare
  - Firebase configuration

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MAPBOX_TOKEN=your_mapbox_token
OPENWEATHER_API_KEY=your_openweather_key
FOURSQUARE_API_KEY=your_foursquare_key

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=your_client_cert_url
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/CrocAxe/Backend_Node
cd Backend_Node
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Weather and Location Routes
- `GET /api/location` - Get weather and activity recommendations by city name
  - Query params: `city` (required)
- `GET /api/current-location` - Get weather and recommendations for current coordinates
  - Query params: `latitude` and `longitude` (required)

### Authentication Routes
- `POST /users/register` - Register new user
- `POST /users/login` - User login

### Profile Routes (Protected)
- `GET /profile/get-profile` - Get user profile
- `POST /profile/update-profile` - Update user profile

## Response Examples

### Location Details Response
```json
{
  "location": {
    "city": "City Name",
    "coordinates": {
      "latitude": 0.0,
      "longitude": 0.0
    }
  },
  "forecast": [
    {
      "date": "2024-01-15",
      "temp_min": 20,
      "temp_max": 25,
      "description": "clear sky"
    }
  ],
  "mapbox": {
    "center": [longitude, latitude]
  },
  "recommendedPlaces": [
    {
      "name": "Place Name",
      "category": "Category",
      "address": "Full Address",
      "coordinates": {
        "latitude": 0.0,
        "longitude": 0.0
      }
    }
  ]
}
```

## Error Handling

The API implements standard HTTP status codes:
- 200: Successful request
- 400: Bad request (missing parameters)
- 401: Unauthorized
- 500: Server error

## Challenges and Solutions

1. **API Integration Complexity**
   - Challenge: Managing multiple API calls and their responses
   - Solution: Implemented modular controller functions and error handling for each API service

2. **Weather-Based Activity Mapping**
   - Challenge: Creating relevant activity recommendations based on weather
   - Solution: Developed a mapping system that associates weather conditions with activity categories

3. **Authentication Security**
   - Challenge: Securing routes and managing user sessions
   - Solution: Implemented Firebase Authentication and middleware for protected routes

## Contributors

### Core Team
- [Xoli Nxiweni](https://github.com/Xoli-Nxiweni) - Frontend Dev
- [Comfort](https://github.com/ComfortN) - Backend Dev


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenWeatherMap API for weather data
- Mapbox for geocoding services
- Foursquare for places and activities data
- Firebase for authentication and database services

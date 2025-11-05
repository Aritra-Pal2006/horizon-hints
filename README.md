# AI Travel Guide – Smart AI-Powered Travel Planner 🌍

A modern, sleek, and responsive AI Travel Guide web app that helps users plan trips intelligently using AI technologies.

## 🌟 Features

### Core Features
- **AI Travel Assistant**: Chat-based assistant powered by Google Gemini API
- **AI Itinerary Generator**: Creates structured day-by-day travel plans
- **Smart Destination Recommender**: Suggests travel spots based on preferences
- **Weather Integration**: Real-time weather data from OpenWeather API
- **City Search**: Autocomplete destination search with GeoDB Cities API
- **Nearby Attractions**: Points of interest from Foursquare Places API
- **Interactive Maps**: Mapbox integration for visualizing destinations
- **User Authentication**: Firebase Auth for secure login/signup
- **Favorites & Notes**: Save destinations and personal travel notes
- **Floating Chatbot**: Always-accessible AI assistant

### Technical Features
- **Modern UI**: Built with React.js, TailwindCSS, and Shadcn UI
- **Responsive Design**: Works on all device sizes
- **Real-time Data**: Live information about attractions and places
- **Data Persistence**: Firebase Firestore for storing user data
- **Secure Authentication**: Email/password and Google OAuth options

## 🛠️ Tech Stack

- **Frontend**: React.js + TailwindCSS + Shadcn UI
- **Backend / DB / Auth**: Firebase (Authentication + Firestore + Hosting)
- **AI Engine**: Google Gemini API
- **Mapping**: Mapbox
- **Weather Data**: OpenWeather API
- **City Search**: GeoDB Cities API
- **Attractions**: Foursquare Places API
- **Deployment**: Firebase Hosting

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- API keys for all services (see below)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-travel-guide
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your API keys:
```env
# Firebase Config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# API Keys
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_GEODB_API_KEY=your_geodb_api_key
VITE_FOURSQUARE_API_KEY=your_foursquare_api_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser to `http://localhost:8080`

### Building for Production

```bash
npm run build
# or
yarn build
```

### Deployment

The app is configured for Firebase Hosting. To deploy:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```

4. Deploy:
```bash
firebase deploy
```

## 📁 Project Structure

```
ai-travel-guide/
│
├── public/
│   ├── assets/        ← icons, images
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ChatBot.tsx
│   │   ├── WeatherCard.tsx
│   │   ├── DestinationCard.tsx
│   │   ├── MapView.tsx
│   │   └── Loader.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Explore.tsx
│   │   ├── DestinationDetails.tsx
│   │   ├── Itinerary.tsx
│   │   ├── Favorites.tsx
│   │   ├── Profile.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── ForgotPassword.tsx
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx
│   │
│   ├── utils/
│   │   ├── firebase.ts           ← Firebase config
│   │   ├── weatherService.ts     ← OpenWeather API calls
│   │   ├── geoDBService.ts       ← GeoDB API calls
│   │   └── firestoreService.ts   ← Firestore data operations
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env                          ← API keys (not in repo)
└── package.json
```

## 🔐 API Keys Setup

To run this application, you'll need to obtain API keys for the following services:

1. **Firebase**: Create a Firebase project at https://console.firebase.google.com/
2. **Google Gemini API**: Get an API key at https://ai.google.dev/
3. **OpenWeather API**: Register at https://openweathermap.org/api
4. **GeoDB Cities API**: Get a key at https://rapidapi.com/wirefreethought/api/geodb-cities/
5. **Foursquare Places API**: Register at https://developer.foursquare.com/
6. **Mapbox**: Create an account at https://www.mapbox.com/

## 🎨 UI/UX Design

- **Sleek, modern, mobile-first design** using TailwindCSS + Shadcn UI
- **Smooth animations** with Framer Motion
- **Consistent color palette** (sky blue, soft white, gray tones)
- **Responsive layout** that works on all device sizes
- **Intuitive navigation** with a clean navbar

## 🔄 App Flow

1. **Home Page**: Hero banner, destination search, quick actions
2. **Explore Page**: Curated destinations, search functionality
3. **Destination Details**: Comprehensive information about a location
4. **AI Planner**: Chat interface and itinerary generation
5. **Map Explorer**: Interactive map with attractions
6. **Favorites**: Saved destinations and itineraries
7. **Profile**: User information and saved data
8. **Auth Pages**: Login, signup, and password reset

## 💾 Data Structure

The app uses Firebase Firestore with the following collections:

- **users**: User profiles and preferences
- **itineraries**: Generated travel plans
- **favorites**: Saved destinations
- **chatMessages**: Conversation history with AI assistant

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all API providers for their excellent services
- UI components powered by Shadcn UI
- Icons from Lucide React
- Animations with Framer Motion
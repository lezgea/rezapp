# Rezidy Mobile App

### Pre-requisites
- Node v20

### Getting Started
```bash
cd /path/to/rezidy
git clone ...
cd app
npm ci
cp .env.template .env
```

### Running the Expo Server
```bash
npm start
```

### Environment Variables
By default, the app will hit the production API server.  
This is, of course, not ideal.  
If you are running the API server locally, you can set `EXPO_PUBLIC_API_BASE_URL` in your `.env` to be the address of your development machine.  
For me, it is `http://Emils-MacBook-Pro.local:3010`.  
To have your `.env` changes reflected, simply reload the app (or press 'r' in Expo's terminal).  

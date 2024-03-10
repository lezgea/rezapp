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
This, of course, is not ideal.  
If you are running the API server locally, you can set `EXPO_PUBLIC_API_BASE_URL` in your `.env` to be the address of your development machine.  
For me, it is `http://Emils-MacBook-Pro.local:3010`.  
To have your `.env` changes reflected, simply reload the app (or press 'r' in Expo's terminal).  
Note that empty string values will NOT be reflected and so you would see the previous value for those variables.  
For this reason, I suggest defaulting to a space and trimming the values in application code.  

### Adding a New Language
0. Let's say we want to support French (id `fr`).
1. Tell ChatGPT to translate the string values in `src/strings/en.js` to French.
2. Copy the resulting translated data to `src/strings/fr.js`.
    - Ensure that `appName` is NOT be translated, i.e. it should stay as `Rezidy`.
    - Ensure that `langId` is `fr`.
    - Ensure that `langNativeName` is `Français`.
3. Make the following changes to `src/strings/index.js`:
    - Add `import fr from './fr';` to the top of the file.
    - Add `fr` to the LANGUAGES arrray.

In Expo Go, ensure the Rezidy project is reloaded.  
Go to the User Settings screen by clicking the ⚙️ icon on the top right after logging in.  
You should see a new language tab: `Français`.  
After clicking it, you should see the app is now in French!  
The selected language will persist across app restarts.  

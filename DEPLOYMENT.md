# Deployment Guide for Render

This guide explains how to deploy the Horizon Hints application on Render.

## Files Created/Modified

1. **[render.yaml](render.yaml)** - Configuration file for Render deployment
2. **[README.md](README.md)** - Updated with Render deployment instructions
3. **[.env](.env)** - Added deployment notes for Render
4. **[vite.config.ts](vite.config.ts)** - Updated to allow Render preview hosts

## Render Deployment Steps

1. Fork this repository to your GitHub account
2. Sign up or log in to [Render](https://render.com/)
3. Click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service with these settings:
   - Name: horizon-hints (or your preferred name)
   - Region: (your choice)
   - Branch: main (or your preferred branch)
   - Root Directory: (leave empty)
   - Environment: Node
   - Build Command: `npm run build`
   - Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - Auto Deploy: Yes (if you want automatic deployments on push)

6. Add environment variables in the Render dashboard:
   Go to the "Environment" section and add all the environment variables from your `.env` file.
   
   For security, you can choose to mark them as "Secret" in Render.

7. Click "Create Web Service" to deploy

## Environment Variables

The following environment variables need to be set in the Render dashboard:

```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_GEMINI_API_KEY
VITE_OPENWEATHER_API_KEY
VITE_GEODB_API_KEY
VITE_FOURSQUARE_API_KEY
VITE_MAPBOX_TOKEN
```

## Host Configuration

The Vite configuration has been updated to allow requests from the Render preview URL (`horizon-hints.onrender.com`). This resolves the "Blocked request" error that occurs when trying to access the application.

## Supabase Functions

Note that this application uses Supabase functions for the AI chat feature. If you're using Supabase, you'll need to deploy those functions separately:

1. Install the Supabase CLI
2. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
3. Deploy functions: `supabase functions deploy`

## Troubleshooting

If you encounter issues during deployment:

1. Check that all environment variables are correctly set in the Render dashboard
2. Ensure the build command completes successfully
3. Check the logs in the Render dashboard for any error messages
4. Verify that your API keys are valid and have the necessary permissions
5. If you see "Blocked request" errors, ensure the vite.config.ts file includes the Render host in allowedHosts

## Support

For additional help with deployment, please check the main [README.md](README.md) file or open an issue in the repository.
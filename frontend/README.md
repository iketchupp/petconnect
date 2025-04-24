# PetConnect

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Getting a Google Maps API Key

To use the address autocomplete feature in shelter registration:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Places API and Maps JavaScript API:
   - In the left sidebar, click "APIs & Services" > "Library"
   - Search for "Places API" and enable it
   - Search for "Maps JavaScript API" and enable it
   - **Both APIs must be enabled for the address autocomplete to work**
4. Create an API key in the Credentials section:
   - In the left sidebar, click "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
5. Set appropriate restrictions for the API key:
   - After creating the key, click "Edit API key"
   - Under "Application restrictions", you can set to "HTTP referrers" for better security
   - Under "API restrictions", restrict to only "Places API" and "Maps JavaScript API"
6. Add the API key to your `.env.local` file as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

If you encounter the error "This API project is not authorized to use this API" or "ApiNotActivatedMapError", it means you need to enable the Places API in your Google Cloud project.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

# GigFinder - Skiddle Integration Setup

## 🔑 Step 1: Add Your Skiddle API Key

1. Open the file: `.env.local` in the `gig-finder-app` folder
2. Replace `your_skiddle_api_key_here` with your actual Skiddle API key:

```
SKIDDLE_API_KEY=your_actual_api_key_from_skiddle
```

## 🚀 Step 2: Start the Development Server

```bash
cd gig-finder-app
npm run dev
```

The server will start at `http://localhost:3000`

## 📡 Step 3: Test the API

Open your browser and visit:
```
http://localhost:3000/api/events?location=Edinburgh
```

You should see JSON data with events from Skiddle!

## 🎯 API Parameters

The `/api/events` endpoint accepts these query parameters:

- `location` - City name (default: "Edinburgh")
  - Example: `?location=Glasgow`
  
- `genre` - Music genre filter
  - Example: `?genre=rock`
  
- `minDate` - Minimum date (YYYY-MM-DD)
  - Example: `?minDate=2024-12-10`
  
- `maxDate` - Maximum date (YYYY-MM-DD)
  - Example: `?maxDate=2024-12-31`

### Example Queries:

```
# All Edinburgh gigs
/api/events?location=Edinburgh

# Glasgow rock gigs
/api/events?location=Glasgow&genre=rock

# Edinburgh gigs this week
/api/events?location=Edinburgh&minDate=2024-12-05&maxDate=2024-12-12
```

## 📋 Next Steps

1. ✅ API route created
2. ⏳ Update frontend to use this API
3. ⏳ Add manual data override for venues not on Skiddle
4. ⏳ Deploy to production

## 🔧 Troubleshooting

**Error: "Skiddle API key not configured"**
- Make sure you've added your API key to `.env.local`
- Restart the dev server after adding the key

**Error: "Failed to fetch events"**
- Check your API key is valid
- Check your internet connection
- Check Skiddle API status

## 📚 Skiddle API Documentation

https://www.skiddle.com/api/documentation/

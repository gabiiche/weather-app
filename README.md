# Weather

A small 5-day weather forecast for London. Pick a day to see the temperature, rain, humidity, wind and the 3-hour breakdown.

## How it's built

- React 19 and TypeScript, built with Vite
- Data from the OpenWeather 5-day forecast API
- The API response is typed with TypeScript interfaces (`ForecastItem`, `ForecastResponse`)
- The API key is kept on the server. The browser only calls `/api/forecast`, which is a Netlify Function (`netlify/functions/forecast.mjs`) that adds the key and forwards the request. The key is never in the code sent to the browser.

## Run it locally

1. Get a free API key at [openweathermap.org](https://openweathermap.org/api).
2. Copy `.env.example` to `.env` and put your key in it:

```
OPENWEATHER_API_KEY=your_openweathermap_key
```

3. Install and start:

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

In development, Vite proxies `/api/forecast` to OpenWeather and adds the key from `.env`, so it behaves like the Netlify Function.

## Deploy

On Netlify, import the repo and add `OPENWEATHER_API_KEY` under Site configuration > Environment variables. The build settings are in `netlify.toml`.

## Next

- Choose the city
- Style the interface (it is intentionally plain for now)

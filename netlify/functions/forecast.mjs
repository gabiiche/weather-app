// Netlify Function: calls OpenWeather on the server so the API key never reaches the browser.
// Set OPENWEATHER_API_KEY in Netlify (Site configuration > Environment variables).

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export default async (request) => {
  const apiKey = Netlify.env.get('OPENWEATHER_API_KEY')

  if (!apiKey) {
    return json({ message: 'The server is missing its weather API key.' }, 500)
  }

  const city = (new URL(request.url).searchParams.get('q') || 'London').slice(0, 60)

  const upstream = new URL('https://api.openweathermap.org/data/2.5/forecast')
  upstream.searchParams.set('q', city)
  upstream.searchParams.set('cnt', '40')
  upstream.searchParams.set('appid', apiKey)

  const response = await fetch(upstream)

  return new Response(await response.text(), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config = { path: '/api/forecast' }

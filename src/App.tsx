import { useState, useEffect } from 'react'

// Shape of the data we use from the OpenWeather 5-day forecast.
interface ForecastItem {
  dt_txt: string
  main: {
    temp: number
    feels_like: number
    temp_max: number
    temp_min: number
    humidity: number
  }
  weather: { main: string }[]
  wind: { speed: number }
  clouds: { all: number }
  rain?: { '3h'?: number }
}

interface ForecastResponse {
  list?: ForecastItem[]
  message?: string
}

// The API returns one slot every 3 hours, so a day is 8 slots.
const SLOTS_PER_DAY = 8
const DAY_INDICES = [0, 1, 2, 3, 4]

const toCelsius = (kelvin: number): number => kelvin - 273.15
const toMph = (metresPerSecond: number): number => metresPerSecond * 2.237

const convertTime = (timeString: string): string => {
  const hour = parseInt(timeString.split(' ')[1].split(':')[0])
  const suffix = hour < 12 ? 'AM' : 'PM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  return `${displayHour}${suffix}`
}

function App() {
  const [forecast, setForecast] = useState<ForecastItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)

  useEffect(() => {
    // The API key lives on the server (see netlify/functions/forecast.mjs),
    // so the browser only calls our own /api/forecast endpoint.
    fetch('/api/forecast?q=London')
      .then(async (response) => {
        const data = (await response.json()) as ForecastResponse

        if (!response.ok || !Array.isArray(data.list)) {
          throw new Error(data.message ?? `Weather request failed (${response.status})`)
        }

        return data.list
      })
      .then(setForecast)
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) return <p role="alert">{error}</p>
  if (!forecast) return <p>Loading…</p>

  const selected = forecast[selectedDay * SLOTS_PER_DAY]
  const selectedDate = selected.dt_txt.split(' ')[0]
  const hourly = forecast.filter((item) => item.dt_txt.startsWith(selectedDate))

  const dayNames = DAY_INDICES.map((day) =>
    new Date(forecast[day * SLOTS_PER_DAY].dt_txt).toLocaleDateString('en-US', {
      weekday: 'short',
    }),
  )

  const highest = Math.max(...hourly.map((item) => item.main.temp_max))
  const lowest = Math.min(...hourly.map((item) => item.main.temp_min))
  const dayOfMonth = new Date(selected.dt_txt).getDate()

  return (
    <main>
      <nav aria-label="Forecast days">
        <ul>
          {DAY_INDICES.map((day) => (
            <li key={day}>
              <button
                type="button"
                aria-pressed={selectedDay === day}
                onClick={() => setSelectedDay(day)}
              >
                {dayNames[day]}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <h1>{Math.round(toCelsius(selected.main.temp))}</h1>
      {selectedDay === 0 && <p>now - feels {Math.round(toCelsius(selected.main.feels_like))}</p>}
      <p>
        {selected.weather[0].main} - {dayNames[selectedDay]} {dayOfMonth}
      </p>

      <p>Highest temperature - {Math.round(toCelsius(highest))}</p>
      <p>Lowest temperature - {Math.round(toCelsius(lowest))}</p>
      <p>Rain - {selected.rain?.['3h'] ?? 0}</p>
      <p>Humidity - {selected.main.humidity}</p>
      <p>Wind - {Math.round(toMph(selected.wind.speed))}</p>

      <table>
        <thead>
          <tr>
            <th scope="col">time</th>
            <th scope="col">sky</th>
            <th scope="col">temp c</th>
            <th scope="col">rain mm</th>
            <th scope="col">Wind mph</th>
          </tr>
        </thead>
        <tbody>
          {hourly.map((item) => (
            <tr key={item.dt_txt}>
              <td>{convertTime(item.dt_txt)}</td>
              <td>{item.clouds.all < 30 ? 'blue sky' : 'cloudy'}</td>
              <td>{Math.round(toCelsius(item.main.temp))}</td>
              <td>{item.rain?.['3h'] ?? 0}</td>
              <td>{Math.round(toMph(item.wind.speed))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export default App

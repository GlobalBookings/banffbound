/**
 * Weather fetcher — current conditions + 5-day forecast for Banff and Lake Louise
 * Source: Open-Meteo API (free, no key needed, reliable)
 */

const LOG_PREFIX = '[weather]';
const TIMEOUT_MS = 10_000;

const LOCATIONS = {
  banff: { lat: 51.178, lng: -115.571, name: 'Banff' },
  lakeLouise: { lat: 51.425, lng: -116.177, name: 'Lake Louise' },
};

const WMO_CODES = {
  0: { condition: 'Clear sky', icon: '☀️' },
  1: { condition: 'Mainly clear', icon: '🌤️' },
  2: { condition: 'Partly cloudy', icon: '⛅' },
  3: { condition: 'Overcast', icon: '☁️' },
  45: { condition: 'Foggy', icon: '🌫️' },
  48: { condition: 'Depositing rime fog', icon: '🌫️' },
  51: { condition: 'Light drizzle', icon: '🌦️' },
  53: { condition: 'Moderate drizzle', icon: '🌦️' },
  55: { condition: 'Dense drizzle', icon: '🌧️' },
  61: { condition: 'Slight rain', icon: '🌦️' },
  63: { condition: 'Moderate rain', icon: '🌧️' },
  65: { condition: 'Heavy rain', icon: '🌧️' },
  71: { condition: 'Slight snowfall', icon: '🌨️' },
  73: { condition: 'Moderate snowfall', icon: '🌨️' },
  75: { condition: 'Heavy snowfall', icon: '❄️' },
  77: { condition: 'Snow grains', icon: '🌨️' },
  80: { condition: 'Slight rain showers', icon: '🌦️' },
  81: { condition: 'Moderate rain showers', icon: '🌧️' },
  82: { condition: 'Violent rain showers', icon: '🌧️' },
  85: { condition: 'Slight snow showers', icon: '🌨️' },
  86: { condition: 'Heavy snow showers', icon: '❄️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
  96: { condition: 'Thunderstorm with hail', icon: '⛈️' },
  99: { condition: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

function decodeWMO(code) {
  return WMO_CODES[code] || { condition: 'Unknown', icon: '🌡️' };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function fetchLocation(loc) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=America/Edmonton&forecast_days=5`;

  console.log(`${LOG_PREFIX} Fetching ${loc.name} weather`);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      console.log(`${LOG_PREFIX} HTTP ${res.status} for ${loc.name}`);
      return null;
    }

    const data = await res.json();
    const wmo = decodeWMO(data.current.weather_code);

    const current = {
      temp: Math.round(data.current.temperature_2m),
      condition: wmo.condition,
      icon: wmo.icon,
      humidity: data.current.relative_humidity_2m,
      wind: `${Math.round(data.current.wind_speed_10m)} km/h`,
    };

    const forecast = data.daily.time.map((dateStr, i) => {
      const date = new Date(dateStr + 'T12:00:00');
      const dayWmo = decodeWMO(data.daily.weather_code[i]);
      return {
        day: i === 0 ? 'Today' : DAY_NAMES[date.getDay()],
        high: Math.round(data.daily.temperature_2m_max[i]),
        low: Math.round(data.daily.temperature_2m_min[i]),
        condition: dayWmo.condition,
        icon: dayWmo.icon,
      };
    });

    return { current, forecast };
  } catch (err) {
    console.log(`${LOG_PREFIX} Error fetching ${loc.name}: ${err.message}`);
    return null;
  }
}

export async function fetchWeather() {
  console.log(`${LOG_PREFIX} Starting weather data fetch…`);

  const [banff, lakeLouise] = await Promise.all([
    fetchLocation(LOCATIONS.banff),
    fetchLocation(LOCATIONS.lakeLouise),
  ]);

  const empty = { current: { temp: null, condition: 'Unknown', icon: '🌡️', humidity: null, wind: '' }, forecast: [] };

  const data = {
    updatedAt: new Date().toISOString(),
    banff: banff || empty,
    lakeLouise: lakeLouise || empty,
    ...(!banff && !lakeLouise ? { error: 'fetch failed' } : {}),
  };

  console.log(`${LOG_PREFIX} Banff: ${data.banff.current.temp}°C ${data.banff.current.condition}, Lake Louise: ${data.lakeLouise.current.temp}°C ${data.lakeLouise.current.condition}`);
  return data;
}

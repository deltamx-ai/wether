import { useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Search, MapPin } from 'lucide-react';

interface WeatherData {
  temp: number;
  wind: number;
  code: number;
  city: string;
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getCoordinates = async (cityName: string) => {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;
    const res = await fetch(geoUrl);
    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error('City not found');
    return data.results[0];
  };

  const fetchWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    try {
      const location = await getCoordinates(city);
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}¤t_weather=true`;
      const res = await fetch(weatherUrl);
      const data = await res.json();
      
      setWeather({
        temp: data.current_weather.temperature,
        wind: data.current_weather.windspeed,
        code: data.current_weather.weathercode,
        city: location.name
      });
    } catch (err) {
      setError('Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="w-16 h-16 text-yellow-400" />;
    if (code <= 3) return <Cloud className="w-16 h-16 text-gray-400" />;
    return <CloudRain className="w-16 h-16 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Sun className="w-8 h-8 text-yellow-300" /> Weather
          </h1>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
              />
            </div>
            <button 
              onClick={fetchWeather}
              disabled={loading}
              className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-semibold"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          {weather && (
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-5xl font-bold text-gray-800">{weather.temp}°C</p>
                  <p className="text-lg text-gray-600 mt-1">{weather.city}</p>
                </div>
                <div className="flex flex-col items-center">
                  {getWeatherIcon(weather.code)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500 bg-gray-100/50 p-3 rounded-xl">
                <Wind className="w-5 h-5" />
                <span className="font-medium">{weather.wind} km/h</span>
              </div>
            </div>
          )}

          {!weather && !error && !loading && (
            <div className="text-center text-gray-400 py-8">
              <Cloud className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>Search for a city to see weather</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

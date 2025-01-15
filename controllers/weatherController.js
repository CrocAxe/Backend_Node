const axios = require("axios");
const foursquareToken = process.env.FOURSQUARE_API_KEY;

// Function to get coordinates from city name using Mapbox
const getCoordinates = async (city) => {
  const mapboxToken = process.env.MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}`;
  
  console.log('Making Mapbox request to:', url);
  
  try {
    const response = await axios.get(url);
    console.log('Mapbox request successful');
    
    if (response.data.features.length === 0) {
      throw new Error('Location not found');
    }
    
    return {
      longitude: response.data.features[0].center[0],
      latitude: response.data.features[0].center[1]
    };
  } catch (error) {
    console.log('Mapbox error:', error.response?.status, error.response?.data);
    throw error;
  }
};

// Helper function to map weather conditions to activity categories
const getActivitiesByWeather = (weatherCondition) => {
  const weatherActivities = {
    'Clear': ['16000', '18000', '16032'], // Parks, Sports, Hiking trails
    'Rain': ['12000', '10000', '13000'],  // Shopping, Arts, Entertainment
    'Clouds': ['12000', '13000', '17000'], // Shopping, Entertainment, Fitness
    'Snow': ['16032', '12000', '10000']    // Indoor activities
  };

  // Default to indoor activities if weather condition not found
  const condition = Object.keys(weatherActivities).find(key => 
    weatherCondition.toLowerCase().includes(key.toLowerCase())
  ) || 'Rain';

  return weatherActivities[condition];
};

// Function to get places from Foursquare
const getPlaces = async (latitude, longitude, weatherCondition) => {
  try {
    const categories = getActivitiesByWeather(weatherCondition);
    

    console.log('Preparing Foursquare request...');
    
    const requestConfig = {
      method: 'GET',
      url: 'https://api.foursquare.com/v3/places/search',
      params: {
        ll: `${latitude},${longitude}`,
        categories: categories.join(','),
        limit: 10
      },
      headers: {
        'Authorization': foursquareToken,
        'Accept': 'application/json'
      }
    };

    console.log('Making Foursquare request with config:', {
      ...requestConfig,
      headers: { 'Authorization': 'Bearer [HIDDEN]' }
    });

    const response = await axios(requestConfig);
    console.log('Foursquare request successful');
    return response.data.results;
  } catch (error) {
    console.error('Foursquare API Error:', error.response?.data || error.message);
    return [];
  }
};

// Main function to get weather, map, and activity data
const getLocationDetails = async (req, res) => {
  const { city } = req.query;
  
  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    // Get coordinates
    const coords = await getCoordinates(city);
    
    // Get weather forecast
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.latitude}&lon=${coords.longitude}&appid=${apiKey}&units=metric`;
    
    console.log('Making OpenWeather request...');
    const weatherResponse = await axios.get(forecastUrl);
    console.log('OpenWeather request successful');
    const weatherData = weatherResponse.data;

    // Process forecast data
    const dailyForecast = {};
    weatherData.list.forEach(forecast => {
      const date = forecast.dt_txt.split(" ")[0];
      if (!dailyForecast[date]) {
        dailyForecast[date] = [];
      }
      dailyForecast[date].push(forecast);
    });

    const forecastSummary = Object.keys(dailyForecast).map(date => ({
      date,
      temp_min: Math.min(...dailyForecast[date].map(f => f.main.temp_min)),
      temp_max: Math.max(...dailyForecast[date].map(f => f.main.temp_max)),
      description: dailyForecast[date][0].weather[0].description,
    }));

    // Get recommended places based on current weather
    const currentWeather = weatherData.list[0].weather[0].main;
    const places = await getPlaces(coords.latitude, coords.longitude, currentWeather);

    // Prepare response
    res.status(200).json({
      location: {
        city: weatherData.city.name,
        coordinates: coords
      },
      forecast: forecastSummary,
      mapbox: {
        center: [coords.longitude, coords.latitude]
      },
      recommendedPlaces: places.map(place => ({
        name: place.name,
        category: place.categories[0]?.name || 'Venue',
        address: place.location.formatted_address,
        coordinates: {
          latitude: place.geocodes.main.latitude,
          longitude: place.geocodes.main.longitude
        }
      }))
    });

  } catch (error) {
    console.error("Error fetching location details:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
      console.error("Status code:", error.response.status);
    }
    res.status(500).json({ 
      error: "Failed to fetch location details",
      details: error.message
    });
  }
};

// Function to get data based on current location
const getCurrentLocationDetails = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  try {
    // Get weather forecast for current location
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    
    console.log('Making OpenWeather request for current location...');
    const weatherResponse = await axios.get(forecastUrl);
    console.log('OpenWeather request successful');
    const weatherData = weatherResponse.data;

    // Process forecast same as above
    const dailyForecast = {};
    weatherData.list.forEach(forecast => {
      const date = forecast.dt_txt.split(" ")[0];
      if (!dailyForecast[date]) {
        dailyForecast[date] = [];
      }
      dailyForecast[date].push(forecast);
    });

    const forecastSummary = Object.keys(dailyForecast).map(date => ({
      date,
      temp_min: Math.min(...dailyForecast[date].map(f => f.main.temp_min)),
      temp_max: Math.max(...dailyForecast[date].map(f => f.main.temp_max)),
      description: dailyForecast[date][0].weather[0].description,
    }));

    // Get recommended places
    const currentWeather = weatherData.list[0].weather[0].main;
    const places = await getPlaces(latitude, longitude, currentWeather);

    res.status(200).json({
      location: {
        city: weatherData.city.name,
        coordinates: { latitude, longitude }
      },
      forecast: forecastSummary,
      mapbox: {
        center: [longitude, latitude]
      },
      recommendedPlaces: places.map(place => ({
        name: place.name,
        category: place.categories[0]?.name || 'Venue',
        address: place.location.formatted_address,
        coordinates: {
          latitude: place.geocodes.main.latitude,
          longitude: place.geocodes.main.longitude
        }
      }))
    });

  } catch (error) {
    console.error("Error fetching current location details:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
      console.error("Status code:", error.response.status);
    }
    res.status(500).json({ 
      error: "Failed to fetch location details",
      details: error.message
    });
  }
};

module.exports = {
  getLocationDetails,
  getCurrentLocationDetails
};
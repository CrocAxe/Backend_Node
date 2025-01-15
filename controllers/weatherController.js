const axios = require("axios");


const activities = {
  categories: {
    outdoor: {
      active: [
        { name: "Hiking", minTemp: 10, maxTemp: 30, conditions: ["Clear", "Clouds"] },
        { name: "Cycling", minTemp: 10, maxTemp: 28, conditions: ["Clear", "Clouds"] },
        { name: "Beach activities", minTemp: 20, maxTemp: 35, conditions: ["Clear"] },
        { name: "Outdoor photography", minTemp: 5, maxTemp: 30, conditions: ["Clear", "Clouds"] }
      ],
      relaxed: [
        { name: "Picnic in the park", minTemp: 15, maxTemp: 28, conditions: ["Clear", "Clouds"] },
        { name: "Sightseeing", minTemp: 10, maxTemp: 30, conditions: ["Clear", "Clouds"] },
        { name: "Garden visits", minTemp: 12, maxTemp: 28, conditions: ["Clear", "Clouds"] }
      ]
    },
    indoor: {
      cultural: [
        { name: "Museum visit", conditions: ["Rain", "Thunderstorm", "Snow", "Clear", "Clouds"] },
        { name: "Art gallery tour", conditions: ["Rain", "Thunderstorm", "Snow", "Clear", "Clouds"] },
        { name: "Local history exhibition", conditions: ["Rain", "Thunderstorm", "Snow", "Clear", "Clouds"] }
      ],
      entertainment: [
        { name: "Cinema", conditions: ["Rain", "Thunderstorm", "Snow", "Clear", "Clouds"] },
        { name: "Theater show", conditions: ["Rain", "Thunderstorm", "Snow", "Clear", "Clouds"] },
        { name: "Indoor concerts", conditions: ["Rain", "Thunderstorm", "Snow", "Clear", "Clouds"] }
      ]
    },
    seasonal: {
      winter: [
        { name: "Skiing", minTemp: -10, maxTemp: 5, conditions: ["Snow", "Clear", "Clouds"] },
        { name: "Ice skating", minTemp: -5, maxTemp: 10, conditions: ["Snow", "Clear", "Clouds"] },
        { name: "Winter hiking", minTemp: -5, maxTemp: 10, conditions: ["Snow", "Clear", "Clouds"] }
      ],
      summer: [
        { name: "Water parks", minTemp: 25, maxTemp: 35, conditions: ["Clear"] },
        { name: "Beach volleyball", minTemp: 20, maxTemp: 35, conditions: ["Clear"] },
        { name: "Outdoor swimming", minTemp: 23, maxTemp: 35, conditions: ["Clear"] }
      ]
    }
  }
};


// Function to get weather data by city name
const getWeatherByCity = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(weatherURL);
    const weatherData = response.data;

    // Send relevant weather data
    res.status(200).json({
      location: weatherData.name,
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    res.status(500).json({ error: "Error fetching weather data" });
  }
};


// Function to get 7-day weather forecast by city name
const getWeatherForecast = async (req, res) => {
  const city = req.query.city;
 if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    
    const response = await axios.get(forecastUrl);
    const data = response.data;

    // Group by date to provide daily forecast summaries
    const dailyForecast = {};
    data.list.forEach(forecast => {
      const date = forecast.dt_txt.split(" ")[0]; // Extract date only
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

    res.status(200).json({ city: data.city.name, forecast: forecastSummary });
  } catch (error) {
    console.error("Error fetching weather forecast:", error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};



// Helper function to get recommended activities based on weather
const getRecommendedActivities = (temperature, weatherCondition) => {
  const recommendations = {
    outdoor: { active: [], relaxed: [] },
    indoor: { cultural: [], entertainment: [] },
    seasonal: { winter: [], summer: [] }
  };

  // Map OpenWeatherMap conditions to our activity conditions
  const conditionMapping = {
    "Clear": "Clear",
    "Clouds": "Clouds",
    "Rain": "Rain",
    "Snow": "Snow",
    "Thunderstorm": "Thunderstorm"
  };

  const mappedCondition = conditionMapping[weatherCondition] || "Clear";

  // Helper function to check if an activity is suitable
  const isActivitySuitable = (activity) => {
    if (activity.conditions.includes(mappedCondition)) {
      if (activity.minTemp !== undefined && activity.maxTemp !== undefined) {
        return temperature >= activity.minTemp && temperature <= activity.maxTemp;
      }
      return true;
    }
    return false;
  };

  // Check each category and subcategory
  Object.keys(activities.categories).forEach(categoryKey => {
    const category = activities.categories[categoryKey];
    Object.keys(category).forEach(subcategoryKey => {
      const subcategory = category[subcategoryKey];
      recommendations[categoryKey][subcategoryKey] = subcategory.filter(isActivitySuitable);
    });
  });

  return recommendations;
};

// Function to get weather data and activity recommendations by city name
const getWeatherAndActivities = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await axios.get(weatherURL);
    const weatherData = response.data;

    // Get weather condition and temperature
    const temperature = weatherData.main.temp;
    const weatherCondition = weatherData.weather[0].main;

    // Get activity recommendations
    const recommendations = getRecommendedActivities(temperature, weatherCondition);

    // Prepare response
    res.status(200).json({
      location: weatherData.name,
      coordinates: {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon
      },
      weather: {
        temperature: temperature,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        condition: weatherCondition
      },
      recommendedActivities: recommendations
    });
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    res.status(500).json({ error: "Error fetching weather data" });
  }
};

// Function to manage favorites list
const favorites = new Map(); 

const manageFavorites = async (req, res) => {
  const { userId, city, action } = req.body;

  if (!userId || !city || !action) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    if (!favorites.has(userId)) {
      favorites.set(userId, new Set());
    }

    const userFavorites = favorites.get(userId);

    if (action === 'add') {
      userFavorites.add(city);
    } else if (action === 'remove') {
      userFavorites.delete(city);
    }

    res.status(200).json({
      userId,
      favorites: Array.from(userFavorites)
    });
  } catch (error) {
    console.error("Error managing favorites:", error.message);
    res.status(500).json({ error: "Error managing favorites" });
  }
};
  

module.exports = { getWeatherByCity, getWeatherForecast, getWeatherAndActivities, manageFavorites };


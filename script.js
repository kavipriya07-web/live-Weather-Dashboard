
// Get HTML Elements
const form = document.getElementById("form");
const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");
const status = document.getElementById("status");
const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");

// Weather Code Information
const weatherCodes = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Heavy Thunderstorm"
};

// Find City
async function findCity(name) {

    const url =
        "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" +
        encodeURIComponent(name);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("The search service is not responding.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Try another city.");
    }

    const city = data.results[0];

    return {
        name: city.name,
        country: city.country,
        lat: city.latitude,
        lon: city.longitude
    };
}

// Get Weather Data
async function getWeather(lat, lon) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
        "&forecast_days=5&timezone=auto";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not load the weather forecast.");
    }

    return await response.json();
}

// Display Current Weather
function displayCurrent(city, weather) {

    const current = weather.current;

    currentWeather.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = city.name + ", " + city.country;

    const temperature = document.createElement("h1");
    temperature.textContent =
        Math.round(current.temperature_2m) + "°C";

    const condition = document.createElement("p");
    condition.textContent =
        weatherCodes[current.weather_code] || "Unknown";

    const feelsLike = document.createElement("p");
    feelsLike.textContent =
        "Feels like: " +
        Math.round(current.apparent_temperature) + "°C";

    const humidity = document.createElement("p");
    humidity.textContent =
        "Humidity: " + current.relative_humidity_2m + "%";

    const wind = document.createElement("p");
    wind.textContent =
        "Wind Speed: " + current.wind_speed_10m + " km/h";

    currentWeather.append(
        title,
        temperature,
        condition,
        feelsLike,
        humidity,
        wind
    );
}

// Display Five Day Forecast
function displayForecast(weather) {

    forecast.replaceChildren();

    const daily = weather.daily;

    daily.time.forEach((date, index) => {

        const card = document.createElement("div");
        card.className = "forecast-card";

        const day = document.createElement("h3");
        day.textContent = new Date(date + "T12:00:00")
            .toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric"
            });

        const condition = document.createElement("p");
        condition.textContent =
            weatherCodes[daily.weather_code[index]] || "Unknown";

        const maxTemp = document.createElement("p");
        maxTemp.textContent =
            "Max: " + Math.round(daily.temperature_2m_max[index]) + "°C";

        const minTemp = document.createElement("p");
        minTemp.textContent =
            "Min: " + Math.round(daily.temperature_2m_min[index]) + "°C";

        card.append(day, condition, maxTemp, minTemp);

        forecast.appendChild(card);
    });
}

// Search Weather
async function searchWeather(cityName) {

    if (!cityName.trim()) {
        status.textContent = "Please enter a city name.";
        return;
    }

    status.textContent = "Loading weather...";
    searchBtn.disabled = true;

    try {

        const city = await findCity(cityName);

        const weather = await getWeather(city.lat, city.lon);

        displayCurrent(city, weather);

        displayForecast(weather);

        status.textContent = "Weather updated successfully!";

        localStorage.setItem("lastCity", city.name);

    } catch (error) {

        status.textContent = error.message;

        currentWeather.replaceChildren();
        forecast.replaceChildren();

    } finally {

        searchBtn.disabled = false;

    }
}

// Form Submit Event
form.addEventListener("submit", function(event) {

    event.preventDefault();

    searchWeather(cityInput.value);

});

// Remember Last Searched City
window.addEventListener("load", function() {

    const lastCity = localStorage.getItem("lastCity");

    if (lastCity) {
        cityInput.value = lastCity;
        searchWeather(lastCity);
    }

});

const search = document.getElementById('search');

const curr_temp = document.getElementById('cTemp');
const curr_wind = document.getElementById('cWind');
const curr_pres = document.getElementById('cPres');
const curr_humid = document.getElementById('cHumid');
// var place = document.getElementById('location')
const latitude_longitude = document.getElementById('coords');
const daily_weather = document.querySelector('.daily_weather');
const time = document.getElementById('time');
const date = document.getElementById('date');

const sunny = './images/weather/weather_sun.svg';
const misty = './images/weather/weather_mistyrain.svg';
const rain = './images/weather/weather_rain.svg';
const snowing = './images/weather/weather_snow.svg';
const cloudy = './images/weather/weather_cloud.svg';

const statusIcon = document.getElementById('statusIcon');

const daysofweek = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

const apikey = 'fbb4f6a6c3d942aa80fb9498b8c7b185';

const graph_it = document.querySelector('.graph_it');

const graph_temp = document.querySelector('.cTemp');
const graph_wind = document.querySelector('.cWind');
const graph_humidity = document.querySelector('.cHumid');
const graph_pressure = document.querySelector('.cPres');

async function getCoords(location) {
  const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apikey}`);
  console.log(resp)
  const data = await resp.json();
  const place = document.getElementById('location');
  place.innerHTML = data.name;

  const lat = await data.coord.lat;
  const lon = await data.coord.lon;
  latitude_longitude.innerHTML = `${lat}°N, ${lon}°W`;
  return {
    lat,
    lon,
  };
}
async function getWeather(place) {
  const coords = await getCoords(place);
  const weather = (await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&appid=${apikey}`)).json();
  console.log(weather)
  return weather;
}

async function graphWind(location) {
  const weather = await getWeather(location);
  const data = weather.hourly.map((i) => i.wind_speed);
  const label = weather.hourly.map((i) => `${new Date(i.dt * 1000).getHours()}:00`);
  refreshCanvas();
  update_graph(label, data, 'Wind km/hr');
}

async function graphTemp(location) {
  const weather = await getWeather(location);
  const data = weather.hourly.map((i) => (i.temp - 273.15).toFixed(2));
  const label = weather.hourly.map((i) => `${new Date(i.dt * 1000).getHours()}:00`);
  refreshCanvas();
  update_graph(label, data, 'Temperature °C');
}

async function graphPressure(location) {
  const weather = await getWeather(location);
  const data = weather.hourly.map((i) => i.pressure);
  const label = weather.hourly.map((i) => `${new Date(i.dt * 1000).getHours()}:00`);
  refreshCanvas();
  update_graph(label, data, 'Pressure hPa');
}

async function graphHumidity(location) {
  const weather = await getWeather(location);
  const data = weather.hourly.map((i) => i.humidity);
  const label = weather.hourly.map((i) => `${new Date(i.dt * 1000).getHours()}:00`);
  refreshCanvas();
  console.log(data);
  update_graph(label, data, 'Humidity %');
}

function refreshCanvas() {
  const canvas = document.getElementById('graphweather');
  graph_it.removeChild(canvas);
  const newcanvas = document.createElement('canvas');
  newcanvas.setAttribute('id', 'graphweather');
  newcanvas.setAttribute('height', '100');
  graph_it.appendChild(newcanvas);
}

function setTimeDate(weather) {
  const Time = new Date((weather.current.dt + weather.timezone_offset) * 1000);
  let hours;
  let minutes;
  const day = daysofweek[Time.getDay()];
  if (Time.getHours() < 10) {
    hours = `0${Time.getHours()}`;
  } else {
    hours = Time.getHours();
  }
  if (Time.getMinutes() < 10) {
    minutes = `0${Time.getMinutes()}`;
  } else {
    minutes = Time.getMinutes();
  }
  time.innerHTML = `${day}, ${hours}:${minutes}`;
  date.innerHTML = `${Time.getDate()}-${Time.getMonth()}-${Time.getFullYear()}`;
}

function Icons(status) {
  if (status == 'Clouds') {
    return cloudy;
  }
  if (status == 'Clear') {
    return sunny;
  }
  if (status == 'Rain') {
    return rain;
  }
  if (status == 'Snow') {
    return snowing;
  }
  if (status == 'Mist') {
    return misty;
  }
}

function set_daily_weather(weather) {
  daily_weather.innerHTML = '';
  const daily_temp = weather.daily.map((i) => (i.temp.day - 273.15).toFixed(2)).slice(1);
  const status = weather.daily.map((i) => i.weather[0].main).slice(1);
  const days = weather.daily.map((i) => new Date(i.dt * 1000).getDay()).slice(1);
  const icons = [];

  for (var i in status) icons.push(Icons(status[i]));

  for (var i in daily_temp) {
    const day = document.createElement('div');
    day.classList = 'day';

    const daily = document.createElement('div');
    daily.classList = 'daily';

    const dailyIcon = document.createElement('img');
    dailyIcon.classList = 'dailyIcon';

    const dailyTemp = document.createElement('div');
    dailyTemp.classList = 'dailyTemp';

    day.innerHTML = daysofweek[days[i]];
    dailyIcon.src = icons[i];
    dailyTemp.innerHTML = `${daily_temp[i]}°C`;
    daily.appendChild(day);
    daily.appendChild(dailyIcon);
    daily.appendChild(dailyTemp);
    daily_weather.appendChild(daily);
  }
}

function update_current(current) {
  console.log(current.weather[0].main);
  statusIcon.src = Icons(current.weather[0].main);
  curr_temp.innerHTML = `${(current.temp - 273.15).toFixed(1)} °C`;
  curr_wind.innerHTML = `${current.wind_speed} km/hr`;
  curr_pres.innerHTML = `${current.pressure} hPa`;
  curr_humid.innerHTML = `${current.humidity}%`;
}

const weather = (place) => {
  getWeather(place).then((weather) => {
    const hourly_temps = weather.hourly.map((i) => (i.temp - 273.15).toFixed(2));
    const label = weather.hourly.map((i) => `${new Date(i.dt * 1000).getHours()}:00`);

    update_graph(label.slice(24), hourly_temps.slice(24), 'Temperature °C');

    update_current(weather.current);
    set_daily_weather(weather);
    setTimeDate(weather);
  });
};

function update_graph(x, y, label) {
  const ctx = document.getElementById('graphweather');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: x,
      datasets: [{
        label,
        data: y,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderColor: 'white',
        borderWidth: 1,
        lineTension: 0.4,
        fill: true,
      }],
    },
  });
}

search.addEventListener('keydown', (e) => {
  const key = e.keyCode;
  refreshCanvas();
  if (key === 13) {
    console.log(search.value);
    weather(search.value);
  }
});

graph_wind.addEventListener('click', () => {
  graphWind(search.value);
});

graph_temp.addEventListener('click', () => {
  graphTemp(search.value);
});

graph_pressure.addEventListener('click', () => {
  graphPressure(search.value);
});

graph_humidity.addEventListener('click', () => {
  graphHumidity(search.value);
});

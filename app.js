const APIKEY = "64945743c155b8baa811f31703d5204c";

const inputTextfield = document.querySelector(".input--textfield");

const searchBtn = document.querySelector(".fa-magnifying-glass");

const myLocation = document.querySelector(".my--location");

const weatherDataDiv = document.querySelector(".weather--data__div");
const main = document.querySelector(".main");
const body = document.querySelector(".body");
const spinner = document.querySelector(".fa-spinner");

async function convertCityToLatlon(query) {
  //using positionStact API
  const PSKEY = "e89601534be0687f23fe68561fb00944";
  try {
    const { data } = await axios("https://api.positionstack.com/v1/forward?", {
      params: {
        access_key: PSKEY,
        query,
      },
    });
    successGettingLocation(data.data[0]);
  } catch (error) {
    main.innerHTML = `<h1>${error.message}</h1>`;
  }
}

searchBtn.addEventListener("click", () => {
  if (!inputTextfield.value) return alert("Enter a location");
  spinner.style.display = "initial";
  convertCityToLatlon(inputTextfield.value);
  inputTextfield.value = "";
});

inputTextfield.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && inputTextfield.value) {
    spinner.style.display = "initial";
    convertCityToLatlon(inputTextfield.value);
    inputTextfield.value = "";
  }
});

async function headerLocationDisplay(position) {
  const { longitude, latitude } = position.coords;
  const { data } = await axios(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${APIKEY}`
  );
  if (data) {
    const tempInFahrenheit = Math.round(
      ((data.main.temp - 273.15) * 9) / 5 + 32
    );
    myLocation.innerHTML = `<h5>${data.name}, ${data.sys.country} : ${tempInFahrenheit}<sub>F</sub></h5>`;
    myLocation.style.display = "initial";
  }
}

function getMyCurrentPosition() {
  navigator.geolocation.getCurrentPosition((position) => {
    headerLocationDisplay(position);
  });
}

window.addEventListener("load", () => {
  getMyCurrentPosition();
});

function createTodayWeatherCard(data) {
  if (!data) return;
  const { name, dt } = data;
  const { country, sunrise, sunset } = data.sys;
  const { icon, description } = data.weather[0];
  const { temp, feels_like, pressure, humidity } = data.main;
  const date = new Date(dt * 1000).toLocaleDateString();
  const newDate = new Date();
  const today = `${
    newDate.getMonth() + 1
  }/${newDate.getDate()}/${newDate.getFullYear()}`;
  const formattedSunrise = new Date(sunrise * 1000).toLocaleTimeString();
  const formattedSunset = new Date(sunset * 1000).toLocaleTimeString();
  const temperature = Math.round(((temp - 273.15) * 9) / 5 + 32);
  const feelsLike = Math.round(((feels_like - 273.15) * 9) / 5 + 32);
  const weatherCard = document.createElement("div");
  weatherCard.className = "weather--card";
  weatherCard.innerHTML = `
    <h4 class="location--name">${name}, ${country}</h4>
    <div class="icon--div">
        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" />
        <p>${description}</p>
    </div>
    <p class="date">${date === today && "Today"}</p>
    <div class="sun--data">
        <div class="sunrise">
            <p class="title">Sunrise</p>
            <p>${formattedSunrise}</p>
        </div>
        <div class="sunset">
            <p class="title">Sunset</p>
            <p>${formattedSunset}</p>
        </div>
    </div>
    <div class="current--temperature">
        <p>${temperature}<sub>F</sub></p>
    </div>
    <div class="current--weather">
        <p>FeelsLike</p>
        <p>${feelsLike}<sub>F</sub></p>
    </div>
    <div class="current--weather">
        <p>Pressure</p>    
        <p>${pressure}hPa</p>
    </div>
    <div class="current--weather">
        <p>Humidity</p>    
        <p>${humidity}%</p>
    </div>
    
    `;

  weatherDataDiv.appendChild(weatherCard);
  toggleTemp(temperature, data);
}

function createFewDaysWeatherCard(data) {
  const { name, country } = data.city;
  const fiveDayData = data.list;
  const fiveDayWeather = fiveDayData.filter((data, index) => {
    if (index % 8 === 0) {
      return data;
    }
  });
  const fiveDayWeatherWithId = fiveDayWeather.map((weather, index) => {
    return { ...weather, id: index };
  });
  // console.log(fiveDayWeatherWithId);
  fiveDayWeatherWithId.slice(1).map((data) => {
    const { icon, description } = data.weather[0];
    const { temp, feels_like, pressure, humidity } = data.main;
    const temperature = Math.round(((temp - 273.15) * 9) / 5 + 32);
    const feelsLike = Math.round(((feels_like - 273.15) * 9) / 5 + 32);
    const newDiv = document.createElement("div");
    newDiv.className = "future--weather__card";
    newDiv.innerHTML = `
    <h4 class="location--name">${name}, ${country}</h4>
    <div class="icon--div">
        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" />
        <p>${description}</p>
    </div>
    <p class="date">${new Date(data.dt * 1000).toDateString()}</p>
    <div class="current--temperatures">
        <p>${temperature}<sub>F</sub></p>
    </div>
    <div class="current--weather">
        <p>FeelsLike</p>
        <p>${feelsLike}<sub>F</sub></p>
    </div>
    <div class="current--weather">
        <p>Pressure</p>    
        <p>${pressure}hPa</p>
    </div>
    <div class="current--weather">
        <p>Humidity</p>    
        <p>${humidity}%</p>
    </div>
    `;

    weatherDataDiv.appendChild(newDiv);

    const currentTemps = document.querySelectorAll(".current--temperatures");
    currentTemps.forEach((currentTemp, index) => {
      currentTemp.addEventListener("click", ({ target }) => {
        fiveDayWeatherWithId.find((weather) => {
          if (index === weather.id) {
            const tempInFahrenheit = Math.round(
              ((weather.main.temp - 273.15) * 9) / 5 + 32
            );
            const tempInCelcius = Math.floor((5 / 9) * (tempInFahrenheit - 32));

            if (target.innerText.includes("F")) {
              currentTemp.innerHTML = `<p>${tempInCelcius}<sub>C</sub></p>`;
            } else {
              currentTemp.innerHTML = `<p>${tempInFahrenheit}<sub>F</sub></p>`;
            }
          }
        });
      });
    });
  });
}

function toggleTemp(tempInFahrenheit, data) {
  if (!data) return;
  const tempDiv = document.querySelector(".current--temperature");
  const tempInCelcius = Math.floor((5 / 9) * (tempInFahrenheit - 32));
  tempDiv.addEventListener("click", ({ target }) => {
    if (target.innerText.includes("F")) {
      tempDiv.innerHTML = `<p>${tempInCelcius}<sub>C</sub></p>`;
    } else {
      tempDiv.innerHTML = `<p>${tempInFahrenheit}<sub>F</sub></p>`;
    }
  });
}

async function successGettingLocation(position) {
  weatherDataDiv.innerHTML = "";
  const { latitude, longitude } = position.coords ? position.coords : position;

  try {
    const { data } = await axios(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${APIKEY}`
    );

    const { data: futureData } = await axios(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${APIKEY}`
    );

    if (data) {
      spinner.style.display = "none";
    }
    createTodayWeatherCard(data);
    createFewDaysWeatherCard(futureData);
    getMap(latitude, longitude);
  } catch (error) {
    console.log(error.message);
    spinner.style.display = "none";
    body.style.maxHeight = "100vh";
    main.innerHTML = `<h1>${error.message}</h1>`;
  }
}

function errorGettingLocation(error) {
  console.log(error.message);
  spinner.style.display = "none";
  body.style.height = "100vh";
  main.innerHTML = `<h1>${error}</h1>`;
}

navigator.geolocation.getCurrentPosition(
  successGettingLocation,
  errorGettingLocation
);

async function getMap(lat, lon) {
  const layer = "precipitation_new";
  const z = 1;
  const x = 1;
  const y = 1;
  let map = L.map("map").setView([lat, lon], 13);
  let marker = L.marker([lat, lon]).addTo(map);
  L.tileLayer(
    `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${APIKEY}`
  ).addTo(map);
}

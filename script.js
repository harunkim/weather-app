"use strict";

// select body element
const body = document.body;

// function to get position from browser
const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
// testing function
// console.log(getPosition());

// get data from API
const getWeatherData = async function () {
  // geolocation
  const pos = await getPosition();
  const { latitude: lat, longitude: lng } = pos.coords;
  // testing function call
  // console.log(lat, lng);
  const locationPromise = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );

  const locationObject = await locationPromise.json();
  console.log(locationObject);

  const weatherPromise = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m&daily=temperature_2m_min&daily=temperature_2m_max&current_weather=true&timezone=auto&daily=sunrise&daily=sunset&hourly=cloudcover`
  );
  const weatherObject = await weatherPromise.json();
  console.log(weatherObject);

  const date = (() => {
    let date = new Date();
    return (
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    );
  })();

  // get current temperature
  const currentTemp = weatherObject.current_weather.temperature;

  // get hours from weather object
  const now = Number(weatherObject.current_weather.time.slice(11, 13));
  const hours = weatherObject.hourly.time.map((hour) => hour.slice(11, 13));
  hours[now] = "Now";

  // get hourly temperature from weather object
  const hourlyTemp = weatherObject.hourly.temperature_2m;

  // get hourly cloudcover from weather object
  const hourlyCloudCover = weatherObject.hourly.cloudcover;

  // mapping icons with cloudcover
  const cloudIcon = hourlyCloudCover.map((cloudCover) => {
    if (cloudCover >= 0 && cloudCover < 25) {
      return "fa-sun";
    } else if (cloudCover >= 25 && cloudCover < 75) {
      return "fa-cloud-sun";
    } else if (cloudCover >= 75 && cloudCover <= 100) {
      return "fa-cloud";
    }
  });

  for (let i = now; i < now + 24; i++) {
    console.log(cloudIcon[i]);
  }

  // fill hourly temperature HTML dynamically
  let hourlyTempHTML = "";
  for (let i = now; i < now + 24; i++) {
    hourlyTempHTML += ` <div class="weather-container weather-hour">
        <p class="hour">${hours[i]}</p>
        <i class="fa-solid ${cloudIcon[i]}"></i>
        <p class="temperature-hour">${hourlyTemp[i]}&#176;</p>
      </div>`;
  }

  // get daily min and max temperatures
  const dailyMinTemps = weatherObject.daily.temperature_2m_min;
  const dailyMaxTemps = weatherObject.daily.temperature_2m_max;

  // get days from weather object
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = weatherObject.daily.time.map(
    (day) => dayOfWeek[new Date(day).getDay()]
  );
  days[0] = "Today";

  // fill 7-Day temp forecast HTML dynamically
  // removed icon as I try to figure out how to deal with it here <i class="fa-solid fa-bolt day-weather-icon"></i>
  let dailyTempHTML = "";
  for (let i = 0; i < 7; i++) {
    dailyTempHTML += `<div class="day-forecast">
    <p class="day">
      ${days[i]}
    </p>
    <div style="display:flex; gap: 2rem;">
    <p class="low"> ${dailyMinTemps[i]}&#176; <p class="high"> ${dailyMaxTemps[i]}&#176;</p>
    </div>
  </div>`;
  }

  // change bg according to time of the day
  const bgChecker =
    date +
    "T" +
    new Date().toLocaleTimeString().slice(0, 5).replaceAll("/", "-");
  if (bgChecker >= weatherObject.daily.sunset[0]) {
    document.body.classList.add("night-bg");
  } else document.body.classList.add("gradient-bg");

  // render app dynamically
  body.innerHTML = "";
  body.classList.remove("loader-bg");
  body.insertAdjacentHTML(
    "afterbegin",
    `<main>
    <div class="app">
    <div class="weather-container weather-current">
    <p class="location">${locationObject.locality}</p>
    <p class="temperature">${currentTemp}&#176;</p>
    <p class="description">${locationObject.city}</p>
    <div class="high-low-container">
    <p class="low"> ${dailyMinTemps[0]}&#176;</p>
      <p class="high"> ${dailyMaxTemps[0]}&#176;</p>
    </div>
  </div>
  <div class="forecast">
          <div class="hour-container">
            <div class="forecast-heading">
              <i class="fa-solid fa-clock"></i>&nbsp;24-HOUR FORECAST
            </div>
            <div class="hour-weather-container">${hourlyTempHTML}</div>
          </div>
          <div class="daily-forecast-container">
            <div class="forecast-heading" id="day">
              <i class="fa-solid fa-calendar-days"></i>&nbsp;7-DAY FORECAST
            </div>
            <div class="day-weather-container">${dailyTempHTML}</div>
          </div>
        </div>
        <div class="end">
        made with &nbsp;<span class="heart"> ❤ </span>&nbsp; by harunkim
      </div>
  </div>
  </main>`
  );

  // check values used for bg change logic
  // console.log({
  //   bgChecker,
  //   sunrise: weatherObject.daily.sunrise[0],
  //   state: bgChecker < weatherObject.daily.sunrise[0],
  // });
};

(() => {
  body.classList.add("loader-bg");
  body.insertAdjacentHTML(
    "afterbegin",
    '<div class="wrapper"><i class="fa-solid fa-sun"></i></div><div class=loader-text>Getting weather...</div>'
  );
})();
getWeatherData();

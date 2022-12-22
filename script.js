"use strict";

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
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m&daily=temperature_2m_min&daily=temperature_2m_max&current_weather=true&timezone=auto&daily=sunrise&daily=sunset`
  );
  const weatherObject = await weatherPromise.json();
  console.log(weatherObject);

  const currentTemp = weatherObject.current_weather.temperature;

  const date = (() => {
    let date = new Date();
    return (
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    );
  })();
  // .toLocaleDateString()
  // .replaceAll("/", "-");
  const dailyMinTemp =
    weatherObject.daily.temperature_2m_min[
      weatherObject.daily.time.indexOf(date)
    ];
  const dailyMaxTemp =
    weatherObject.daily.temperature_2m_max[
      weatherObject.daily.time.indexOf(date)
    ];
  // testing current, min and max value retreival
  console.log({
    date,
    curr: currentTemp,
    min: dailyMinTemp,
    max: dailyMaxTemp,
  });
  const app = document.querySelector(".app");
  app.insertAdjacentHTML(
    "afterbegin",
    `<div class="weather-container weather-current">
    <p class="location">${locationObject.locality}</p>
    <p class="temperature">${currentTemp}&#176;</p>
    <p class="description">${locationObject.city}</p>
    <div class="high-low-container">
      <p class="high">H: ${dailyMaxTemp}&#176;</p>
      <p class="low">L: ${dailyMinTemp}&#176;</p>
    </div>
  </div>`
  );
  const bgChecker =
    date +
    "T" +
    new Date().toLocaleTimeString().slice(0, 5).replaceAll("/", "-");
  if (bgChecker < weatherObject.daily.sunrise[0]) {
    document.body.classList.add("night-bg");
  } else document.body.classList.add("gradient-bg");

  // check values used for bg change logic
  // console.log({
  //   bgChecker,
  //   sunrise: weatherObject.daily.sunrise[0],
  //   state: bgChecker < weatherObject.daily.sunrise[0],
  // });
};

getWeatherData();

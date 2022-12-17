// get location from browser
const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// get weather for given position
const getWeather = async function (lat, long) {
  const weather = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m&daily=temperature_2m_min&daily=temperature_2m_max&timezone=auto`
  );
  const weatherObj = await weather.json();
  console.log("we are here-1");
  console.log(weatherObj);
  console.log("we are here-2");
  return weatherObj;
};

// make function work properly
const renderWeather = async function () {
  const pos = await getPosition();
  const { latitude: lat, longitude: long } = pos.coords;

  const location = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`
  ).then((loc) => loc.json());

  const city = location.city;

  await getWeather(lat, long);
};

renderWeather();

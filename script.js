const place = document.querySelector('.location');
const dayToday = document.querySelector('.date');
const coordinate = document.querySelector('.coordinate');
const tempToday = document.querySelector('.temperature');
const weatherToday = document.querySelector('.weather');
const weatherFuture = document.querySelector('.future-weather');
const map = document.querySelector('.map');
const controls = document.querySelector('.controls');
const searchInput = document.querySelector('.search-area');
const searchBtn = document.querySelector('.search-button');

let language = 'en';
let units = 'metric';

let lat = '';
let lon = '';

window.onload = () => {
    getRegion();
    getBackground();
    setInterval(() => {
        getDayToday();
    }, 1000);
}

function fetchRequest(url) {
    return fetch(url)
        .then(response => response.json())
}

function getRegion() {
    const url = "https://ipinfo.io/json?token=ee59d1ffc4ca1f";
    return fetchRequest(url)
        .then(data => {
            const location = data.loc.split(',');
            lat = location[0];
            lon = location[1];
            getWeatherToday(lat, lon);
            getFutureWeather(lat, lon);
            getMapPosition(lat, lon);
            return location;
        })
}

function getDayToday() {
    const date = new Date();
    const options = {
        localeMatcher: 'best fit',
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: 'numeric'
    };
    dayToday.textContent = `${date.toLocaleString(`${language}`, options)}`;
    return date;
}

const translations = {
    ru: {
        daysOfWeek: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        units: {
            metric: {
                wind: 'м/с',
            },
            imperial: {
                wind: 'миль/ч',
            }
        },
        geoloc: {
            lat: 'Широта',
            lon: 'Долгота'
        },
        weather: {
            feel: 'Ощущается',
            wind: 'Ветер',
            humidity: 'Влажность'
        }
    },

    en: {
        daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        units: {
            metric: {
                wind: 'm/s',
            },
            imperial: {
                wind: 'mph',
            }
        },
        geoloc: {
            lat: 'Latitude',
            lon: 'Longitude'
        },
        weather: {
            feel: 'Feels like',
            wind: 'Wind',
            humidity: 'Humidity'
        }
    }
}

function getWeatherToday(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&lang=${language}&units=${units}&appid=9857b81397a6e8ba65a89d8219f81bdf`;
    return fetchRequest(url)
        .then(data => {
            place.textContent = `${data.city.name}, ${data.city.country}`;

            let lat = translations[`${language}`]['geoloc']['lat'];
            let lon = translations[`${language}`]['geoloc']['lon'];
            coordinate.innerHTML = `
                ${lat}: ${data.city.coord.lat}' <br>
                ${lon}: ${data.city.coord.lon}'`;

            let feel = `${translations[`${language}`]['weather']['feel']}`;
            let wind = `${translations[`${language}`]['weather']['wind']}`;
            let humidity = `${translations[`${language}`]['weather']['humidity']}`;
            let unit = `${translations[`${language}`]['units'][`${units}`]['wind']}`;
            weatherToday.innerHTML = `${data.list[0].weather[0].description} </br>
                ${feel}: ${Math.round(data.list[0].main.feels_like)}&deg; </br>
                ${wind} ${Math.round(data.list[0].wind.speed)} <span class="lower_case">${unit}</span></br>
                ${humidity}: ${data.list[0].main.humidity}%`

            tempToday.innerHTML = `${Math.round(data.list[0].main.temp)}<sup>&deg;</sup> `;

            let div = document.createElement('div');
            div.classList.add('icon');
            tempToday.insertAdjacentElement("afterbegin", div);
            div.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png">`;
        })
}

function getFutureWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=alerts&units=${units}&appid=9857b81397a6e8ba65a89d8219f81bdf`;
    return fetchRequest(url)
        .then(data => {
            const date = getDayToday();
            let indexOfWeek = date.getDay() + 1;

            const daysArr = Array.from(weatherFuture.children);
            let index = 1;
            daysArr.forEach(day => {
                day.innerHTML = `
                    <img src="http://openweathermap.org/img/wn/${data.daily[index].weather[0].icon}@2x.png">
                    <p class="name">${translations[`${language}`]['daysOfWeek'][`${indexOfWeek}`]}</p>
                    <p class="temp">${Math.round(data.daily[index].temp.day)}&deg;</p>`
                indexOfWeek >= 6 ? indexOfWeek = 0 : indexOfWeek++;
                index++;
            })
        })
}


function getBackground() {
    const url = "https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=nature&client_id=e2077ad31a806c894c460aec8f81bc2af4d09c4f8104ae3177bb809faf0eac17";
    fetchRequest(url)
        .then(data => document.body.style.backgroundImage = `url(${data.urls.regular})`);
}

function getMapPosition(lat, lon) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibHVrb3ZrYSIsImEiOiJja2w2ajh2YjUyaHo3MnVtc2Njd2hqZngxIn0.zzYdA1jWodMx3KtCbdyaqw';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lon, lat],
        zoom: 10
    });
    console.log(map)
}

function geocoding() {
    let search_text = searchInput.value;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${search_text}.json?types=place&autocomplete=true&language=${language}&access_token=pk.eyJ1IjoibHVrb3ZrYSIsImEiOiJja2w2ajh2YjUyaHo3MnVtc2Njd2hqZngxIn0.zzYdA1jWodMx3KtCbdyaqw`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            lat = data.features[0].center[1];
            lon = data.features[0].center[0];
            getWeatherToday(lat, lon);
            getFutureWeather(lat, lon);
            getMapPosition(lat, lon)
        });
}

searchBtn.addEventListener('click', geocoding);
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') geocoding();
});

controls.addEventListener('click', (e) => {
    if (e.target.classList.contains('lang')) {
        if (e.target.textContent === 'RU') {
            language = 'ru';
            e.target.toggleAttribute('disabled');
            e.target.nextElementSibling.toggleAttribute('disabled');
            searchBtn.textContent = 'Искать';
        } else if (e.target.textContent === 'EN') {
            language = 'en';
            e.target.toggleAttribute('disabled');
            e.target.previousElementSibling.toggleAttribute('disabled');
            searchBtn.textContent = 'Search';
        }
        localStorage.setItem('lang', language);
    }

    if (e.target.classList.contains('measure')) {
        if (e.target.textContent === '°F') {
            units = 'imperial';
            e.target.toggleAttribute('disabled');
            e.target.nextElementSibling.toggleAttribute('disabled');
        } else if (e.target.textContent === '°C') {
            units = 'metric';
            e.target.toggleAttribute('disabled');
            e.target.previousElementSibling.toggleAttribute('disabled');
        }
        localStorage.setItem('measure', units);
    }
    getWeatherToday(lat, lon);
    getFutureWeather(lat, lon);

    if (e.target.classList.contains('update')) getBackground();
})
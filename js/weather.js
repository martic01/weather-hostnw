
let timerIntervalId = null; // Declare a global variable to hold the interval ID
const imgHeavyRain = './img/raind.webp';
const imgLIghtRain = './img/weatrain.webp';
const imgSun = './img/weatsun.webp';
const imgcloud = './img/cloudmv.webp';
const imgSunrise = './img/sunrise.webp';
const imgRain = './img/imgr.webp';
const imgWind = './img/weatwindy.webp';
const imgRainBg = './img/giphy.webp';
const imgMist = './img/mist2.gif';
const API_KEY = 'bb3c2096c199260e300c0a53f3ed11dc';


function Weather(pressure, temperatureink, humidity, sealevel, sunrise, sunset, timeinhours, timeinmins, timeinsec, ampm, mainweather, description) {
    this.pressure = pressure;
    this.temperatureink = temperatureink;
    this.humidity = humidity;
    this.sealevel = sealevel;
    this.sunrise = sunrise;
    this.sunset = sunset;
    this.timeinhours = timeinhours;
    this.timeinmins = timeinmins;
    this.timeinsec = timeinsec;
    this.ampm = ampm;
    this.mainweather = mainweather;
    this.description = description;
    this.container = document.querySelector('.content')
    this.weatherimages = [
        imgSun,
        imgLIghtRain,
        imgcloud,
        imgWind,
        imgSunrise,
        imgHeavyRain,
        imgRain,
        imgMist
    ];
}



function trimed(text) {
    return text.trim();
}
function caseSmall(text) {
    return text.toLowerCase();
}

function loader() {
    setTimeout(() => {
        $('.load').slideUp()
        $('main').slideDown()
    }, 3000)
}

function waiting(city) {
    let promise = new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
        request.onload = function () {
            if (this.status === 200) {
                resolve(request.response);
            } else {
                reject(request.response);
            }
        };
        request.open("GET", url, true);
        request.send();
    });

    promise.then(function (response) {
        const body = JSON.parse(response);

        // Get timezone offset, sunrise, and sunset
        const timezoneOffset = body.timezone;
        const sunriseTimestamp = body.sys.sunrise;
        const sunsetTimestamp = body.sys.sunset;
        const timestamp = body.dt;

        const localSunrise = new Date(sunriseTimestamp * 1000);
        const localSunset = new Date(sunsetTimestamp * 1000);
        const timezoneInMs = timezoneOffset * 1000;
        const localTime = new Date(timestamp * 1000);

        const adjustedSunrise = new Date(localSunrise.getTime() + timezoneInMs);
        const adjustedSunset = new Date(localSunset.getTime() + timezoneInMs);
        const adjustedLocalTime = new Date(localTime.getTime() + timezoneInMs);

        let hours = adjustedLocalTime.getHours();
        const minutes = adjustedLocalTime.getMinutes();
        const seconds = adjustedLocalTime.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

        let newWeather = new Weather(
            body.main.pressure,
            body.main.temp,
            body.main.humidity,
            body.main.sea_level || 'N/A',
            adjustedSunrise,
            adjustedSunset,
            hours,
            formattedMinutes,
            formattedSeconds,
            ampm,
            body.weather[0].main,
            body.weather[0].description
        );

        updateInfo(newWeather);
        check(newWeather);
        ActivateTimer(newWeather);

        $('.infoin').slideDown();
        $('.error').text(``);
    }, (error) => {
        let location = $('#location').val();
        if (trimed(location) === '') {
            $('.error').text(``);
            $('.infoin').slideUp();
            document.querySelector('.content').style.backgroundImage = `url(${imgRainBg})`;
        } else {
            $('.error').text(`There was an error processing your request: ${error}`);
            $('.infoin').slideUp();
            document.querySelector('.content').style.backgroundImage = `url(${imgRainBg})`;
        }
    });
}

function updateInfo(weatherupdate) {
    $('.pressure').text(weatherupdate.pressure);
    $('.temp').text(weatherupdate.temperatureink);
    $('.humidity').text(weatherupdate.humidity);
    $('.sealevel').text(weatherupdate.sealevel);
    $('.sunrise').text(weatherupdate.sunrise);
    $('.sunset').text(weatherupdate.sunset);
    $('.hr').text(weatherupdate.timeinhours);
    $('.min').text(weatherupdate.timeinmins);
    $('.sec').text(weatherupdate.timeinsec);
    $('.period').text(weatherupdate.ampm);
    $('.weather').text(weatherupdate.mainweather);
    $('.wedescription').text(weatherupdate.description);
}

function check(weatherupdate) {
    if (weatherupdate.description === 'light rain') {
        $('.changewe').attr('src', weatherupdate.weatherimages[1]);
        weatherupdate.container.style.backgroundImage = `url(${weatherupdate.weatherimages[6]})`;
    } else if (caseSmall(weatherupdate.description) === 'heavy rain') {
        $('.changewe').attr('src', weatherupdate.weatherimages[1]);
        weatherupdate.container.style.backgroundImage = `url(${weatherupdate.weatherimages[5]})`;
    } else if (caseSmall(weatherupdate.mainweather) === 'clouds') {
        $('.changewe').attr('src', weatherupdate.weatherimages[2]);
        weatherupdate.container.style.backgroundImage = `url(${weatherupdate.weatherimages[2]})`;
    } else if (caseSmall(weatherupdate.mainweather) === 'clear' || caseSmall(weatherupdate.mainweather).includes('sun')) {
        $('.changewe').attr('src', weatherupdate.weatherimages[0]);
        weatherupdate.container.style.backgroundImage = `url(${weatherupdate.weatherimages[4]})`
    } else if (caseSmall(weatherupdate.mainweather).includes('wind')) {
        $('.changewe').attr('src', weatherupdate.weatherimages[3]);
        weatherupdate.container.style.backgroundImage = `url(${weatherupdate.weatherimages[2]})`;
    }else if (caseSmall(weatherupdate.mainweather).includes('mist')) {
        $('.changewe').attr('src', weatherupdate.weatherimages[7]);
        weatherupdate.container.style.backgroundImage = `url(${weatherupdate.weatherimages[2]})`;
    }
}
function ActivateTimer(time) {
    let timeInHours = time.timeinhours;
    let timeInMins = time.timeinmins;
    let timeInSec = time.timeinsec;

    // Clear the existing interval if there is one
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
    }

    // Function to update the display with leading zeros where necessary
    function updateDisplay() {
        const displayHours = timeInHours < 10 ? `0${timeInHours}` : timeInHours;
        const displayMin = timeInMins < 10 ? `0${timeInMins}` : timeInMins;
        const displaySec = timeInSec < 10 ? `0${timeInSec}` : timeInSec;
        const ampm = timeInHours >= 12 ? 'PM' : 'AM';  // AM/PM logic

        $('.hr').text(displayHours);
        $('.min').text(displayMin);
        $('.sec').text(displaySec);
        $('.period').text(ampm);
    }

    // Start a new interval and store its ID
    timerIntervalId = setInterval(function () {
        timeInSec++;

        if (timeInSec === 60) {
            timeInSec = 0;
            timeInMins++;
        }

        if (timeInMins === 60) {
            timeInMins = 0;
            timeInHours++;
        }

        // Handling the 12-hour format clock with AM/PM
        if (timeInHours === 13) { // Reset to 1 PM after 12 PM
            timeInHours = 1;
        } else if (timeInHours === 0) { // Handle midnight case for 12 AM
            timeInHours = 12;
        }

        updateDisplay(); // Update the display after adjusting time values
    }, 1000); // 1000 ms (1 second)
}

$(document).ready(function () {
    loader()
    $('#location').on("input", function () {
        let location = $('#location').val();
        waiting(trimed(location));
    });
    $('.search').click(function () {
        let location = $('#location').val();
        waiting(trimed(location));
    });
});
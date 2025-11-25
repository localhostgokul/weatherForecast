document.addEventListener("DOMContentLoaded", function() {
    const citySelect = document.getElementById("citySelect");
    const forecastContainer = document.getElementById("forecastContainer");
    let placeholderDisabled = false; // Flag to track if placeholder is disabled

    // Load city data from CSV and populate dropdown
    fetch('city_coordinates.csv')
        .then(response => response.text())
        .then(text => {
            const rows = text.split('\n');
            const fragment = document.createDocumentFragment();
            const placeholder = document.createElement('option');
            placeholder.textContent = 'Select a city';
            placeholder.disabled = true;
            placeholder.selected = true;
            fragment.appendChild(placeholder);

            rows.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                const [latitude, longitude, city, country] = row.split(',');
                if (city && country) {
                    const option = document.createElement('option');
                    option.value = `${latitude},${longitude}`;
                    option.textContent = `${city}, ${country}`;
                    option.dataset.city = city; // Store city name in data attribute
                    fragment.appendChild(option);
                }
            });

            citySelect.appendChild(fragment);
        })
        .catch(error => console.error('Error loading city data:', error));

    // Event listener for dropdown change
    citySelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const [latitude, longitude] = selectedOption.value.split(',');
        if (latitude && longitude) {
            fetchWeatherData(latitude, longitude);
            
            // Disable the placeholder option if not already disabled
            if (!placeholderDisabled) {
                citySelect.querySelector('option:disabled').disabled = true;
                placeholderDisabled = true; // Set flag to true after disabling placeholder
            }
        }
    });

    function fetchWeatherData(latitude, longitude) {
    // Refer to www.7timer.com for documentation
    const apiUrl = `http://www.7timer.info/bin/api.pl?lon=${latitude}&lat=${longitude}&product=astro&output=xml`
    
    fetch(apiUrl)
        .then(response => response.text())
        .then(data => parseWeatherData(data))
        .catch(error => console.error("Error fetching weather data:", error));
    }

    function parseWeatherData(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        //clear previous cards
        // const weatherContainer = document.getElementById("weather-data");
        forecastContainer.innerHTML = "";

        // Extract data and create cards
        const dataSeries = xmlDoc.querySelectorAll("dataseries data");
        console.log("Found data points:", dataSeries.length);
        // if (dataSeries.length > 0) {
        //     console.log("First data point attributes:", dataSeries[0].attributes);
        //     console.log("First data point:", dataSeries[0].outerHTML);
        // } DEBUGGING PURPOSES
        let daysData = {};

        dataSeries.forEach(dataPoint => {
            const timePoint = dataPoint.getAttribute("timepoint");
            const date = new Date();
            date.setHours(timePoint.split("h")[0]);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            const day = date.toDateString();

            if(!daysData[day]) {
                daysData[day] = {
                    cloudcover: [],
                    seeing: [],
                    transparency: [],
                    liftedIndex: [],
                    rh2m: [],
                    windDirection: '',
                    windSpeed: [],
                    temp: [],
                    precType: []
                };
            }

            daysData[day].cloudcover.push(parseFloat(dataPoint.querySelector('cloudcover')?.textContent.trim() || 0));
            daysData[day].seeing.push(parseFloat(dataPoint.querySelector('seeing')?.textContent.trim() || 0));
            daysData[day].transparency.push(parseFloat(dataPoint.querySelector('transparency')?.textContent.trim() || 0));
            daysData[day].liftedIndex.push(parseFloat(dataPoint.querySelector('lifted_index')?.textContent.trim() || 0));
            daysData[day].rh2m.push(parseFloat(dataPoint.querySelector('rh2m')?.textContent.trim() || 0));
            daysData[day].windDirection = dataPoint.querySelector('wind10m_direction')?.textContent.trim() || "N/A";
            daysData[day].windSpeed.push(parseFloat(dataPoint.querySelector('wind10m_speed')?.textContent.trim() || 0));
            daysData[day].temp.push(parseFloat(dataPoint.querySelector('temp2m')?.textContent.trim() || 0));
            daysData[day].precType = (dataPoint.querySelector('prec_type')?.textContent.trim() || 'none');
        });

        Object.keys(daysData).forEach(day => {
            const data  = daysData[day];
            const card = document.createElement("div");
            card.className = "weather-card mb-4";
            card.innerHTML = `
                <div class="card">
                    <img src="images/${mapconditionToIcon(data.precType)}" class="card-img-top" alt="${data.precType}">
                    <div class="card-body">
                        <h5 class="card-title">${day}</h5>
                        <p class="card-text">Temperature: ${average(data.temp)}</p>
                        <p class="card-text">Cloud Cover: ${average(data.cloudcover)}</p>
                        <p class="card-text">Seeing: ${average(data.seeing)}</p>
                        <p class="card-text">Transparency: ${average(data.transparency)}</p>
                        <p class="card-text">Lifted Index: ${average(data.liftedIndex)}</p>
                        <p class="card-text">Relative Humidity: ${average(data.rh2m)}</p>
                        <p class="card-text">Wind Direction: ${data.windDirection}</p>
                        <p class="card-text">Wind Speed: ${average(data.windSpeed)}</p>
                        <p class="card-text">Condition: ${data.precType}</p>
                    </div>
                </div>
            `;
            forecastContainer.appendChild(card);
        });
    }

    function mapconditionToIcon(precType) {
        const mapping = {
            none: "clear.png",
            cloudDay: "cloudy.png",
            fog: "fog.png",
            humid: "humid.png",
            ishow: "ishower.png",
            sleet: "lightrain.png",
            lightsnow: "lightsnow.png",
            mcloudy: "mcloudy.png",
            oshow: "oshower.png",
            pcloudy: "pcloudy.png",
            rain: "rain.png",
            rainsnow: "rainsnow.png",
            snow: "snow.png",
            tsrain: "tsrain.png",
            tstorm: "tstorm.png",
            windy: "windy.png"
    };
    return mapping[precType] || "clear.png";
}

    function average(arr) {
        return arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'N/A';
    }

});
function parseWeatherData(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    //clear previous cards
    // const weatherContainer = document.getElementById("weather-data");
    forecastContainer.innerHTML = "";

    // Extract data and create cards
    const dataSeries = xmlDoc.querySelectorAll("dataseries data");
    let daysData = {};

    dataSeries.forEach(dataPoint => {
        const timePoint = data.getAttribute("timepoint");
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
                wind10m_direction: '',
                windSpeed: [],
                temp: [],
                prec_type: []
            };
        }

        daysData[day].cloudcover.push(dataPoint.getAttribute("cloudcover") || 0);
        daysData[day].seeing.push(dataPoint.getAttribute("seeing") || 0);
        daysData[day].transparency.push(dataPoint.getAttribute("transparency") || 0);
        daysData[day].liftedIndex.push(dataPoint.getAttribute("lifted_index") || 0);
        daysData[day].rh2m.push(dataPoint.getAttribute("rh2m") || 0);
        daysData[day].windDirection = dataPoint.getAttribute("wind10m_direction");
        daysData[day].windSpeed.push(dataPoint.getAttribute("wind10m_speed") || 0);
        daysData[day].temp.push(dataPoint.getAttribute("temp2m") || 0);
        daysData[day].precType = (dataPoint.getAttribute("prec_type") || 'none');
    });
}




function fetchWeatherData(lat, lon) {
    // Refer to www.7timer.com for documentation
    const apiUrl = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=astro&output=xml`
    
    fetch(apiUrl)
        .then(response => {response.text()})
        .then(data => {parseWeatherData(data)})
}
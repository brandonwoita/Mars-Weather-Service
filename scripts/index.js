const API_KEY = 'DEMO_KEY'
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`

const previousWeatherToggle = document.querySelector('.show-previous-weather');
const previousWeather = document.querySelector('.previous-weather')

const currentSolElement = document.querySelector('[data-current-sol]')
const currentDateElement = document.querySelector('[data-current-date]')
const currentTempHighElement = document.querySelector('[data-current-temp-high]')
const currentTempLowElement = document.querySelector('[data-current-temp-low]')
const windSpeedElement = document.querySelector('[data-wind-speed]')
const windDirectionText = document.querySelector('[data-wind-direction-text]')
const windDirectionArrow = document.querySelector('[data-wind-direction-arrow]')

const previousSolTemplate = document.querySelector('[data-previous-sol-template]')
const previousSolContainer = document.querySelector('[data-previous-sols]')

const unitToggle = document.querySelector('[data-unit-toggle]')
const metricRadio = document.getElementById('cel')
const imperialRadio = document.getElementById('fah')

previousWeatherToggle.addEventListener('click', () => {
	previousWeather.classList.toggle('show-weather')
})

let selectedSolIndex

getWeather().then(sols => {
	selectedSolIndex = sols.length - 1 			//gives last index in array for the date
	displaySelectedSol(sols)
	displayPreviousSols(sols)
	updateUnits()

	unitToggle.addEventListener('click', () => {
		let metricUnits = !isMetric()					//if metric radio is checked, uncheck it
		metricRadio.checked = metricUnits
		imperialRadio.checked = !metricUnits
		displaySelectedSol(sols)
		displayPreviousSols(sols)				//making sure sols are re-rendered
		updateUnits()
	})

	metricRadio.addEventListener('change', () => {
		displaySelectedSol(sols)
		displayPreviousSols(sols)
		updateUnits()						 //calls the updateUnits function
	})

	imperialRadio.addEventListener('change', () => {
		displaySelectedSol(sols)
		displayPreviousSols(sols)
		updateUnits()
	})
})

function displaySelectedSol(sols) {
	const selectedSol = sols[selectedSolIndex]				//whichever sol is currently selected, or the last sol
	currentSolElement.innerText = selectedSol.sol 			// getting info from api and printing the sol number to html
	currentDateElement.innerText = displayDate(selectedSol.date)
	currentTempHighElement.innerText = displayTemperature(selectedSol.maxTemp)
	currentTempLowElement.innerText = displayTemperature(selectedSol.minTemp)
	windSpeedElement.innerText = displaySpeed(selectedSol.windSpeed)
	windDirectionArrow.style.setProperty('--direction', `${selectedSol.windDirectionDegrees}deg`) 		 //converts to degree value in css
	windDirectionText.innerText = selectedSol.windDirectionCardinal
}

function displayPreviousSols(sols) {
	previousSolContainer.innerHTML = '' 			 //calls content
	sols.forEach((solData, index) => {
		const solContainer = previousSolTemplate.content.cloneNode(true)			//clones html and put it in this sol container
		solContainer.querySelector('[data-sol]').innerText = solData.sol
		solContainer.querySelector('[data-date]').innerText = displayDate(solData.date)		 //prints out date
		solContainer.querySelector('[data-temp-high]').innerText = displayTemperature(solData.maxTemp)
		solContainer.querySelector('[data-temp-low]').innerText = displayTemperature(solData.minTemp)
		solContainer.querySelector('[data-select-button]').addEventListener('click', () => {
			selectedSolIndex = index			// displaying individual sol
			displaySelectedSol(sols)			// pass it in all the different sols
		})
		previousSolContainer.appendChild(solContainer)			//renders sol days on previous sols sections
	})
}

function displayDate(date) {
	return date.toLocaleDateString(
		undefined,							//determines language based on user browser
		{ day: 'numeric', month: 'long' }
	)
}

function displayTemperature(temperature) {
	let returnTemp = temperature
	if (!isMetric()) {
		returnTemp = (temperature - 32) * (5 / 9)   		 //conversion between C and F
	}
	return Math.round(returnTemp)			 //rounding temp to whole numbers
}

function displaySpeed(speed) {
	let returnSpeed = speed
	if (!isMetric()) {
		returnSpeed = speed / 1.609				 //converts to mph
	}
	return Math.round(returnSpeed)
}


function getWeather() {
	return fetch(API_URL)
		.then(res => res.json())
		.then(data => {
			const {
				sol_keys,
				validity_checks,
				...solData
			} = data							//loop thru object and pass thru all the different properties of sol data 
			return Object.entries(solData).map(([sol, data]) => {
				return {
					sol: sol,
					maxTemp: data.AT.mx,
					minTemp: data.AT.mn,
					windSpeed: data.HWS.av,
					windDirectionDegrees: data.WD.most_common.compass_degrees,
					windDirectionCardinal: data.WD.most_common.compass_point,
					date: new Date(data.First_UTC)
				}
			})
		})
}

function updateUnits() {
	const speedUnits = document.querySelectorAll('[data-speed-unit]')
	const tempUnits = document.querySelectorAll('[data-temp-unit]')
	speedUnits.forEach(unit => {
		unit.innerText = isMetric() ? 'kph' : 'mph'		// tells us which unit is being used. if true, use kph, if false, use mph

	})
	tempUnits.forEach(unit => {
		unit.innerText = isMetric() ? 'C' : 'F'			//same premise as above
	})
}

function isMetric() {
	return metricRadio.checked
}

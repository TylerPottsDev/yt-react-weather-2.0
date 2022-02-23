import { useState, useEffect } from 'react'

function App() {
	const APIKEY = "7a2fbe8627af041186451890e1d522fb";
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	const [currentLocation, setCurrentLocation] = useState(null)
	const [forecast, setForecast] = useState(null)
	const [city, setCity] = useState(null)
	const [menuOpen, setMenuOpen] = useState(false)
	const [searchInput, setSearchInput] = useState("")

	const fetchForecast = () => {
		fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${currentLocation.lat}&lon=${currentLocation.lng}&units=metric&exclude=minutely,hourly&appid=${APIKEY}`)
				.then(response => response.json())
				.then(data => {
					setForecast(data)
				})
				.catch(error => console.error(error))
	}

	const fetchCityName = () => {
		fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${currentLocation.lat}&lon=${currentLocation.lng}&limit=1&appid=${APIKEY}`)
				.then(response => response.json())
				.then(data => {
					setCity({
						name: data[0].name,
						country: data[0].country
					})
				})
				.catch(error => console.error(error))
	}

	const getDate = () => {
		const today = new Date()
		let day = today.getDate()
		let month = months[today.getMonth()]
		let year = today.getFullYear()

		if (day < 10) {
			day = "0" + day
		}
		
		return `${day} ${month} ${year}`
	}

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				position => {
					setCurrentLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					})
				},
				error => {
					console.error(error)
				}
			)
		}
	}, [])

	useEffect(() => {
		if (currentLocation) {
			fetchCityName();
			fetchForecast();
		}
	}, [currentLocation])

	const handleSearch = (e) => {
		e.preventDefault()

		if (searchInput) {
			fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchInput}&appid=${APIKEY}`)
				.then(response => response.json())
				.then(data => {
					setCurrentLocation({
						lat: data[0].lat,
						lng: data[0].lon
					})

					setCity({
						name: data[0].name,
						country: data[0].country
					})

					fetchForecast()

					setSearchInput("")
					setMenuOpen(false)
				});
		} else {
			alert("Please enter a city")
		}
	}

	const tempClass = () => {
		if (forecast) {
			if (Math.round(forecast.current.temp) < 10) {
				return "cold"
			} else if (Math.round(forecast.current.temp > 14)) {
				return "hot"
			} else {
				return ""
			}
		}
	}

	const timestampToDay = (timestamp) => {
		const date = new Date(timestamp * 1000)
		const day = date.getDay()
		const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

		return days[day]
	}

	return (
		<div className={`app ${tempClass()}`}>
			<header>
				<div className={`menu-toggle ${menuOpen ? 'is-active' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
					<div className="hamburger">
						<span></span>
					</div>
				</div>
			</header>

			<aside className={`sidebar ${menuOpen ? 'is-active' : ''}`}>
				<h2>City search</h2>
				<input 
					type="text" 
					className="city-search-input" 
					value={searchInput}
					placeholder="London, GB"
					onChange={evt => setSearchInput(evt.target.value)} />
				<button onClick={handleSearch}>Find the weather</button>
			</aside>

			{forecast && 
			<main>
				<h3 className="date">{ getDate() }</h3>
				<h1>{ city.name }, { city.country }</h1>
				
				<div className="forecast">
					<div className="forecast-inner">
						<h3>{ forecast.current.weather[0].description }</h3>
						<div className="temp">
							{ Math.round(forecast.current.temp) }<sup>&deg;</sup>
						</div>
					</div>
				</div>

				<div className="daily">
					{forecast.daily.map((day, index) => {
						return (
							<div className="day" key={index}>
								<h3>{ timestampToDay(day.dt) }</h3>
								<div className="temp">{ Math.round(day.temp.day) }&deg;</div>
								<img src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} alt={day.weather[0].description} />
							</div>
						)
					})}
				</div>
				
			</main>}
		</div>
	)
}

export default App
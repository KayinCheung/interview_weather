

## Assumptions

- From the list of cities on openweathermap.com, if cities share the same name AND country, only one copy is kept.
- Current and today's weather data is just as important as the next 5 days, hence it's also included.
- End users are not on keypad based feature phones.
- Hong Kong user; loads Hong Kong's weather by default
- For the daily summary, the most useful data for wind and weather conditions is the max wind speed and worst weather conditions respectively for that day.
From: https://openweathermap.org/weather-conditions
From the day's 3hr data, get the highest weather code that's below 800. If none are below 800, get the highest code. 


## Limitations
- API shows next 40 instance of 3hr forecast. It's usually partial data of today (1st day), next 5 days, where the final day has partial data.
API can also show today (full day), plus next 4 full days. When this happens, the front-end will show today + next 4 days. Due to API limitation, the project cannot always show the final required day.
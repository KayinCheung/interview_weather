## Building and running the project
- Download and unzip the repository.
- Npm install, then npm start to run it locally in your browser. 
Or visit https://interviewtest2.github.io/ to view the project deployed on github pages.
- Npm run build to build the project for deployment

## Testing
Try inputs in the input field. Click the search button or Enter key. There's 3 scenarios
1) Invalid city - No city is found for the input. An error message to try again will appear.
2) Valid, non duplicated city - A city is found, and the city's name is unique. The site will show today + next 5 days forecast.
3) Valid, duplicated city - A city found, but the city's name is shared among different countries. (Eg: London in a city in USA, Canada, UK)
All valid cities and their countries will show up as suggestions. Click on one of the suggestions to view weather forecast.

After weather forecast is loaded from scenario 2 and 3. Click on one of the dates to drill down into 3hr forecasts for that day.
Check that the min and max temp in daily forecast corresponds to min and max from all the 3hr forecast for that day, and the daily forecast shows the worst weather from all 3hr forecasts.



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
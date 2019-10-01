import React, { Component } from 'react';

import constant from './Constant.js'
import * as util from './util.js'
import './App.css';
import cities from './data/modifiedCityList.json'
import duplicate_cities from './data/duplicateCities.json'
import ThreeHrTable from './ThreeHrTable.js'
import DailyRowData from './DailyRowData.js'
import RecommendButtons from './RecommendButtons.js'

class Body extends Component {

  constructor(props){
    super(props)
    this.state = {
        timespan: constant.defaultTimespan,   //3h or daily
        cityid: constant.defaultCityId,      //Defaults to Hong Kong.
        data: [],                            //If empty, shows spinner icon
        threeHrData: {},
        dailyData: {},
        daySelection: 0,                      //Defaults to today
        dateList:[],
        city: '',
        country: '',
        timezone_offset: 0,
        recommendations: {},
        input: '',
        errorMsg: ''
      

    } 

    this.handleDaySelection = this.handleDaySelection.bind(this)
    this.handleCityClick = this.handleCityClick.bind(this)
  }

  //Run API calls
  componentDidMount(){
    this.APICall(this.state.cityid)

    this.handleSearchClick() //Add event listener for search box
  }

  handleDaySelection(newDay){
    this.setState({
      daySelection: newDay
    })
  }

  handleCityClick(city, cityid){
    this.APICall(cityid)
    this.setState({recommendations: {}})
  }


  handleSearchClick(){
    document.getElementById("inputCityBtn").addEventListener("click", () => {
      let city = (document.getElementById("inputCityText").value).toLowerCase()
      //Check if city is valid, if yes, update city, else show error
      if (city in cities){
        //Show error
        let cityid = cities[city]["id"]
        console.log(cityid)
        this.setState({errorMsg: ''})
        this.APICall(cityid)
        return
      } else if (city in duplicate_cities){
        console.log(duplicate_cities[city])
        this.setState({
          recommendations: duplicate_cities[city],
          input: city,
          errorMsg: ''
        })
      } else{
        this.setState({errorMsg: 'City not found, please try again.'})
      }
      
    })
  }


  //Runs when cityid is changed and at componentDidMount.
  APICall(cityid){

    fetch(`http://api.openweathermap.org/data/2.5/forecast?id=${cityid}&appid=${constant.APIKey}&units=${constant.unit}`)
    .then(response => response.json())
    .then(data => {

      this.setState({
        data: data,
        city: data["city"]["name"],
        country: data["city"]["country"]
      })
      this.processData(data)
      console.log(data)
    })
    .catch(error => console.error(error))
  }

  //1 )Process into Key (Day), Value (Object of info for that day)
  //2 )Process into Key (Day), Value (array of object for each 3hr period for that day)
  processData(data){
    //Set timezone offset
    let offset = data["city"]["timezone"]/3600
    
    data = data["list"]
    //Process data for 3 hour view
    let threeHrData = {}
    let dateList = []

    //Loop through each 3hr period
    for (let i = 0; i < data.length; i++){
      
      //Get local time
      let offset_datetime = util.offsetDateTime(data[i]["dt_txt"], offset)
      let date, time, ampm
      [date, time, ampm] = (offset_datetime).split(" ")

      if (!(date in threeHrData)){
        threeHrData[date] = []
        dateList.push(date)
      }
      threeHrData[date].push({
        "time": parseInt(time) + ampm,
        "temp_min": data[i]["main"]["temp_min"],
        "temp_max": data[i]["main"]["temp_max"],
        "weather": data[i]["weather"][0]["description"],
        "weatherid": data[i]["weather"][0]["id"],
        "wind": data[i]["wind"]["speed"],
        "deg": data[i]["wind"]["deg"],
        "icon": data[i]["weather"][0]["icon"]
      })
    }

    console.log(threeHrData)
    this.setState({
      threeHrData: threeHrData,
      dateList: dateList
    })

    //Process data for daily summary
    let dailyData = {}
    Object.keys(threeHrData).forEach(date=>{
      let temp_max = -999
      let temp_min = 999
      let worst_weather_id = 0
      let cloud_weather_id = 800
      let worst_weather = ''
      let cloud_weather = 'clear sky'
      let wind_max = 0
      let worst_weather_icon = ''
      let cloud_weather_icon = '01d'
      //Get min/max temp, and worst weather and wind for that day.
      for (let i = 0; i < threeHrData[date].length; i++){
        if (threeHrData[date][i]["temp_max"] > temp_max) temp_max = threeHrData[date][i]["temp_max"]
        if (threeHrData[date][i]["temp_min"] < temp_min) temp_min = threeHrData[date][i]["temp_min"]
        if (threeHrData[date][i]["wind"] > wind_max) wind_max = threeHrData[date][i]["wind"]
        if (threeHrData[date][i]["weatherid"] > worst_weather_id && threeHrData[date][i]["weatherid"] < 800)
        {
          worst_weather_id = threeHrData[date][i]["weatherid"]
          worst_weather = threeHrData[date][i]["weather"]
          worst_weather_icon= threeHrData[date][i]["icon"]
        } 

        if (threeHrData[date][i]["weatherid"] > cloud_weather_id)
        {
          cloud_weather_id = threeHrData[date][i]["weatherid"]
          cloud_weather = threeHrData[date][i]["weather"]
          cloud_weather_icon= threeHrData[date][i]["icon"]
        } 

      }

      /*For daily summary,
        If have multiple weather_id throughout the day, show the worst weather for that day.
        Show Highest weather_id within 0 < id < 800. Otherwise show the highest value from group 8xx (cloudy statuses).
      */
      let weather_id
      let weather
      let icon
      if (worst_weather_id > 0){
        weather_id = worst_weather_id
        weather = worst_weather
        icon = worst_weather_icon
      } else {
        weather_id = cloud_weather_id
        weather = cloud_weather
        icon = cloud_weather_icon
      }

      dailyData[date] = {
        "temp_max": temp_max,
        "temp_min": temp_min,
        "weather_id": weather_id,
        "weather": weather,
        "wind_max": wind_max,
        "icon": icon
      }
    })

    this.setState({dailyData:dailyData})
    console.log(dailyData)
  }

  render(){

  return (
    <div>
      <section className="section">
      
      <div className="container is-centered" style={{flex: 1}}>
  
      <InputBox dropdown={this.state.recommendations}/>
      {this.state.errorMsg === '' ? null : <p className="is-size-7 has-text-danger">{this.state.errorMsg}</p>}
     
      {Object.keys(this.state.recommendations).length === 0 ? null : <RecommendButtons 
        cityInput={this.state.input} 
        recommendations={this.state.recommendations}
        handleCityClick={this.handleCityClick}/>}
      
      {this.state.city === '' ? null : <Summary 
        city={this.state.city} 
        temp={this.state.data["list"][0]["main"]["temp"]}
        country={this.state.country}/>}
      

        {Object.keys(this.state.dailyData).length === 0 ? null : 
        <DailyRowData data={this.state.dailyData} handleDaySelection={this.handleDaySelection}/>} 
        
        {Object.keys(this.state.threeHrData).length === 0 ? null :
        <div>
        <strong>Forecast for {this.state.dateList[this.state.daySelection]}</strong>
        <br/><br/>
        <ThreeHrTable 
        data={this.state.threeHrData[this.state.dateList[this.state.daySelection]]}/>
        </div>
        } 

        </div>
        
        </section>
    </div>
  );
}
}

export default Body;


/*
      <div class="dropdown is-active">
  <div class="dropdown-menu" id="dropdown-menu" role="menu">
    <div class="dropdown-content">
      <a href="#" class="dropdown-item">
        Dropdown item
      </a>
      <a class="dropdown-item">
        Other dropdown item
      </a>
      <a href="#" class="dropdown-item is-active">
        Active dropdown item
      </a>
      <a href="#" class="dropdown-item">
        Other dropdown item
      </a>
      <hr class="dropdown-divider"/>
      <a href="#" class="dropdown-item">
        With a divider
      </a>
    </div>
  </div>
</div>
*/



class InputBox extends Component {
  render() {
    return (
      <nav className="level">
        <div className="level-item">
          <div className="field has-addons">
            <p className="control">
              <input className="input is-fullwidth" type="text" placeholder="Input a city" id="inputCityText"/>
            </p>
            <p className="control">
              <button className="button" id="inputCityBtn">
                Search
              </button>
            </p>
          </div>
      </div>
    </nav>
     
    );
  }
}


class Summary extends Component {
  render() {
    let header = `Current Weather in ${this.props.city}, ${this.props.country}`
    return (
      <div>
        <p className="is-size-4 has-text-weight-semibold">{header}</p>
        <br/>
        <p className="is-size-3">
          {parseFloat(this.props.temp).toFixed(1)}{this.props.unit}°C</p>
        <br/>
        </div>

    );
  }
}

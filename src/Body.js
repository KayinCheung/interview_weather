import React, { Component } from 'react';

import constant from './Constant.js'
import * as util from './util.js'
import './App.css';
import cities from './data/modifiedCityList.json'


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
        country: '',
        timezone_offset: 0
      

    } 

    this.handleDaySelection = this.handleDaySelection.bind(this)
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


  handleSearchClick(){
    document.getElementById("inputCityBtn").addEventListener("click", () => {
      let city = (document.getElementById("inputCityText").value).toLowerCase()
      //Check if city is valid, if yes, update city, else show error
      if (!(city in cities)){
        //Show error
        console.error("Invalid city")
        return
      }
      let cityid = cities[city]["id"]
      console.log(cityid)
      this.APICall(cityid)
    })
  }


  //Runs when cityid is changed and at componentDidMount.
  APICall(cityid){

    fetch(`http://api.openweathermap.org/data/2.5/forecast?id=${cityid}&appid=${constant.APIKey}&units=${constant.unit}`)
    .then(response => response.json())
    .then(data => {

      this.setState({
        data: data,
        country: data["city"]["name"]
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
      <InputBox/>
     
      {this.state.country === '' ? '' : <Summary 
        location={this.state.country} 
        temp={this.state.data["list"][0]["main"]["temp"]}/>}
      

        {Object.keys(this.state.dailyData).length === 0 ? '' : 
        <DailyRowData data={this.state.dailyData} handleDaySelection={this.handleDaySelection}/>} 
        
        {Object.keys(this.state.threeHrData).length === 0 ? '' :
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


class DailyRowData extends Component {
  render() {
    let data = this.props.data

    return (
      <div>
        <hr/>
    <nav className="level">

     {Object.keys(data).map((day, i) => (
       <div key={`daily${day}`} className="level-item has-text-centered clickableBox paddedBox" 
        onClick={()=>{this.props.handleDaySelection(i)}}>
       <div>
        
        <p className="is-size-4">
          {constant.month_map[parseInt(day.split("-")[1])]}
          &nbsp;{parseInt(day.split("-")[2])}
        </p>
        <img src={`http://openweathermap.org/img/wn/${data[day]["icon"]}@2x.png`} width="50px" height="50px" />
        <br/>

        {parseFloat(data[day]["temp_min"]).toFixed(1)} - {parseFloat(data[day]["temp_max"]).toFixed(1)}°C<br/>

        {(data[day]["weather"])}<br/>

        Wind: {(data[day]["wind_max"])}m/s
        
        </div>
      </div>
    ))}
    
    </nav>
    <hr/>
    </div>
      
    );
  }
}

class ThreeHrTable extends Component {

  render() {
    let data = this.props.data
    console.log(data)
    return (

      data.map(function(row,i){
        let time = (row["time"])

      return(
        <article className="media" key={time}>
          <figure className="media-left">
            <p className="image is-64x64">
            <img src={`http://openweathermap.org/img/wn/${row["icon"]}@2x.png`} width="50px" height="50px"/>
            </p>
          </figure>
          <div className="media-content">
            <div className="content">
              
                <strong>{time}</strong>&nbsp;&nbsp;
                -&nbsp;&nbsp;
                {row["weather"]}
                <br/>
                
                <p className="button is-small">{parseFloat(row["temp_min"]).toFixed(1)}°C</p>
                &nbsp;&nbsp;-&nbsp;&nbsp;
                <p className="button is-small">{parseFloat(row["temp_max"]).toFixed(1)}°C</p><br/>
                <p>Wind: {row["wind"]}m/s</p>
              
            </div>
          </div>
        </article>
      )})
    );
  }
}
/*
<td>{time}{time < 12 ? 'am' : 'pm'}</td>
                  <td>{parseFloat(row["temp_min"]).toFixed(1)}°C</td>
                  <td>{parseFloat(row["temp_max"]).toFixed(1)}°C</td>
                  <td>{row["weather"]}</td>
                  <td>{row["wind"]}m/s</td>
                  <td>{row["deg"]}</td>
                  
                        <table className="table">
          {
            data.map(function(row,i){
              let time = parseInt(row["time"].split(":")[0])
              
              return(
                  <tr key={i} id={`date${i}`}>
                  <td>
                    <div>
                    {time}{time < 12 ? 'am' : 'pm'} <img src="https://openweathermap.org/img/wn/01d@2x.png" height={10}/>
                    {parseFloat(row["temp_min"]).toFixed(1)}°C
                    {parseFloat(row["temp_max"]).toFixed(1)}°C
                    {row["weather"]}
                    {row["wind"]}m/s
                    {row["deg"]}
                      </div>

                    </td>
                </tr>
                )
            })
          }
        </table>
                  
                  */


class InputBox extends Component {
  render() {
    return (
      <nav className="level">
        <div className="level-item">
          <div className="field has-addons">
            <p className="control">
              <input className="input" type="text" placeholder="Input a city" id="inputCityText"/>
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
    let header = `Current Weather in ${this.props.location}`
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

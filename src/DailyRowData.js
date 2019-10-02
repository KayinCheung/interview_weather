import React, { Component } from 'react';
import constant from './Constant.js'

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
                <img src={`https://openweathermap.org/img/wn/${data[day]["icon"]}@2x.png`} width="50px" height="50px" />
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

export default DailyRowData;
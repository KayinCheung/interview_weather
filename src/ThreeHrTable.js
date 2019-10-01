import React, { Component } from 'react';

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

export default ThreeHrTable;
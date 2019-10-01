import React, { Component } from 'react';

class RecommendButtons extends Component {
    render() {
      console.log(this.props.recommendations)
      return(
        <div className="is-centered has-text-centered">
        <p>Please select a city</p>
        <div className="buttons is-centered">
        {Object.keys(this.props.recommendations).map((country) => (
          <button key={`${country}_button`} className="button" 
            onClick={() => this.props.handleCityClick(country, this.props.recommendations[country])}>
          {this.props.cityInput}, {country}
          </button>
        ))}
        </div>
        <br/>
        </div>
      )
    }
  }

export default RecommendButtons;

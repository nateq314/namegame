import React, { Component } from 'react';
import './App.css';

class App extends Component {
  componentDidMount() {
    fetch('https://willowtreeapps.com/api/v1.0/profiles')
    .then(response => response.json())
    .then(response => {
      console.log(response);
    })
  }

  render() {
    return (
      <div className="App">
        <p>hello</p>
      </div>
    );
  }
}

export default App;

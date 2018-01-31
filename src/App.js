import React, { Component } from 'react';
import { auth } from './firebase';
import { Route, Switch } from 'react-router-dom';
import Login from './routes/Login/Login';
import Register from './routes/Register/Register';
import NameGame from './routes/NameGame/NameGame';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null
    };
  }

  componentDidMount() {
    // This will also auto-login since Firebase uses cookies
    auth.onAuthStateChanged(user => {
      this.setState({ user });
    });
  }

  render() {
    const { user } = this.state;
    return (
      <div className="App">
        {user ? (
          // LOGGED IN
          <NameGame user={user} />
        ) : (
          // NOT LOGGED IN
          <Switch>
            <Route path="/register" component={Register} />
            <Route component={Login} />
          </Switch>
        )}
      </div>
    );
  }
}

export default App;

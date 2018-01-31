import React from 'react';
import { auth } from '../../firebase';
import { Link } from 'react-router-dom';

import './Login.css';

let email, password;

function loginFormOnSubmit(e) {
	e.preventDefault();
	auth.signInWithEmailAndPassword(email.value, password.value);
}

export default () => (
  <div id="Login" className="row">
    <div className="col s4 offset-s4">
      <form onSubmit={loginFormOnSubmit}>
        <h3>Welcome to the Name Game!</h3>
        <p>
          <label htmlFor="email">Email:</label>
          <input type="text" id="email" ref={(input) => { email = input; }} />
        </p>
        <p>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" ref={(input) => { password = input; }} />
        </p>
        <div className="footer">
          <p><Link to="/register">Register Now</Link></p>
          <button type="submit">Log In</button>
        </div>
      </form>
    </div>
  </div>
);
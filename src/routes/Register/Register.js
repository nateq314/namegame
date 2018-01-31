import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase';

import './Register.css';

let email, password;

function registerFormOnSubmit(e) {
	e.preventDefault();
	auth.createUserWithEmailAndPassword(email.value, password.value)
	.catch(error => {
		console.log(error);		// TODO write real error handler
	});
}

export default ({ displayError }) => (
	<div id="Register" className="row">
		<div className="col s4 offset-s4">
			<form onSubmit={registerFormOnSubmit}>
			<h3>Registration</h3>
			<p>
				<label htmlFor="email">Email:</label>
				<input type="text" id="email" ref={(input) => { email = input; }} />
			</p>
			<p>
				<label htmlFor="password">Password:</label>
				<input type="password" id="password" ref={(input) => { password = input; }} />
			</p>
			<div className="footer">
				<button type="submit">Register</button>
				<Link to="/">Go back</Link>
			</div>
			</form>
		</div>
	</div>
);
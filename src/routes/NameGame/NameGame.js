import React from 'react';
import { auth } from '../../firebase';
import MatchPhoto from '../../components/MatchPhoto/MatchPhoto';
import Search from '../../components/Search/Search';
import { List } from 'immutable';

import './NameGame.css';

const shuffle = require('lodash.shuffle');

// Utility functions
function confirmSetting() {
	return window.confirm("This will end the current game and begin a new one, are you sure?");
}

class NameGame extends React.Component {
	constructor(props) {
		super(props);
		this.modeOnSelect = this.modeOnSelect.bind(this);
		this.numTurnsOnChange = this.numTurnsOnChange.bind(this);
		this.settingOnToggle = this.settingOnToggle.bind(this);
		this.games = [MatchPhoto, null, null, null, null, Search];
		this.state = {
			randomizedPeople: null,
			mode: 5,
			settings: {
				num_turns: 130,
				team_mode: false,
				timed_mode: false,
				hint_mode: false,
				show_job_title: true
			}
		};
	}

	componentDidMount() {
    fetch('https://willowtreeapps.com/api/v1.0/profiles')
    .then(response => response.json())
    .then(response => {
			// Don't put it in state since we don't expect the dataset of people to ever change.
			this.people = List(response);
			// this.forceUpdate();
			const { settings } = this.state;
			const randomizedPeople = List(
					shuffle(
						response.filter(person => settings.team_mode ? person.jobTitle : true)
					)
				);

			this.setState({
				randomizedPeople,
			}, () => {
				this.numTurnsInput.value = this.state.settings.num_turns;
			});
		});
	}

	logoutOnClick(e) {
    e.preventDefault();
    auth.signOut();
	}
	
	modeOnSelect(mode) {
		const newState = { mode };
		if (mode === 5) newState.settings = {
			...this.state.settings,
			num_turns: this.people.size
		}
		this.setState(newState);
	}

	render() {
		const { randomizedPeople, mode, settings } = this.state;
		const Game = this.games[mode];
		return (
			<div id="NameGame" style={{
				gridTemplateAreas: mode === 5
					? "'header header' 'app app'"
					: "'header header' 'sidebar app'"
			}}>
				<nav id="header">
					<div className="nav-wrapper">
						<ul id="mode-select" className="left">
							<li className={mode === 0 ? 'active' : ''}>
								<a onClick={() => { this.modeOnSelect(0); }}>Photo Match</a>
							</li>
							{/* No time to implement these other games! */}
							<li className="disabled"><a onClick={null}>Name Match</a></li>
							<li className="disabled"><a onClick={null}>Fill in the Name</a></li>
							<li className="disabled"><a onClick={null}>Drag and Drop</a></li>
							<li className="disabled"><a onClick={null}>Facemash!</a></li>
							<li className={mode === 5 ? 'active' : ''}>
								<a onClick={() => { this.modeOnSelect(5); }}>Search</a>
							</li>
						</ul>
						<ul className="right">
							<li id="acct-info">
								<a>
									<span className="label">Currently Signed In:</span>
									<span className="user_email">{this.props.user.email}</span>
								</a>
							</li>
							<li><a className="waves-effect waves-light btn" onClick={this.logoutOnClick}>Logout</a></li>
						</ul>
					</div>
				</nav>
				<div id="sidebar" style={{ display: mode === 5 ? 'none' : 'block'}}>
					<div id="numturns-selector">
						<label>Game Length (in # turns): {settings.num_turns}</label>
						<p className="range-field">
							<input
								type="range"
								id="test5"
								min="5"
								max={randomizedPeople ? randomizedPeople.size : 10}
								onChange={this.numTurnsOnChange}
								ref={input => { this.numTurnsInput = input; }}
							/>
						</p>
					</div>
					<div className="switch">
						<label>
							<span className="left-side">Everybody</span>
							<input
								type="checkbox"
								onChange={this.settingOnToggle}
								name="team_mode"
							/>
							<span className="lever"></span>
							<span className="right-side">Team Mode</span>
						</label>
					</div>
					<div className="switch">
						<label>
							<span className="left-side">Free Play</span>
							<input
								type="checkbox"
								onChange={this.settingOnToggle}
								name="timed_mode"
							/>
							<span className="lever"></span>
							<span className="right-side">Timed Play</span>
						</label>
					</div>
					<div className="switch">
						<label>
							<span className="left-side">No Hints</span>
							<input
								type="checkbox"
								onChange={this.settingOnToggle}
								name="hint_mode"
							/>
							<span className="lever"></span>
							<span className="right-side">Hints</span>
						</label>
					</div>
					<div className="switch">
						<label>
							<span className="left-side">Show Title</span>
							<input
								type="checkbox"
								onChange={this.settingOnToggle}
								name="show_job_title"
								defaultChecked={true}
							/>
							<span className="lever"></span>
							<span className="right-side">Hide Title</span>
						</label>
					</div>
				</div>
				<div id="app">
					{this.people && (
						<Game
							settings={settings}
							people={randomizedPeople.take(settings.num_turns)}
						/>
					)}
				</div>
			</div>
		);
	}

	numTurnsOnChange(e) {
		const num_turns = e.currentTarget.value;
		if (this.numTurnsDebounceTimer) clearTimeout(this.numTurnsDebounceTimer);
		this.numTurnsDebounceTimer = setTimeout(() => {
			this.numTurnsDebounceTimer = null;
			if (confirmSetting()) {
				this.setState({
					settings: {
						...this.state.settings,
						num_turns
					}
				});
			}
			else this.numTurnsInput.value = this.state.settings.num_turns;
		}, 500);
	}

	settingOnToggle(e) {
		const setting = e.currentTarget.name;
		const resetGame = !(setting === 'hint_mode' || setting === 'show_job_title');
		const newState = {
			settings: {
				...this.state.settings,
				[setting]: e.currentTarget.checked
			}
		};
		if (resetGame) {
			if (confirmSetting()) {
				newState.randomizedPeople = List(
					shuffle(
						this.people
							.filter(person => e.currentTarget.checked ? person.jobTitle : true)
							.toArray()
					)
				);
				this.setState(newState);
			}
			else e.currentTarget.checked = this.state.settings[setting];
		}
		else this.setState(newState);
	}

}

export default NameGame;
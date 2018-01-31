import React from 'react';
import { PropTypes as T } from 'prop-types';
import { List, Map, Set } from 'immutable';
import hoorayCheckmark from './checkmark.gif';
import bigX from './x.png';
import defaultImage from './noimgavailable.png';

import './MatchPhoto.css';

const shuffle = require('lodash.shuffle');

function getRandomInt(max) {
	// const x = window.crypto.getRandomValues(new Uint16Array(1))[0] % max; 
	// return x;
	return Math.floor(Math.random() * max);
}

function getChoices(people, currentIndex, correctIndex) {
	const person = people.get(currentIndex);
	return List(shuffle(people.delete(currentIndex).toArray()))
		.take(4)
		.insert(correctIndex, person);
}

// Thanks to Edwin Webb (https://gist.github.com/edwinwebb/1376880#file-secondstotimestring-L3)
function prettyTime(milliseconds, showms = true) {
	const seconds = milliseconds / 1000;
	var ms = Math.floor((seconds*1000) % 1000);
	var s = Math.floor(seconds%60);
	var m = Math.floor((seconds*1000/(1000*60))%60);
	var strFormat = showms ? "MM:SS:XX" : "MM:SS";
	if(s < 10) s = "0" + s;
	if(m < 10) m = "0" + m;
	if(ms < 100) ms = "0" + ms;
	if(ms < 10) ms = "0" + ms;
	strFormat = strFormat.replace(/MM/, m);
	strFormat = strFormat.replace(/SS/, s);
	strFormat = strFormat.replace(/XX/, ms.toString().slice(0,2));
	return strFormat;
}

function getInitialState(props) {
	const { people } = props;
	const correctIndex = getRandomInt(5);
	return {
		currentIndex: 0,
		correctIndex,
		correctOneHasBeenFound: false,
		choices: getChoices(people, 0, correctIndex).map(person => Map({
			person,
			clicked: false,
		})),
		turnStartTime: new Date(),
		gameStartTime: new Date(),
		times: List(),
		tries: List([0]),
		// Technically don't need to store these totals in state since they're derived from other state.
		// However it saves some calculation that otherwise might have to be done on ever single re-render.
		totals: Map({
			total_tries: 0,
			total_time: 0,
		}),
		gameTimer: 0,
		turnTimer: props.settings.timed_mode ? 10000 : 0,
		gameIsComplete: false
	};
}

class MatchPhoto extends React.Component {
	constructor(props) {
		super(props);
		this.state = getInitialState(props);
		this.gameTimerInterval = null;
		this.turnTimerInterval = null;
	}

	componentDidMount() {
		this.setGameTimerInterval();
		this.setTurnTimerInterval();
	}

	componentWillReceiveProps(nextProps) {
		if (
			!(
				nextProps.settings.hint_mode !== this.props.settings.hint_mode ||
				nextProps.settings.show_job_title !== this.props.settings.show_job_title
			)
		) {
			this.setState(getInitialState(nextProps));	// reset everything
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const gameIsComplete = this.state.currentIndex + 1 >= this.props.people.size;
		// if (!(this.turnTimerInterval || gameIsComplete)) {
		// 	this.setTurnTimerInterval();
		// }
		if (!gameIsComplete) {
			if (!this.turnTimerInterval) this.setTurnTimerInterval();
			if (!this.gameTimerInterval) this.setGameTimerInterval();
		}
		if (this.props.settings.timed_mode && this.state.turnTimer < 1000) {
			clearInterval(this.turnTimerInterval);
			this.turnTimerInterval = null;
			const { tries, currentIndex, totals, times } = this.state;
			const { people } = this.props;
			const correctIndex = getRandomInt(5);
			if (!gameIsComplete) {
				this.setState({
					// If time runs out, count as 6 tries (1 more than possible if they clicked all of the choices).
					tries: tries.set(currentIndex, 6).push(0),
					totals: totals.merge({
						total_tries: totals.get('total_tries') + (6 - (this.state.tries.get(currentIndex))),
						total_time: totals.get('total_time') + 10000
					}),
					correctOneHasBeenFound: false,
					currentIndex: currentIndex + 1,
					correctIndex,
					choices: getChoices(people, currentIndex + 1, correctIndex)
						.map(person => Map({
							person,
							clicked: false
						})),
					turnStartTime: new Date(),
					times: times.push(10000),
					turnTimer: 10000,
				});
			} else {
				clearInterval(this.gameTimerInterval);
				this.setState({
					currentIndex: currentIndex + 1,
					gameIsComplete
				});
			}
		}
	}

	_currentMatch() {
		const { currentIndex, choices, correctIndex, gameIsComplete } = this.state;
		const { people, settings } = this.props;
		if (gameIsComplete) {
			return (
				<div id="currentMatch">
					<h1>Game over</h1>
				</div>
			);
		}
		else {
			const person = gameIsComplete ? null : people.get(currentIndex);
			const fullname = gameIsComplete ? null : `${person.firstName} ${person.lastName}`;
			return (
				<div id="currentMatch">
					<div id="currentName">
						<h2 className="title">Who is {fullname}?</h2>
					</div>
					<ul id="photos">
						{choices.map((choice, idx) => {
							const person = choice.get('person'),
										clicked = choice.get('clicked'),
										isCorrect = idx === correctIndex;
							return (
								<li
									key={idx}
									className={`${clicked ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
									onClick={() => this.imageOnClick(idx, isCorrect, clicked)}
								>
									<div className={`image-container`}>
										<img src={person.headshot.url || defaultImage} alt={person.headshot.alt} />
									</div>
									{settings.show_job_title && <label>{person.jobTitle || '(ex-employee)'}</label>}
									<div className="overlay">
										{isCorrect && <img src={hoorayCheckmark} alt={'correct'} />}
										{!isCorrect && <img src={bigX} alt='incorrect' />}
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			);
		}
	}

	_gameTimer() {
		return (
			<div id="gameTimer">
				<label>Total Elapsed Time:</label>
				{prettyTime(this.state.gameTimer, false)}
			</div>
		);
	}

	_turnTimer() {
		return (
			<div id="turnTimer">
				<label>
					{this.props.settings.timed_mode ? 'Time Left This Turn' : 'This Turn'}
				</label>
				{prettyTime(this.state.turnTimer, false)}
			</div>
		);
	}
	
	_stats() {
		const { currentIndex, totals } = this.state;
		const { people } = this.props;
		return (
			<div id="stats">
				<div className="stat-group one">
					<span className="stat">
						<label>Turns Completed:</label>
						<span className="figure">{currentIndex}</span>
					</span>
					<span className="stat">
						<label>Turns Remaining:</label>
						<span className="figure">{people.count() - currentIndex}</span>
					</span>
				</div>
				<div className="stat-group two">
					<span className="stat">
						<label>Total tries:</label>
						<span className="figure">{totals.get('total_tries')}</span>
					</span>
					<span className="stat">
						<label>Average tries per guess:</label>
						<span className="figure">{((totals.get('total_tries') / currentIndex) || 0).toFixed(2)}</span>
					</span>
				</div>
				<div className="stat-group three">
					<span className="stat">
						<label>Total time used:</label>
						<span className="figure">{prettyTime(totals.get('total_time'))}</span>
					</span>
					<span className="stat">
						<label>Average time per guess:</label>
						<span className="figure">{prettyTime(Math.floor((totals.get('total_time') / currentIndex) || 0))}</span>
					</span>
				</div>
			</div>
		);
	}

	_finishedMatches() {
		const { people } = this.props;
		const { currentIndex, times, tries } = this.state;
		return (
			<div id="finishedMatches">
				<div className="row">
					{people.take(currentIndex).map((person, idx) => {
						const time = times.get(idx);
						const numtries = tries.get(idx);
						return (
							<div key={person.id} className="col s3">
								<div className="match">
									<img src={person.headshot.url || defaultImage} alt={person.headshot.alt} />
									<span className="name">{person.firstName + ' ' + person.lastName}</span>
									<span className="position">{person.jobTitle || '(ex-employee)'}</span>
									<span className="time_tries">
										<span className={`numtries ${numtries === 6 ? 'over' : ''}`}>{numtries} {numtries === 1 ? 'try ' : 'tries '}</span>
										({prettyTime(time)})
									</span>
								</div>
							</div>
						); 
					})}
				</div>
			</div>
		);
	}

	render() {
		return (
			<div id="MatchPhoto">
				{this._currentMatch()}
				{this._gameTimer()}
				{this._turnTimer()}
				{this._stats()}
				{this._finishedMatches()}
			</div>
		);
	}

	imageOnClick(idx, isCorrect, clicked) {
		if (!(clicked || this.state.correctOneHasBeenFound)) {
			const { currentIndex, times, tries, choices, turnStartTime, totals } = this.state;
			const { people, settings } = this.props;
			const gameIsComplete = currentIndex + 1 === people.size;
			this.setState({
				choices: choices.setIn([idx, 'clicked'], true),
				tries: tries.set(currentIndex, tries.get(currentIndex) + 1),
				totals: totals.merge({
					total_tries: totals.get('total_tries') + 1,
				}),
				correctOneHasBeenFound: isCorrect,
			});
			if (isCorrect) {
				clearInterval(this.turnTimerInterval);
				this.turnTimerInterval = null;
				const thisTime = (new Date()) - turnStartTime;
				setTimeout(() => {
					const correctIndex = getRandomInt(5);
					if (!gameIsComplete) {
						this.setState({
							currentIndex: currentIndex + 1,
							correctIndex,
							correctOneHasBeenFound: false,
							choices: getChoices(people, currentIndex + 1, correctIndex)
								.map(person => Map({
									person,
									clicked: false
								})),
							turnStartTime: new Date(),
							times: times.push(thisTime),
							tries: this.state.tries.push(0),
							totals: this.state.totals.merge({
								total_time: totals.get('total_time') + thisTime,
							}),
							turnTimer: settings.timed_mode ? 10000 : 0
						});
					} else {
						clearInterval(this.gameTimerInterval);
						this.gameTimerInterval = null;
						this.setState({
							currentIndex: currentIndex + 1,
							times: times.push(thisTime),
							tries: this.state.tries.push(0),
							totals: this.state.totals.merge({
								total_time: totals.get('total_time') + thisTime,
							}),
							gameIsComplete
						});
					}
				}, 1200);
			}
		}
	}

	setGameTimerInterval() {
		this.gameTimerInterval = setInterval(() => {
			this.setState({
				gameTimer: Math.floor(((new Date()) - this.state.gameStartTime)),		// milliseconds since game start
			});
		}, 1000);
	}

	setTurnTimerInterval() {
		this.turnTimerInterval = setInterval(() => {
			const elapsed = ((new Date()) - this.state.turnStartTime);
			const newState = {
				turnTimer: this.props.settings.timed_mode
					? 11000 - elapsed	// milliseconds remaining
					: elapsed					// milliseconds since turn start
			};
			const { correctIndex, choices } = this.state;
			if (
				this.props.settings.hint_mode &&
				elapsed > 5000 &&
				Math.floor(elapsed / 1000) % 3 === 0 &&
				choices.size > 1
			) {
				const wrongIndexes = List(choices.keys()).delete(correctIndex);
				const indexToRemove = wrongIndexes.get(getRandomInt(wrongIndexes.size));
				newState.choices = choices.delete(indexToRemove);
				newState.correctIndex = indexToRemove < correctIndex
					? correctIndex - 1
					: correctIndex;
			}
			this.setState(newState);
		}, 1000);
	}
}

MatchPhoto.propTypes = {
	settings: T.shape({
		num_turns: T.number.isRequired,
		team_mode: T.bool.isRequired,
		hint_mode: T.bool.isRequired
	}).isRequired,
	people: T.object.isRequired

	// This is here more for reference' sake while coding.
	// Can't use propTypes because it's an immutableJS List.
	//
	// people: T.arrayOf(T.shape({
	// 	firstName: T.string.isRequired,
	// 	lastName: T.string.isRequired,
	// 	id: T.string.isRequired,
	// 	jobTitle: T.string.isRequired,
	// 	slug: T.string.isRequired,
	// 	type: T.string.isRequired,
	// 	headshot: T.shape({
	// 		id: T.string.isRequired,
	// 		alt: T.string.isRequired,
	// 		height: T.number.isRequired,
	// 		width: T.number.isRequired,
	// 		mimeType: T.string.isRequired,
	// 		type: T.string.isRequired,
	// 		url: T.string.isRequired,
	// 	}),
	// 	// socialLinks is required, but empty in many cases
	// 	socialLinks: T.arrayOf(T.shape({
	// 		type: T.string.isRequired,
	// 		url: T.string.isRequired,
	// 		callToAction: T.string.isRequired
	// 	})).isRequired
	// })).isRequired
};

export default MatchPhoto;
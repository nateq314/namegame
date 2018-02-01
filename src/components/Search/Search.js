import React from 'react';
import { PropTypes as T } from 'prop-types';
import defaultImage from '../MatchPhoto/noimgavailable.png';
import arrowUp from './arrow-up.svg';
import arrowDown from './arrow-down.svg';
import google from './google-plus-square.svg';
import linkedin from './linkedin.svg';

import './Search.css';

const fullName = (person) => person.firstName + ' ' + person.lastName;

class Search extends React.Component {

	constructor(props) {
		super(props);
		this.searchInputOnChange = this.searchInputOnChange.bind(this);
		this.columnHeaderOnClick = this.columnHeaderOnClick.bind(this);
		this.personOnClick = this.personOnClick.bind(this);
		this.closeDetailsOnClick = this.closeDetailsOnClick.bind(this);

		this.state = {
			searchResults: props.people,
			searchResultsNumCurrentEmployees: props.people.filter(person => person.jobTitle).size,
			searchText: '',
			sortCol: null,
			sortDir: 'ASC',
			showDetailsForIndex: null,
			showTheDetails: false,
			detailsOverlayOpacity: 0,
		};
	}

	searchInputOnChange(e) {
		const searchText = e.currentTarget.value;
		console.log('searchText:', searchText);
		this.setState({ searchText });

		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(() => {
			this.debounceTimer = null;
			const newSearchResults = this.props.people
			.filter(person => {
				const regex = RegExp(searchText.replace(/[^A-Za-z0-9- ]/g, '~'), 'i');
				return	regex.test(person.firstName) ||
								regex.test(person.lastName) ||
								regex.test(person.jobTitle || '(ex-employee)');
			})
			.sort((a, b) => {
				const sortMatrix = { ASC: [1, -1], DESC: [-1, 1] };
				const { sortCol, sortDir } = this.state;
				return (a[sortCol] || '').toLowerCase() < (b[sortCol] || '').toLowerCase()
					? sortMatrix[sortDir][1]
					: sortMatrix[sortDir][0];
			});
			this.setState({
				searchResults: newSearchResults,
				// cache this in state so we don't have to recalculate it on every single re-render
				searchResultsNumCurrentEmployees: newSearchResults.filter(person => person.jobTitle).size
			});
		}, 300);
	}

	columnHeaderOnClick(e) {
		console.log('columnHeaderOnClick()');
		const fieldName = e.currentTarget.id.split('-')[1];
		console.log('name:', fieldName);
		const sortDirMatrix = { ASC: 'DESC', DESC: 'ASC' };
		const newSortDir = this.state.sortCol === fieldName ? sortDirMatrix[this.state.sortDir] : 'ASC'
		this.setState({
			searchResults: this.state.searchResults
				.sort((a, b) => {
					const sortMatrix = { ASC: [1, -1], DESC: [-1, 1] };
					return (a[fieldName] || '').toLowerCase() < (b[fieldName] || '').toLowerCase()
						? sortMatrix[newSortDir][1]
						: sortMatrix[newSortDir][0];
				}),
			sortCol: fieldName,
			sortDir: newSortDir
		});
	}

	personOnClick(e) {
		console.log('personOnClick()');
		const showDetailsForIndex = +e.currentTarget.id.split('-')[1];
		this.setState({ showDetailsForIndex });
		setTimeout(() => {
			this.setState({ detailsOverlayOpacity: 0.7 });
			setTimeout(() => {
				this.setState({ showTheDetails: true });
			}, 250);
		}, 0);
	}

	closeDetailsOnClick() {
		this.setState({
			showDetailsForIndex: null,
			showTheDetails: false,
			detailsOverlayOpacity: 0
		});
	}

	render() {
		const { searchResults, searchText, sortCol, sortDir, searchResultsNumCurrentEmployees,
						showDetailsForIndex, detailsOverlayOpacity, showTheDetails
					} = this.state;
		console.log('state:', this.state);
		const detailPerson = showDetailsForIndex !== null ? searchResults.get(showDetailsForIndex) : null;
		return (
			<div id="Search">
				<div id="detailsOverlay" style={{
					display: showDetailsForIndex !== null ? 'block' : 'none',
					backgroundColor: `rgba(0, 0, 0, ${detailsOverlayOpacity})`
				}}>
					{showTheDetails && (
						<div id="details">
							<a id="close" onClick={this.closeDetailsOnClick}>x</a>
							<img src={detailPerson.headshot.url || defaultImage} />
							<div className="name">{fullName(detailPerson)}</div>
							<div className="position">{detailPerson.jobTitle || '(ex-employee)'}</div>
							<div className="socialLinks">
								{detailPerson.socialLinks.map(link => (
									<a className="socialLink" href={link.url}>
										{link.type === 'google' && google}
										{link.type === 'linkedin' && linkedin}
									</a>
								))}
							</div>
						</div>
					)}
				</div>
				<div className="row" id="toprow">
					<div className="col s8 offset-s2">
						{/* <label htmlFor="searchInput">Search</label> */}
						<input
							type="text"
							id="searchInput"
							onChange={this.searchInputOnChange}
							value={searchText}
							className="browser-default"
							placeholder="Search by First Name, Last Name, or Job Title"
							autoFocus={true}
						/>
						<div id="info">
							<span className="numResults"><span className="textLabel">Total Matches:</span><span className="stat">{searchResults.size}</span></span>
							<span className="numResults"><span className="textLabel">Current employees:</span><span className="stat">{searchResultsNumCurrentEmployees}</span></span>
							<span className="numResults"><span className="textLabel">Ex-employees:</span><span className="stat">{searchResults.size - searchResultsNumCurrentEmployees}</span></span>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col s8 offset-s2">
						<table id="peopleList" className="bordered">
							<thead>
								<tr>
									<th></th>
									<th id="th-firstName" onClick={this.columnHeaderOnClick}>
										<a className="columnLabel">First Name</a>
										<span className="sortIndicator">
											{sortCol === 'firstName' && (
												sortDir === 'ASC' ? arrowDown : arrowUp
											)}
										</span>
									</th>
									<th id="th-lastName" onClick={this.columnHeaderOnClick}>
										<a className="columnLabel">Last Name</a>
										<span className="sortIndicator">
											{sortCol === 'lastName' && (
												sortDir === 'ASC' ? arrowDown : arrowUp
											)}
										</span>
									</th>
									<th id="th-jobTitle" onClick={this.columnHeaderOnClick}>
										<a className="columnLabel">Position</a>
										<span className="sortIndicator">
											{sortCol === 'jobTitle' && (
												sortDir === 'ASC' ? arrowDown : arrowUp
											)}
										</span>
									</th>
									<th>Social Links</th>
								</tr>
							</thead>
							<tbody>
								{searchResults.size > 0 ? (
									searchResults.map((person, idx) => (
										<tr key={person.id}>
											<td className="pic">
												<img
													src={person.headshot.url || defaultImage}
													alt={person.headshot.alt || fullName(person)}
													id={`resut-${idx}`}
													onClick={this.personOnClick}
												/>
											</td>
											<td
												className="firstname"
												dangerouslySetInnerHTML={{
														__html: person.firstName
															.replace(
																RegExp(searchText.replace(/[^A-Za-z0-9- ]/g, '~'), 'i'),
																`<span class="searchMatch">$&</span>`
															)}}
											>
											</td>
											<td
												className="lastname"
												dangerouslySetInnerHTML={{
														__html: person.lastName
															.replace(
																RegExp(searchText.replace(/[^A-Za-z0-9- ]/g, '~'), 'i'),
																`<span class="searchMatch">$&</span>`
															)}}
											>
											</td>
											<td
												className="position"
												dangerouslySetInnerHTML={{
														__html: (person.jobTitle || '(ex-employee)')
															.replace(
																RegExp(searchText.replace(/[^A-Za-z0-9- ]/g, '~'), 'i'),
																`<span class="searchMatch">$&</span>`
															)}}
											>
											</td>
											{/* <td className="position">{person.jobTitle || '(ex-employee)'}</td> */}
											<td className="socialLinks">
												{person.socialLinks.map(link => (
													<a className="socialLink" href={link.url}>
														{link.type === 'google' && google}
														{link.type === 'linkedin' && linkedin}
													</a>
												))}
											</td>
										</tr>
									))
								) : (
									<tr id="noMatches">
										<td colSpan={5}>
											<h5>No matching records found</h5>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}
}

Search.propTypes = {
	people: T.object.isRequired
};

export default Search;

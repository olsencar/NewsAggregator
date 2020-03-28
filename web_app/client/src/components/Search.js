import React, { Component } from 'react';
import { FormControl, InputGroup }  from 'react-bootstrap'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            typingTimeout: 0
        }
    }

    handleChange = (e) => {
        const searchText = e.target.value;
        if (this.state.typingTimeout) clearTimeout(this.state.typingTimeout);
        this.state.typingTimeout = setTimeout(() => {
            this.props.search(searchText);
        }, 300);
    }

    render() {
        return (
            <InputGroup>
                <FormControl type="text" className="searchTerm" placeholder="Search..." onChange={e => this.handleChange(e)} />
                <InputGroup.Append>
                    <button type="submit" className="searchButton">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </InputGroup.Append>
            </InputGroup>
        );
    }
}

export default Search;
import React, { Component } from 'react';
import { FormControl, InputGroup }  from 'react-bootstrap'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            typingTimeout: 0,
            searchText: ''
        }

        this.searchForm = React.createRef();
    }

    checkForEnter = (e) => {
        if (e.key === "Enter") {
            this.props.search(this.state.searchText);
        }
    }

    handleChange = (e) => {
        const searchTerm = e.target.value;
        this.setState({
            searchText: e.target.value
        });
        
        if (this.state.typingTimeout) clearTimeout(this.state.typingTimeout);
        this.state.typingTimeout = setTimeout(() => {
            this.props.search(searchTerm);
        }, 300);
        
    }

    formFocus = (e) => {
        console.log("Focusing");
        this.searchForm.current.focus();
    }

    render() {
        return (
            <div>
                <div className="container" style={{ maxWidth: '650px', marginTop: '20px' }}>
                    <div className="row justify-content-start align-items-center search-form" ref={this.searchForm} onFocus={this.formFocus}>
                        <div className="col-sm-auto no-padding">
                            <button type="submit" class="search-button">
                                <svg class="submit-button">
                                    <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#search"></use>
                                </svg>
                            </button>
                        </div>
                        <div className="col-10 no-padding">
                            <input type="search" value={this.state.searchText} placeholder="Search" class="search-input" onChange={this.handleChange} onKeyDown={this.checkForEnter} />
                        </div>  
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" display="none">
                    <symbol id="search" viewBox="0 0 32 32">
                        <path d="M 19.5 3 C 14.26514 3 10 7.2651394 10 12.5 C 10 14.749977 10.810825 16.807458 12.125 18.4375 L 3.28125 27.28125 L 4.71875 28.71875 L 13.5625 19.875 C 15.192542 21.189175 17.250023 22 19.5 22 C 24.73486 22 29 17.73486 29 12.5 C 29 7.2651394 24.73486 3 19.5 3 z M 19.5 5 C 23.65398 5 27 8.3460198 27 12.5 C 27 16.65398 23.65398 20 19.5 20 C 15.34602 20 12 16.65398 12 12.5 C 12 8.3460198 15.34602 5 19.5 5 z" />
                    </symbol>
                </svg>
            </div>
        );
    }
}

export default Search;
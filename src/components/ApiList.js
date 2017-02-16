import React, { Component } from 'react';
import DebounceInput from 'react-debounce-input';
import ApiMethod from './ApiMethod';


class ApiList extends Component {


    constructor(props) {
        super(props);
        this.state = {
            textFilter: ''
        };
    }

    filter(method) {
        return !this.state.textFilter || method.path.toLowerCase().match(this.state.textFilter.toLowerCase());
    }


    orderByTags(a, b) {
        if (a.tags[0] < b.tags[0]) {
            return -1;
        } else if (a.tags[0] > b.tags[0]) {
            return 1;
        } else {
            return 0;
        }
    }

    render() {

        let filter = this.state.textFilter;

        return (
            <div>
                <div>
                    <DebounceInput 
                        debounceTimeout={ 70 } minLength={ 2 } 
                        onChange={ (e) => this.setState({ textFilter: e.target.value}) } 
                        placeholder={ `search in  ${this.props.methods.length} methods...`} />
                </div>
                <div className="methods">{ 
                    this.props.methods.filter(this.filter.bind(this)).map((m) => {
                        return (<ApiMethod method={ m } app={ this.props.app } key={ m.key } />);
                    }) 
                }</div>
            </div>
        );
    }

}


export default ApiList;
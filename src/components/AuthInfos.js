import React, { Component } from 'react';
import classNames from 'classnames';
import AuthInfosJwt from './AuthInfosJwt';

export default class AuthInfos extends Component {


    constructor(props) {
        super(props);
        this.state = {
            token: null,
            deployJwtBox: false
        };
    }

    componentWillMount() {
        this.props.app.setState({ authInfos: this });
    }

    render() {

        return (
            <div className="authinfos">
                <div>
                Bearer : <input value={ this.state.token } onChange={ (e) => this.setState({ token: e.target.value }) } style={ { width: '70%'} }/>
                </div>
                <AuthInfosJwt token={ this.state.token } />
            </div>
        );
    }

}



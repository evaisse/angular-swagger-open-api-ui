import React, { Component } from 'react';
import jwtDecode from "jwt-decode";
import classNames from 'classnames';


export default class AuthInfosJwt extends Component {


    constructor(props) {
        super(props);

        this.state = {
            details: false
        };
    }
    

    render() {

        let jwt;

        try {
            jwt = jwtDecode(this.props.token);
        } catch (e) {
            console.log(e);
        }

        if (!jwt) {
            return (
                <div>Unknow token format</div>
            );
        }

        return (
            <div onClick={ (e) => this.setState({details: !this.state.details}) }>
                <pre>{ this.state.details ? JSON.stringify(jwt, " ", 2) : "JWT => " + JSON.stringify(jwt) }</pre>
            </div>
        );

    }
}
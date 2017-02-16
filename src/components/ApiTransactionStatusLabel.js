import React, { Component } from 'react';
import classNames from "classnames";


export default class ApiTransactionStatusLabel extends Component {

    getColorLabel() {

        if (this.props.response.status > 500) {
            return "danger";
        } else if (this.props.response.status > 400) {
            return "warning";
        } else if (this.props.response.status > 300) {
            return "info";
        } else {
            return "success";
        }
    }

    render() {

        let res = this.props.response;

        return (
            <span className={ "label label-" + this.getColorLabel() } title={ res.statusText }>{ res.status }</span>
        );
    }

}




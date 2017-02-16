import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import classNames from "classnames";
import ApiTransactionStatusLabel from "./ApiTransactionStatusLabel";
import ApiTransactionCurlCommand from "./ApiTransactionCurlCommand";


export default class ApiTransactionReport extends Component {


    constructor(props) {

        super(props);
        
        this.state = {
            responseBody: null
        };

        this.props.response.clone().json().then((responseBody) => {
            console.log(responseBody);
            this.setState({responseBody});
        });

    }


    render() {

        let { request, error, response } = this.props;

        return (
            <Tabs
                className={ classNames("request-result", { success: !error }) }
                onSelect={ this.handleSelect }
                selectedIndex={ 1 }
                >
                <TabList>
                    <Tab>Request</Tab>
                    <Tab>
                        <ApiTransactionStatusLabel response={ response } />
                        <span>Response</span>
                    </Tab>
                    <Tab className={ error ? "" : "hidden" }>Error</Tab>
                    <Tab>cURL</Tab>
                </TabList>
                <TabPanel>
                    <pre>{ request.uri }</pre>
                    <pre>{ request.body ? JSON.stringify(request.data, " ", 2) : '' }</pre>
                </TabPanel>
                <TabPanel>
                    <pre>{ JSON.stringify(this.state.responseBody, " ", 2) }</pre>
                    <div>
                        { response.headers.get('X-Debug-Link') ? response.headers.get('X-Debug-Link') : '' }
                    </div>
                </TabPanel>
                <TabPanel className={ error ? "" : "hidden" }>
                    <pre>{ JSON.stringify(error) }</pre>
                </TabPanel>
                <TabPanel>
                    { 
                        // <ApiTransactionCurlReplay xhr={ xhr } /> 
                    }
                </TabPanel>
            </Tabs>
        );
    }

}



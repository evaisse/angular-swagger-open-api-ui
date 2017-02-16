import React, { Component } from 'react';
import Form from "react-jsonschema-form";
import request from 'xhr-request';
import classNames from "classnames";
import ApiTransactionReport from './ApiTransactionReport';
import jwtDecode from "jwt-decode";


class ApiMethod extends Component {


    constructor(props) {

        super(props);

        this.state = { 
            method: props.method,
            deployed: false,
            response: null,
            error: null,
            xhr: null,
            isRunning: false,
            formData: {}
        };
    }

    handleSchemaFormChange() {

    }

    handleSchemaFormSubmit(apiMethod, form) {
        
        var api = this.props.app.state.api;
        var uri = `${api.schemes[0]}://${api.host}${api.basePath}${apiMethod.path}`;
        var options = {
            dataType: 'json',
            responseType: 'json',
            cache: false,
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${this.props.app.state.authInfos.state.token}`,
            }
        };
        var r;

        this.setState({
            formData: form.formData
        });

        this.sendFetchRequest({
            apiMethod: apiMethod, 
            uri: uri, 
            form: form, 
            options: {
                dataType: 'json',
                responseType: 'json',
                cache: false,
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${this.props.app.state.authInfos.state.token}`,
                }
            }
        });

        // qwest[apiMethod.verb](uri, form.formData, options)
        // .then((xhr, response) => {
        //     r = xhr;
        //     xhr.request = { uri, data: form.formData, options };
        //     this.setState({ error: false, xhr, response });
        // })
        // .catch((error, xhr, response) => {
        //     r = xhr;
        //     xhr.request = { uri, data: form.formData, options };
        //     this.setState({ error, xhr, response });
        // })
        // .complete(() => {
        //     this.setState({ isRunning: false });
        //     try {
        //         if (headerAuth.match(/^Bearer\s+(.*)$/)[1] == this.props.app.state.authInfos.state.token) {
        //             var token = r.getResponseHeader('Authorization').match(/^Bearer\s+(.*)$/)[1];
        //             this.props.app.state.authInfos.setState({ token });
        //         }
        //     } catch (e) {

        //     }
        // });
    }


    sendFetchRequest({ apiMethod, uri, form, options }) {

        var fetchEvent;
        let data = {...form.formData};
        let headers = new Headers(Object.assign({}, {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.props.app.state.authInfos.state.token}`
        }));
        let fetchInit = {
            method: apiMethod.verb.toUpperCase(),
            headers: headers,
            mode: 'cors',
            cache: 'default' 
        };


        let pathParams = uri.match(/\{\w+\}/ig) || [];
        
        pathParams.forEach((m) => {
            let k = m.match(/\{(\w+)\}/)[1];
            uri = uri.replace(m, data[m.match(/\{(\w+)\}/)[1]]);
            delete data[m];
        });

        debugger;

        if (fetchInit.method.match(/GET|HEAD/)) {
            uri += "?" + JSON.stringify(data);
        } else {
            fetchInit.body = JSON.stringify(data);
        }

        fetchEvent = {
            isRunning: true,
            error: null,
            request: {
                uri, 
                headers,
                body: fetchInit.body,
                data: data
            },
            response: null
        };

        this.setState({...fetchEvent});

        fetchEvent = fetch(uri, fetchInit).then((res) => {
            this.setState({ ...fetchEvent, response: res, isRunning: false });
            this.handleAuthorizationUpdate(res);
        }).catch((error) => {
            this.setState({ ...fetchEvent, error: error, isRunning: false });
        });

        console.log(fetchEvent);
    }

    handleSchemaFormErrors() {

    }


    handleAuthorizationUpdate(response) {
        let headerAuth = response.headers.get('authorization') || '';

        console.log(headerAuth, headerAuth.match(/^Bearer\s+(.*)$/)[1] == this.props.app.state.authInfos.state.token);

        if (headerAuth.match(/^Bearer\s+(.*)$/)[1] != this.props.app.state.authInfos.state.token) {
            var token = headerAuth.match(/^Bearer\s+(.*)$/)[1];
            this.props.app.state.authInfos.setState({ token });
        }
    }

    render() {
        var m = this.state.method;
        return (
            <div className="api method panel panel-default" key={ m.key }>
                <div className="panel-heading" 
                     onClick={ (e) => { this.setState({ deployed: !this.state.deployed }); }}>
                    <span className="label label-default">{ m.verb.toUpperCase() }</span> { m.path }
                </div>
                { this.renderDetails() }
            </div>
        );
    }

    renderDetails() {

        const m = this.props.method;

        if (!this.state.deployed) {
            return;
        }

        
        return (
            <div className="panel-body">
                { this.renderDescription() }
                { this.renderSchemaForm() }
                { this.renderRequestResult() }
            </div>
        );
    }


    renderDescription() {
        const m = this.props.method;
        return (
            <div>{ m.description }</div>
        );
    }

    renderSchemaForm() {

        const m = this.props.method;
        const formData = this.state.formData;

        var schema;
        var additionnalParams = {};

        m.parameters.forEach(function (param) {
            if (param.in == "body" && param.schema) {
                schema = param.schema;
            } else {
                additionnalParams[param.name] = param;
            }
        });

        if (!schema) {
            return;
        }

        var properties = schema.properties;

        if (schema.$ref) {
            schema = this.props.app.state.api.definitions[schema.$ref.match(/#\/definitions\/(.*)/)[1]];
        }

        schema.properties = {...additionnalParams, ...schema.properties};
        schema.definitions = this.props.app.state.api.definitions;

        if (   this.props.app.state.authInfos.state.token 
            && !formData.userHash
        ) {
            try {
                formData.userHash = jwtDecode(this.props.app.state.authInfos.state.token)['userHash'];
            } catch (e) {
                console.warn(e);
            }
        }
        
        return (
            <div>
                <Form schema={ schema }
                      formData={ formData }
                      onChange={ this.handleSchemaFormChange.bind(this) }
                      onSubmit={ (e) => this.handleSchemaFormSubmit(m, e) }
                      onError={ this.handleSchemaFormErrors.bind(this) }>

                      <button className="btn btn-primary" type="submit" disabled={ this.state.isRunning }>Submit</button>
                      &nbsp;
                      <button className="btn btn-danger" type="button" >Cancel</button>
                </Form>
            </div>
        )
    }

    renderRequestResult() {

        if (this.state.isRunning) {
            return (
                <div className="result">
                    <hr />
                    <div className="loading"></div>
                </div>
            );
        }

        if (!this.state.response) {
            return;
        }

        return (
            <div className="result">
                <hr />
                <ApiTransactionReport app={ this.state.app } request={ this.state.request } error={ this.state.error } response={ this.state.response } />
            </div>
        )
    }
}

export default ApiMethod;
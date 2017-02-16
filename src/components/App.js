import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import DebounceInput from 'react-debounce-input';
import classNames from 'classnames';  
import SwaggerParser from '../lib/SwaggerParser';
// import ApiMethod from './ApiMethod';
import AuthInfos from './AuthInfos';
import ApiList  from './ApiList';
import debounce from 'debounce';


class App extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            apiDefUrl: null,
            apiDefUrlCheck: true,
            api: null,
            isLoadingApi: false,
            methods: [],
            filterText: '',
        };

        this.onChangeToken = this.onChangeToken.bind(this);
    }

    componentDidMount() { 
        if (this.state.apiDefUrl) {
            this.reloadApi();
        }
    }

    checkNewSwaggerUrl(apiDefUrl) {

        this.setState({ apiDefUrlOk: true, apiDefUrl });

        if (!this.apiDefUrlCheck) {
            this.apiDefUrlCheck = fetch(apiDefUrl)
                .then((response) => response.json())
                .then((newApi) => SwaggerParser.parse(newApi))
                .then((newApiDef) => this.setState({ newApiDef, newApiDefUrl: apiDefUrl }))
                .catch(() => { this.apiDefUrl = null });
        } else {
            this.pendingFetch = apiDefUrl;
        }

    }

    reloadApi() {

        let api = null;

        try {
            api = SwaggerParser.parse(JSON.parse(localStorage.getItem(this.state.apiDefUrl)));
        } catch (e) {
            console.error(e, e.stack);
        }

        if (api) {
            this.setApi(api);
        }

        fetch(this.state.apiDefUrl).then((response) => response.json()).then((newApi) => {

            if (this.state.api && JSON.stringify(this.state.api) === JSON.stringify(newApi)) {
                return; // no changes, don't reload
            }

            newApi = SwaggerParser.parse(newApi);

            localStorage.setItem(this.state.apiDefUrl, JSON.stringify(newApi));
            
            this.setApi(newApi);

        }).catch((error) => {
            console.error(error);
        });



    }

    setApi(api) {
        this.setState({
            api: api,
            methods: api && api.methods ? api.methods : []
        });
        if (this.state.methods.length) {
            this.filterApis(this.state.filterText);
        }
    }

    onChangeToken(e) {
        this.setState({jwtOrToken: e.target.value})
    }

    filterApis(filter) {
        this.setState({
            filterText: filter,
        });
    }

    getVisibleMethods() {
        
        if (!this.state.api) return [];
        
        var filter = this.state.filterText;
        
        if (!filter) return this.state.api.methods;
        
        return this.state.api.methods.filter(function (m) {
            return m.path.toLowerCase().match(filter.toLowerCase());
        });

    }

    render() {

        const s = this.state;

        return (
            <div className="app container">
                <div className="app-header">
                    
                    <h2>Open API UI</h2>

                    <form className="form-inline" onSubmit={ (e) => e.preventDefault() }>
                        <div className="row">
                            <div className="form-group col-xs-6">
                                <DebounceInput debounceTimeout={ 70 } 
                                               minLength={ 2 } 
                                               value={ s.apiDefUrl } 
                                               style={ { width: "100%" } }
                                               className="form-control"
                                               onChange={ debounce((e) => this.checkNewSwaggerUrl(e.target.value), 120) }
                                               placeholder={ `Swagger API URL`} />
                            </div>
                            <div className="col-xs-4">
                                <button type="submit" className="btn btn-primary" onClick={ this.reloadApi.bind(this) }>reload</button>
                                <div className={ classNames("loading", { hidden: !s.isLoadingApi }) }></div>
                            </div>
                        </div>
                    </form>
                </div>
                <hr />
                <AuthInfos app={ this } />
                <hr />
                <ApiList app={ this } methods={ this.state.api ? this.state.api.methods : [] } />
                
            </div>
        );
    }

}


export default App;
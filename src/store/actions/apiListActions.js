import request from 'xhr-request';
import { fetch } from 'isomorphic-fetch';
import SwaggerParser from '../../lib/SwaggerParser';

/**
 * Fetch JSON API
 * @param  {String} apiDef [description]
 * @return {Promise}
 */
const fetchApi = (apiDefUri) => {
    return fetch(apiDefUri)
        .then((response) => response.json())
        .catch((error) => {
            console.error(error);
        });
}


export default {


    CHANGE_API_URL(state, {value}) {
        
        return {...state, apiDefUrl: value};
    },


    API_LOADED(state, action) {

        return {...state, api: action.api};
    },


    FETCH_API(state, action) {

        return (dispatch, getState) => {
            /**
             * Load API swagger
             */
            fetchApi(state.apiDefUrl).then((newApi) => {

                if (state.api && JSON.stringify(state.api) === JSON.stringify(newApi)) {
                    return; // no changes, don't reload
                }

                newApi = SwaggerParser.parse(newApi);
                localStorage.setItem(state.apiDefUrl, JSON.stringify(newApi));
                dispatch({type: "API_LOADED", api: newApi});
            });
        };

    },


    INIT_API(state, filter) {

        return (dispatch, getState) => {

            let state = getState();
            let api = null;

            if (!state.apiDefUrl) {
                try {
                    let api = SwaggerParser.parse(JSON.parse(localStorage.getItem(state.apiDefUrl)));
                } catch (e) {
                    console.error(e);
                }
            }

            console.log(api);

            return {...state, api: api, isLoading: true };
        };

    },

};
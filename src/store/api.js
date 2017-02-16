import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { fetch } from 'isomorphic-fetch';
import SwaggerParser from '../lib/SwaggerParser';
import appActions from './actions/appActions';
import apiListActions from './actions/apiListActions';
import apiMethodActions from './actions/apiMethodActions';

const initialState = {
    apiDefUrl: "",
    api: null,
    methods: [],
    isLoading: false
};


const actions = { 
    ...appActions, 
    ...apiListActions, 
    ...apiMethodActions,
};

/*
    applyMiddleware(({dispatch, getState}) => {
        return function (next) {
            return (action) => {
                var r = reducer(getState(), action);
                if (typeof r === "function") {
                    return r(dispatch, getState);
                } else {
                    return next(action);
                }
            };
        };
    })
 */



const store = createStore((state, action) => {
    
    if (actions[action.type]) {
        actions[action.type](state, action, store);
    } else {
        console.error('Invalid store action', action);
    }

    return state;

}, initialState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


export default store;
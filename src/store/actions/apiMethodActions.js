


export default {

    TOOGLE_METHOD(state, action) {

        state.api.methods.find((m) => {
            return m.key === action.method.key;
        }).deployed = !action.method.key;

        return state;

    }
    
}
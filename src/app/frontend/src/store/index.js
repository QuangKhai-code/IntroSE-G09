import {configureStore} from '@reduxjs/toolkit';
import { authReducer } from './auth/auth-slice';
import { rulesReducer } from './rules/rules-slice';

const store = configureStore({
    reducer: {
        authSlice: authReducer,
        rulesSlice: rulesReducer,
    }
});

export {store};
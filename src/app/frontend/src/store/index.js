import {configureStore} from '@reduxjs/toolkit';
import { authReducer } from './auth/auth-slice';

const store = configureStore({
    reducer: {
        authSlice: authReducer,
    }
});

export {store};
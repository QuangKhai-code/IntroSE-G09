import {configureStore} from '@reduxjs/toolkit';
import { authReducer } from './auth/auth-slice';
import { rulesReducer } from './rules/rules-slice';
import { teamReducer } from './team/team-slice';

const store = configureStore({
    reducer: {
        authSlice: authReducer,
        rulesSlice: rulesReducer,
        teamSlice: teamReducer,
    }
});

export {store};
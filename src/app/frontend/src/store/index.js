import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import { authReducer } from './auth/auth-slice';
import { rulesReducer } from './rules/rules-slice';
import { teamReducer } from './team/team-slice';
import teamUpdateReducer from './team/teamUpdate-slice';
import teamListReducer from './team/teamList-slice';

// Configure persist for auth and team slices
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['auth'] // only persist auth state
};

const teamPersistConfig = {
  key: 'team',
  storage,
  whitelist: ['teamName', 'homeStadium', 'players']
};

const rootReducer = combineReducers({
  authSlice: persistReducer(authPersistConfig, authReducer),
  rulesSlice: rulesReducer,
  teamSlice: persistReducer(teamPersistConfig, teamReducer),
  teamUpdateSlice: teamUpdateReducer,
  teamListSlice: teamListReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializability check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
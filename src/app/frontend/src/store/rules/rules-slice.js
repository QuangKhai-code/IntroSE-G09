import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { rulesApi } from "../../api/rules";

const initialState = {
  rules: {},
  loading: false,
  error: null
};

export const fetchRules = createAsyncThunk(
  "rules/fetchRules",
  async (_, { rejectWithValue }) => {
    try {
      return await rulesApi.getRules();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveRules = createAsyncThunk(
  "rules/saveRules",
  async (rules, { rejectWithValue }) => {
    try {
      const response = await rulesApi.updateRules(rules);
      // After successful save, fetch fresh rules
      const freshRules = await rulesApi.getRules();
      return freshRules;
    } catch (err) {
      // Check if error has non_field_errors
      if (err.response?.data?.non_field_errors) {
        return rejectWithValue(err.response.data.non_field_errors[0]);
      }
      return rejectWithValue("Cập nhật thất bại");
    }
  }
);

export const rulesSlice = createSlice({
  name: "rulesSlice",
  initialState,
  reducers: {
    updateRulesLocally: (state, action) => {
      state.rules = { ...state.rules, ...action.payload };
    },
    setRules: (state, action) => {
      state.rules = { ...action.payload };
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRules.fulfilled, (state, action) => {
        state.rules = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveRules.fulfilled, (state, action) => {
        state.rules = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(saveRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setRules, setLoading, setError, updateRulesLocally } = rulesSlice.actions;
export const rulesReducer = rulesSlice.reducer;

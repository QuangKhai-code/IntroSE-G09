import { createSlice } from "@reduxjs/toolkit";

export const rulesSlice = createSlice({
  name: "rulesSlice",
  initialState: {
    rules: {
        maxPlayer: null,
        minPlayer: null,
        maxAge: null,
        minAge: null,
        win_score: null,
        lose_score: null,
        draw_score: null,
        goal_type_count: null,
        max_goal_time: null,
        max_foreign_player: null,
    }
  },

  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = isNaN(value) ? value : Number(value);
    },
  },
});

export const { updateField } = rulesSlice.actions;
export const rulesReducer = rulesSlice.reducer;

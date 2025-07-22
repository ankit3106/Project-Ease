import { createSlice } from "@reduxjs/toolkit";

export const loadersSlice = createSlice({
    name: "loaders",
    initialState: {
        loading: false,
        buttonLoading: false,
    },
    reducers: {
        SetLoading: (state, action) => {
            state.loading = action.payload;
        },
        SetButtonLoading: (state, action) => {
            state.buttonLoading = action.payload;
        },
    },
});

export const { SetLoading, SetButtonLoading } = loadersSlice.actions;

export default loadersSlice.reducer;

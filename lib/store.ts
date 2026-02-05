"use client";

import { configureStore } from "@reduxjs/toolkit";
import { loadingBarReducer, loadingBarMiddleware } from "react-redux-loading-bar";

export const store = configureStore({
  reducer: {
    loadingBar: loadingBarReducer,
  },
  middleware: (getDefault) => getDefault().concat(loadingBarMiddleware()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

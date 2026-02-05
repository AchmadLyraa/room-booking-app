"use client";

import React from "react";
import { Provider } from "react-redux";
import LoadingBar, { resetLoading } from "react-redux-loading-bar";
import { store } from "@/lib/store";
import RouteChangeListener from "@/components/route-listener";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Reset any stuck loading state on mount
    store.dispatch(resetLoading());
  }, []);

  return (
    <Provider store={store}>
      {/* Loading bar positioned at the top */}
      <LoadingBar
        style={{
          backgroundColor: "#06b6d4",
          height: "3px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
        updateTime={50}
        maxProgress={95}
        progressIncrease={10}
        showFastActions
      />
      <RouteChangeListener />
      {children}
    </Provider>
  );
}

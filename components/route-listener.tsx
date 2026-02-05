"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, resetLoading } from "react-redux-loading-bar";

export default function RouteChangeListener() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  // @ts-ignore - loadingBar state shape is provided by reducer
  const loading = useSelector((s: any) => s.loadingBar);

  // Hide loading on any route change
  useEffect(() => {
    dispatch(hideLoading());
  }, [pathname, dispatch]);

  // Fallback: reset if loading sticks around for too long
  useEffect(() => {
    if (loading && loading > 0) {
      const t = setTimeout(() => dispatch(resetLoading()), 3000);
      return () => clearTimeout(t);
    }
  }, [loading, dispatch]);

  return null;
}

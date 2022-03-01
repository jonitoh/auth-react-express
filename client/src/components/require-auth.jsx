import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useStoreFromSelector } from "store";

// Selector for extracting global state
const useStoreSelector = (state) => ({
  hasRight: state.hasRight,
  isValidUser: state.isValidUser,
});

export default function RequireAuth({ user, allowedRoles }) {
  const { hasRight, isValidUser } = useStoreFromSelector(useStoreSelector);
  const location = useLocation();
  return hasRight(user?.roleName, allowedRoles) ? (
    <Outlet />
  ) : isValidUser(user) ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/sign-in" state={{ from: location }} replace />
  );
}

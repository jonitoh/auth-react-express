import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useStore } from "store";

export default function RequireAuth({ allowedRoles }) {
  const { user, hasRight } = useStore();
  const location = useLocation();
  return hasRight(user?.roleName, allowedRoles) ? (
    <Outlet />
  ) : user ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/sign-in" state={{ from: location }} replace />
  );
}

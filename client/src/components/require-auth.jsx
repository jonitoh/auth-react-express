import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useStore } from "store";

export default function RequireAuth({ user, allowedRoles }) {
  const { hasRight, isValidUser } = useStore();
  const location = useLocation();
  console.log("curr user", user);
  console.log("curr right", hasRight(user?.roleName, allowedRoles));
  console.log("user valid ?", isValidUser(user));
  return hasRight(user?.roleName, allowedRoles) ? (
    <Outlet />
  ) : isValidUser(user) ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/sign-in" state={{ from: location }} replace />
  );
}

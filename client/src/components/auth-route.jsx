import React from "react";
import { Navigate, Route } from "react-router-dom";
import { useStore } from "store";

export default function AuthRoute({
  component: Component,
  allowedRoles,
  ...rest
}) {
  const { user, hasRight } = useStore();
  return (
    <Route
      {...rest}
      render={(props) =>
        hasRight(user?.roleName, allowedRoles) ? (
          <Component {...props} />
        ) : user ? (
          <Navigate
            to="/unauthorized"
            state={{ from: props.location }}
            replace
          />
        ) : (
          <Navigate to="/sign-in" state={{ from: props.location }} replace />
        )
      }
    />
  );
}

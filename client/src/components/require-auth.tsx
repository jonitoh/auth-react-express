import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import store, { GlobalState as State } from '../store';

type Props = {
  user: undefined | null | { roleName: string };
  allowedRoles?: unknown;
};

// Selector for extracting global state
const userSelector = (state: State) => ({
  hasRight: state.hasRight,
  isValidUser: state.isValidUser,
});

function RequireAuth({ user, allowedRoles }: Props) {
  const { hasRight, isValidUser } = store.fromSelector(userSelector);
  const location = useLocation();
  if (hasRight(user?.roleName || '', allowedRoles)) {
    return <Outlet />;
  }
  if (isValidUser(user)) {
    <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  return <Navigate to="/sign-in" state={{ from: location }} replace />;
}

RequireAuth.defaultProps = {
  allowedRoles: undefined,
};

export default RequireAuth;

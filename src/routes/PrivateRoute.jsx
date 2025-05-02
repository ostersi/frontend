import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null; // розшифровка payload JWT

  if (!token || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;

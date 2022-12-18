import { createContext, useReducer } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { initialState, reducer } from "./store/reducer";
import PrivateRoutes from "./utils/PrivateRoute";

import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import "./index.css";

export const AuthContext = createContext();

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      <Router>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route element={<Dashboard />} path="/dashboard" />
            <Route element={<></>} path="/" exact />
          </Route>
          <Route element={<Login />} path="/login" />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;

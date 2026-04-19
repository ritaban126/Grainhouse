import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { authAPI, imageAPI } from "../api/services";

//  State shape 
const initialState = {
  user:        null,
  accessToken: localStorage.getItem("accessToken") || null,
  loading:     true,   // true on first mount while we check /auth/me
  error:       null,
};

//  Reducer 
const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, loading: false, error: null };
    case "SET_TOKEN":
      return { ...state, accessToken: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "LOGOUT":
      return { ...initialState, loading: false, accessToken: null };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

// Context 
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: fetch current user if token exists
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        dispatch({ type: "SET_USER", payload: data.user });
      } catch {
        localStorage.removeItem("accessToken");
        dispatch({ type: "LOGOUT" });
      }
    };
    bootstrap();
  }, []);

//   Actions 
  const login = useCallback(async (email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem("accessToken", data.accessToken);
      dispatch({ type: "SET_TOKEN",  payload: data.accessToken });
      dispatch({ type: "SET_USER",   payload: data.user });
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      dispatch({ type: "SET_ERROR", payload: msg });
      throw new Error(msg);
    }
  }, []);


const register = useCallback(async (name, email, password) => {
  dispatch({ type: "SET_LOADING", payload: true });

  try {
    const res = await authAPI.register({ name, email, password });

    console.log("Axios response:", res);

    dispatch({ type: "SET_LOADING", payload: false });
    return res; // This returns the full Axios response object
  } catch (err) {
    // Extract the message from the backend response
    const msg = err.response?.data?.message || "Registration failed.";
    
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_ERROR", payload: msg });
    
    //  Rethrow the error so handleSubmit's catch block runs
    throw err; 
  }
}, []);


  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    localStorage.removeItem("accessToken");
    dispatch({ type: "LOGOUT" });
  }, []);



  const updateUser = useCallback((updates) => {
    dispatch({ type: "UPDATE_USER", payload: updates });
  }, []);

  const value = {
    user:        state.user,
    accessToken: state.accessToken,
    loading:     state.loading,
    error:       state.error,
    isAuth:      !!state.user,
    isAdmin:     state.user?.role === "admin",
    isContributor: ["contributor","admin"].includes(state.user?.role),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

export const authContext = createContext(null);

export function useAuth() {
  return useContext(authContext);
}

const DUMMY_USER = {
  email: "test@togather.com",
  password: "test1234",
  name: "홍길동",
  community: "청년부",
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  async function login({ email, password }) {
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      const user = { email: DUMMY_USER.email, name: DUMMY_USER.name, community: DUMMY_USER.community };
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
      return;
    }
    const res = await axios.post("/auth/login", { email, password });
    setCurrentUser(res.data.data);
    localStorage.setItem("token", res.data.token);
    navigate("/");
  }

  async function register(user) {
    const res = await axios.post("/auth/register", user);
    setCurrentUser(res.data.data);
    localStorage.setItem("token", res.data.token);
    navigate("/");
  }

  function logout() {
    setCurrentUser(null);
    localStorage.clear();
    navigate("/");
  }

  return (
    <authContext.Provider value={{ currentUser, setCurrentUser, login, logout, register }}>
      {children}
    </authContext.Provider>
  );
}
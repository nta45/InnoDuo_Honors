import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import Navbar from "./components/Navbar";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Students from "./components/Students";
import PageNotFound from "./components/PageNotFound";
import StudentProfile from "./components/StudentProfile";
import { ThemeProvider } from "./context/theme";
import { React, useState, useEffect } from "react";
import { AuthProvider } from "./context/authContext";
import { ToastContainer, toast } from "react-toastify";
import SampleTable from "./components/SampleTable";

function App() {
  const [defaultTheme, setDefaultTheme] = useState("light");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const login = (user) => {
    setLoggedIn(true);
    setUser(user);
    localStorage.setItem("authToken", "30m2133"+user.authToken);
  };

  const logout = () => {
    setLoggedIn(false);
    setUser(null);
    localStorage.removeItem("authToken");
  };

  const darkTheme = () => {
    setDefaultTheme("dark");
  };
  const lightTheme = () => {
    setDefaultTheme("light");
  };

  useEffect(() => {
    document.querySelector("html").classList.remove("dark", "light");
    document.querySelector("html").classList.add(defaultTheme);
  }, [defaultTheme]);

  // useEffect(() => {
  //   // toast.info("Welcome to the Page!");
  // }, [loggedIn]);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <ThemeProvider value={{ defaultTheme, darkTheme, lightTheme }}>
      <AuthProvider value={{ loggedIn, user, login, logout }}>
        <Router>
          <Navbar />

          {/* Adding Routes here  */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/students" element={<Students />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/sampleTable" element={<SampleTable />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          {/* <HomePage /> */}
          <ToastContainer />
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export const homeThemeStyle = {
  backgroundColor: "#272727",
  color: "#f1f1f1",
};

export default App;

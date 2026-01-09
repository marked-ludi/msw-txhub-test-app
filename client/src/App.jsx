import { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
  Link,
} from "react-router-dom";

// AXIOS BASE URL AND INTERCEPTOR SETUP
const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    margin: 0,
  },
  header: {
    backgroundColor: "#303030",
    color: "white",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  main: {
    flex: "1",
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    width: "100%",
    alignItems: "center",
  },
  mainLogin: {
    flex: "1",
    padding: "2rem",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",    
  },
  footer: {
    backgroundColor: "#fff",
    padding: "1rem",
    textAlign: "center",
    fontSize: "0.8rem",
    color: "#666",
  },
  card: {
    border: "1px solid #ddd",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  input: {
    padding: "10px",
    marginRight: "10px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "200px",
  },

  list: { listStyleType: "none", padding: 0 },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    borderBottom: "1px solid #eee",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

const Layout = ({ children, isAuth, logout }) => {
  return (
    <div style={styles.container}>
      {isAuth && (
        <header style={styles.header}>
          <div className="sidebar-brand">
            <img
              src="src/assets/msw-logo-v3.png"
              alt="logo"
              className="sidebar-logo"
            />
            <h2>Transactions Hub</h2>
          </div>
          <nav>
            <span onClick={logout} style={styles.navLink}>
              Logout
            </span>
          </nav>
        </header>
      )}

      <main style={styles.main}>{children}</main>

      <footer style={styles.footer}>&copy; 2026. MegaSportsWorld.</footer>
    </div>
  );
};

function Auth({ setIsAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/login" : "/register";
    try {
      const { data } = await api.post(endpoint, { username, password });
      if (isLogin) {
        localStorage.setItem("token", data.token);
        setIsAuth(true);
        navigate("/dashboard");
      } else {
        alert("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert("Error: " + (err.response?.data || err.message));
    }
  };

  return (
     <main style={styles.mainLogin}>
     <div style={{ ...styles.card, width: "100%", maxWidth: "400px" }}>
      <div className="logo-container">
        <img
          src="src/assets/msw-logo-v4.png"
          alt="logo"
          className="login-logo"
        />

        <h2>Transactions Hub</h2>
      </div>
      <p style={{ margin: "30px 0" }}>
        {isLogin
          ? "Enter your credentials to login"
          : "Enter your details to sign up"}
      </p>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div>
          <input
            style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            style={{ ...styles.input, width: "100%", boxSizing: "border-box" }}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
               <div
            className="button-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
 
              <div style={{ textAlign: "center" }}>
        <Link
          onClick={() => setIsLogin(!isLogin)}
          style={{
            color: "#f59e0b",
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </Link>
      </div>
             <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="primary-button"
            style={{ marginTop: "10px" }}
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </div>
      </div>
      </form>

    </div>
    </main>
  );
}
function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    await api.post("/tasks", { description: newTask });
    setNewTask("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div>
      <div style={{ ...styles.card, marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Add Transaction</h3>
        <div style={{ display: "flex" }}>
          <input
            style={{ ...styles.input, flex: 1, marginBottom: 0 }}
            value={newTask}
            placeholder="Enter transaction description"
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button onClick={addTask} className="primary-button">
            Add
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>All Transactions ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <p style={{ color: "#999" }}>No tasks found.</p>
        ) : (
          <ul style={styles.list}>
            {tasks.map((t) => (
              <li key={t.id} style={styles.listItem}>
                <span>{t.description}</span>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="primary-button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <Layout isAuth={isAuth} logout={logout}>
        <Routes>
          <Route
            path="/"
            element={
              !isAuth ? (
                <Auth setIsAuth={setIsAuth} />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/dashboard"
            element={isAuth ? <Dashboard /> : <Navigate to="/" />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

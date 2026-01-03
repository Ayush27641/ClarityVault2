import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import FileUpload from "./pages/FileUpload.jsx";
import { ThemeProvider } from "./components/theme-provider";
// import LandingPage from "./pages/SimpleLandingPage.jsx";
// import LandingPage from "./pages/LandingPage.jsx"; // Original - has CSS module issues
import { auth } from "./lib/utils";
import LandingPage from "./pages/LandingPage.jsx";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                We're sorry for the inconvenience. Please try refreshing the
                page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = auth.isAuthenticated();
  const token = auth.getToken();

  // Debug authentication status
  console.log("🔐 ProtectedRoute Check:", {
    isAuthenticated,
    hasToken: !!token,
    token: token ? `${token.substring(0, 20)}...` : "No token",
    userData: auth.getUserData(),
  });

  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = auth.isAuthenticated();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#333",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  padding: "16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                },
                success: {
                  duration: 3000,
                  style: {
                    border: "1px solid #10b981",
                    background: "#f0fdf4",
                    color: "#065f46",
                  },
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#ffffff",
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    border: "1px solid #ef4444",
                    background: "#fef2f2",
                    color: "#991b1b",
                  },
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#ffffff",
                  },
                },
                loading: {
                  style: {
                    border: "1px solid #3b82f6",
                    background: "#eff6ff",
                    color: "#1e40af",
                  },
                  iconTheme: {
                    primary: "#3b82f6",
                    secondary: "#ffffff",
                  },
                },
              }}
              containerStyle={{
                top: 20,
                left: 20,
                bottom: 20,
                right: 20,
              }}
              gutter={8}
              reverseOrder={false}
            />
            <Routes>
              <Route
                path="/"
                element={
                  <ErrorBoundary>
                    <LandingPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/file-upload"
                element={
                  <ProtectedRoute>
                    <FileUpload />
                  </ProtectedRoute>
                }
              />
              {/* Catch all route - redirect to dashboard if authenticated, otherwise to landing */}
              <Route
                path="*"
                element={
                  auth.isAuthenticated() ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

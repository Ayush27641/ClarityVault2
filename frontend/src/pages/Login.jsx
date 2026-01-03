"use client";

import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText as DocumentTextIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  ArrowRight as ArrowRightIcon,
} from "lucide-react";
import { useState } from "react";
import styles from "./Login.module.css";
import { auth } from "../lib/utils";
import { AUTH_BASE_URL } from "../services/api";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Dismiss any existing toasts to prevent duplicates
    toast.dismiss();

    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        return;
      }

      // Create URL with query parameters for GET request
      const url = new URL(`${AUTH_BASE_URL}/login`);
      url.searchParams.append("email", formData.email);
      url.searchParams.append("password", formData.password);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Attempt to detect response type (some backends return JSON { token: "..." })
        let rawBody;
        try {
          // Clone not available on fetch body once read; peek at content-type header
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const json = await response.json();
            rawBody =
              json.token ||
              json.accessToken ||
              json.jwt ||
              JSON.stringify(json);
          } else {
            rawBody = await response.text();
          }
        } catch (e) {
          console.warn("⚠️ Could not parse login response body cleanly:", e);
          rawBody = "";
        }

        const token = (rawBody || "").trim();
        console.log("🔑 Raw token received length:", token.length);

        // Basic JWT format validation (3 parts separated by '.')
        const isLikelyJwt = token.split(".").length === 3;
        if (!isLikelyJwt) {
          console.error(
            "❌ Received token is not a valid JWT format:",
            token.substring(0, 40)
          );
          toast.error("Login failed: invalid token format received.");
          return;
        }

        // Optional: decode payload for debug (will fail silently if invalid base64)
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("🔍 Token payload (login):", {
            sub: payload.sub,
            exp: payload.exp,
            iat: payload.iat,
            now: Math.floor(Date.now() / 1000),
            secondsUntilExpiry: payload.exp
              ? payload.exp - Math.floor(Date.now() / 1000)
              : "n/a",
          });
          if (payload.exp && payload.exp < Date.now() / 1000) {
            toast.error("Received an already expired token. Please try again.");
            return;
          }
        } catch (e) {
          console.warn("⚠️ Could not decode JWT payload for debug:", e);
        }

        // Build userData (extendable if backend later returns profile info)
        const userData = {
          email: formData.email,
          username: formData.email,
          name: formData.email.split("@")[0],
        };

        // Persist auth state
        auth.login(token, userData);

        // Enhanced validation: confirm storage and test immediately
        const stored = localStorage.getItem("token");
        if (!stored || stored !== token) {
          console.error(
            "❌ Token was not persisted correctly to localStorage."
          );
          toast.error("Could not persist session. Please retry.");
          return;
        }

        // Immediate auth validation
        const isStillAuthenticated = auth.isAuthenticated();
        if (!isStillAuthenticated) {
          console.error("❌ Authentication validation failed after storage.");
          toast.error("Authentication validation failed. Please try again.");
          return;
        }

        console.log("✅ Token successfully stored and validated");
        toast.success("Login successful! Welcome back.");
        navigate("/dashboard");
      } else if (response.status === 400) {
        toast.error("Invalid email or password. Please try again.");
      } else if (response.status === 401) {
        toast.error("Authentication failed. Please check your credentials.");
      } else {
        toast.error("An error occurred during login. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className={styles.loginPage}>
      {/* Background */}
      <div className={styles.loginBackground}>
        <motion.div
          className={styles.gradientLayer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className={styles.shapeLayer}>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.floatingShape}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 6 + i * 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <motion.div
            className={styles.headerContent}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className={styles.logo}>
              <DocumentTextIcon className={styles.logoIcon} />
              <span className={styles.logoText}>Clarity Vault AI</span>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            className={styles.loginContainer}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className={styles.loginCard} variants={itemVariants}>
              <div className={styles.cardHeader}>
                <motion.h1 className={styles.title} variants={itemVariants}>
                  Welcome Back
                </motion.h1>
                <motion.p className={styles.subtitle} variants={itemVariants}>
                  Sign in to continue analyzing your legal documents
                </motion.p>
              </div>

              <motion.form
                className={styles.form}
                onSubmit={handleSubmit}
                variants={itemVariants}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address
                  </label>
                  <div className={styles.inputWrapper}>
                    <MailIcon className={styles.inputIcon} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <LockIcon className={styles.inputIcon} />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={styles.input}
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <label className={styles.checkbox}>
                    <input type="checkbox" />
                    <span className={styles.checkboxText}>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className={styles.forgotPassword}>
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {isLoading ? (
                    <div className={styles.spinner} />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRightIcon className={styles.buttonIcon} />
                    </>
                  )}
                </motion.button>
              </motion.form>

              <motion.div className={styles.cardFooter} variants={itemVariants}>
                <p className={styles.signupPrompt}>
                  Don't have an account?{" "}
                  <Link to="/register" className={styles.signupLink}>
                    Sign up for free
                  </Link>
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className={styles.featuresPreview}
              variants={itemVariants}
            >
              <h3 className={styles.featuresTitle}>
                Why Choose Clarity Vault AI?
              </h3>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>✨</div>
                  <div>
                    <h4>AI-Powered Analysis</h4>
                    <p>Get instant insights from your legal documents</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🛡️</div>
                  <div>
                    <h4>Risk Assessment</h4>
                    <p>Identify potential issues before they become problems</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🌍</div>
                  <div>
                    <h4>Multi-Language Support</h4>
                    <p>Analyze documents in any language</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Login;

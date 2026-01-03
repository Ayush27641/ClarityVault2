import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileText as DocumentTextIcon,
  Upload as UploadIcon,
  BarChart3 as ChartBarIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  TrendingUp as TrendingUpIcon,
  Plus as PlusIcon,
  Eye as EyeIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut as LogOutIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "../lib/utils";
import { fileUploadAPI, userDataAPI } from "../services/api";
import toast from "react-hot-toast";
import FileUpload from "../components/FileUpload";
import DocumentManager from "../components/DocumentManager";
import DocumentAnalysis from "../components/DocumentAnalysis";
import ResponsiveNavigation from "../components/ResponsiveNavigation";
//import AuthTester from "../components/AuthTester";
import UserProfile from "../components/UserProfile";
// import UserDataAPITester from "../components/UserDataAPITester";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({
    documentsAnalyzed: 0,
    riskIssuesFound: 0,
    moneySaved: 0,
    processingTime: "2.3 min",
  });

  // Get user data
  // const userData = auth.getUserData();
  // const username = auth.getUsername();

  // Debug function to test authentication
  // const testAuth = () => {
  //   console.log("🔍 Auth Debug Info:");
  //   console.log("Token:", auth.getToken());
  //   console.log("User Data:", auth.getUserData());
  //   console.log("Username:", auth.getUsername());
  //   console.log("Is Authenticated:", auth.isAuthenticated());

  //   // Test token expiration
  //   const token = auth.getToken();
  //   if (token) {
  //     console.log("Token expired:", auth.isTokenExpired(token));
  //     try {
  //       const payload = JSON.parse(atob(token.split(".")[1]));
  //       console.log("Token payload:", payload);
  //       console.log("Token expiry:", new Date(payload.exp * 1000));
  //       console.log("Current time:", new Date());
  //     } catch (e) {
  //       console.log("Error parsing token:", e);
  //     }
  //   }

  //   // Show user-friendly message
  //   toast.success("Check console for detailed auth debug info", {
  //     duration: 3000,
  //   });
  // };

  useEffect(() => {
    // Debug auth on component mount
    // testAuth();

    // Fetch real user statistics
    fetchUserStats();

    // Fetch user profile
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const username = auth.getUsername();
      if (username) {
        const profile = await userDataAPI.getUserProfile(username);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const username = auth.getUsername();
      if (!username) {
        console.warn("No username found for stats");
        return;
      }

      // Fetch user's documents to calculate stats
      const response = await fileUploadAPI.findFilesByUsername(username);
      // response is either an array or an object with files property
      const documents = response.files || response || [];

      // Calculate real statistics
      const documentsAnalyzed = documents.length;
      const riskIssuesFound = documents.filter(
        (doc) => doc.riskLevel === "high" || doc.riskLevel === "medium"
      ).length;

      // Mock calculations for demo (would be real API calls in production)
      const moneySaved = documentsAnalyzed * 120; // Average $120 saved per document
      const avgProcessingTime = documents.length > 0 ? "1.8 min" : "0 min";

      setUserStats({
        documentsAnalyzed,
        riskIssuesFound,
        moneySaved,
        processingTime: avgProcessingTime,
      });
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      // Fallback to mock data
      setUserStats({
        documentsAnalyzed: 0,
        riskIssuesFound: 0,
        moneySaved: 0,
        processingTime: "0 min",
      });
    }
  };

  const handleUploadSuccess = (uploadedFile) => {
    // Refresh document list and stats
    console.log("File uploaded successfully:", uploadedFile);
    fetchUserStats(); // Refresh stats after upload
    if (activeView !== "documents") {
      setActiveView("documents");
    }
    // Dismiss any existing upload toasts and show success with unique ID
    toast.dismiss("dashboard-upload");
    toast.success("Document uploaded successfully!", {
      id: "dashboard-upload",
    });
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setShowAnalysis(true);
  };

  const handleLogout = () => {
    auth.logout();
  };

  const stats = [
    {
      title: "Documents Analyzed",
      value: userStats.documentsAnalyzed.toLocaleString(),
      change: "+12%",
      changeType: "positive",
      icon: DocumentTextIcon,
    },
    {
      title: "Risk Issues Found",
      value: userStats.riskIssuesFound.toString(),
      change: "-8%",
      changeType: "positive",
      icon: ChartBarIcon,
    },
    {
      title: "Money Saved",
      value: `$${userStats.moneySaved.toLocaleString()}`,
      change: "+23%",
      changeType: "positive",
      icon: TrendingUpIcon,
    },
    {
      title: "Processing Time",
      value: userStats.processingTime,
      change: "-15%",
      changeType: "positive",
      icon: ClockIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Navigation */}
      <ResponsiveNavigation
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        {activeView === "overview" && (
          <>
            {/* Welcome Section */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {userProfile?.fullName || auth.getDisplayName()}!
                👋
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Here's what's happening with your legal documents today.
              </p>

              {/* Debug Button */}
              {/* <div className="mt-2 space-x-2">
                <button
                  onClick={testAuth}
                  className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                  title="Debug Authentication"
                >
                  🔍 Debug Auth
                </button>
                <button
                  onClick={() => setActiveView("debug")}
                  className="px-3 py-1 text-xs bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded transition-colors"
                  title="Open Auth Tester"
                >
                  🔧 Auth Tester
                </button>
              </div> */}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  onClick={() => navigate("/file-upload")}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-2xl flex items-center space-x-4 hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UploadIcon className="w-8 h-8" />
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Upload Files</h3>
                    <p className="text-green-100 text-sm">
                      Manage and upload documents
                    </p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setActiveView("documents")}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-green-200 dark:border-green-700 text-gray-900 dark:text-white p-6 rounded-2xl flex items-center space-x-4 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-sm"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DocumentTextIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">View Documents</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Manage your documents
                    </p>
                  </div>
                </motion.button>

                <motion.button
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-yellow-200 dark:border-yellow-700 text-gray-900 dark:text-white p-6 rounded-2xl flex items-center space-x-4 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-sm"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UsersIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Get Help</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Connect with legal experts
                    </p>
                  </div>
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Grid */}
            {/* <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl flex items-center justify-center text-white">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "positive"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {stat.title}
                  </p>
                </motion.div>
              ))}
            </motion.div> */}

            {/* Recent Documents Preview */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Recent Documents
                </h3>
                <motion.button
                  onClick={() => setActiveView("documents")}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All
                </motion.button>
              </div>

              <DocumentManager
                onDocumentSelect={handleDocumentSelect}
                showAnalysisOptions={true}
              />
            </motion.div>
          </>
        )}

        {/* Upload View */}
        {activeView === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Documents
              </h2>
              <p className="text-gray-600">
                Upload your legal documents for AI-powered analysis
              </p>
            </div>
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(error) => console.error("Upload error:", error)}
            />
          </motion.div>
        )}

        {/* Documents View */}
        {activeView === "documents" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <DocumentManager
              onDocumentSelect={handleDocumentSelect}
              showAnalysisOptions={true}
            />
          </motion.div>
        )}

        {/* Profile View */}
        {activeView === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <UserProfile />
          </motion.div>
        )}

        {/* Auth Debug View */}
        {activeView === "debug" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AuthTester />
          </motion.div>
        )}

        {/* API Testing View */}
        {activeView === "api-test" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <UserDataAPITester />
          </motion.div>
        )}
      </div>

      {/* Document Analysis Modal */}
      {showAnalysis && selectedDocument && (
        <DocumentAnalysis
          document={selectedDocument}
          onClose={() => {
            setShowAnalysis(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Mail as MailIcon,
  Calendar as CalendarIcon,
  Loader2 as LoaderIcon,
  AlertCircle as AlertIcon,
  RefreshCw as RefreshIcon,
  Crown as CrownIcon,
} from "lucide-react";
import { userDataAPI, apiUtils } from "../services/api";
import { auth } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import toast from "react-hot-toast";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's username from auth
      const currentUsername = auth.getUsername();
      console.log("📧 Current username:", currentUsername);

      if (!currentUsername) {
        throw new Error("No username found in session");
      }

      // Use the new profile endpoint
      console.log("🔍 Fetching user profile from new endpoint...");
      const userProfileResponse = await userDataAPI.getUserProfile(
        currentUsername
      );

      console.log("✅ User profile loaded:", userProfileResponse);
      setUserData(userProfileResponse);
    } catch (error) {
      console.error("❌ Failed to load user data:", error);
      const errorInfo = apiUtils.handleError(error);
      setError(errorInfo.message);
      toast.error(`Failed to load profile: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    setRefreshing(true);
    loadUserData().finally(() => setRefreshing(false));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertIcon className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadUserData} variant="outline">
            <RefreshIcon className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      {/* Main Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User Profile
          </CardTitle>
          <Button
            onClick={refreshProfile}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshIcon
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                Basic Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Full Name
                    </p>
                    <p className="font-medium dark:text-white">
                      {userData?.fullName || "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MailIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="font-medium dark:text-white">
                      {userData?.email || userData?.username || "Not available"}
                    </p>
                  </div>
                </div>

                {userData?.id && (
                  <div className="flex items-center gap-3">
                    <CrownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        User ID
                      </p>
                      <p className="font-medium dark:text-white">
                        {userData.id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                Account Details
              </h3>

              <div className="space-y-3">
                {userData?.registrationDate && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Registration Date
                      </p>
                      <p className="font-medium dark:text-white">
                        {formatDate(userData.registrationDate)}
                      </p>
                    </div>
                  </div>
                )}

                {userData?.createdAt && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Account Created
                      </p>
                      <p className="font-medium dark:text-white">
                        {formatDate(userData.createdAt)}
                      </p>
                    </div>
                  </div>
                )}

                {userData?.lastLogin && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last Login
                      </p>
                      <p className="font-medium dark:text-white">
                        {formatDate(userData.lastLogin)}
                      </p>
                    </div>
                  </div>
                )}

                {userData?.role && (
                  <div className="flex items-center gap-3">
                    <CrownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Role
                      </p>
                      <p className="font-medium capitalize dark:text-white">
                        {userData.role}
                      </p>
                    </div>
                  </div>
                )}

                {userData?.isActive !== undefined && (
                  <div className="flex items-center gap-3">
                    <AlertIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Account Status
                      </p>
                      <p
                        className={`font-medium ${
                          userData.isActive
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {userData.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Raw Data (for debugging) */}
          {/* {userData && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <details className="cursor-pointer">
                <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  View Raw User Data (Debug)
                </summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </details>
            </div>
          )} */}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserProfile;

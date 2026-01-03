import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  FileText as FileTextIcon,
  Download as DownloadIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  ArrowLeft as ArrowLeftIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  MoreVertical as MoreVerticalIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Loader2 as LoaderIcon,
  X as XIcon,
  Cloud as CloudIcon,
  HardDrive as HardDriveIcon,
} from "lucide-react";
import { fileUploadAPI, apiUtils } from "../services/api";
import { auth } from "../lib/utils";
import toast from "react-hot-toast";

const FileUploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State management
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [harmfulTerms, setHarmfulTerms] = useState({}); // Store harmful terms analysis results per file id
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileDetails, setShowFileDetails] = useState(false);

  // Get current user
  const username = auth.getUsername();

  // Load all files for the current user
  const loadUserFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Loading files for user:", username);
      console.log("🔐 Auth token:", auth.getToken() ? "Present" : "Missing");

      const response = await fileUploadAPI.findFilesByUsername(username);
      console.log("📁 API Response:", response);

      const filesData = response.files || response || [];
      console.log("📄 Files data:", filesData);

      setFiles(filesData);

      if (filesData.length === 0) {
        console.log("ℹ️ No files found for user");
      } else {
        console.log(`✅ Loaded ${filesData.length} files`);
      }
    } catch (error) {
      console.error("❌ Error loading files:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
      });
      toast.error("Failed to load files. Check console for details.", {
        id: "load-files-error",
      });
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  // Load user files on component mount
  useEffect(() => {
    if (username) {
      loadUserFiles();
    }
  }, [username, loadUserFiles]);

  // Handle file selection via input
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFilesAdded(files);
  };

  // Handle files added (via drag & drop or selection)
  const handleFilesAdded = (newFiles) => {
    const validFiles = [];
    const errors = [];

    newFiles.forEach((file) => {
      const validation = apiUtils.validateFile(file);
      if (validation.valid) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          status: "pending",
          progress: 0,
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      // Dismiss any existing validation error toasts
      toast.dismiss("validation-errors");
      errors.forEach((error, index) =>
        toast.error(error, { id: `validation-error-${index}` })
      );
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFilesAdded(files);
  };

  // Upload selected files
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const uploadPromises = selectedFiles.map(async (fileItem) => {
      try {
        console.log(`📤 Starting upload for: ${fileItem.file.name}`);
        fileItem.status = "uploading";
        fileItem.progress = 50;
        setSelectedFiles([...selectedFiles]);

        const response = await fileUploadAPI.saveFile(username, fileItem.file);
        console.log(
          `✅ Upload successful for ${fileItem.file.name}:`,
          response
        );

        fileItem.status = "completed";
        fileItem.progress = 100;
        fileItem.response = response;

        // Always call harmful terms analysis API after upload (only for PDFs)
        if (fileItem.file.type === "application/pdf") {
          try {
            console.log(
              `🔍 Starting harmful terms analysis for PDF: ${fileItem.file.name}`
            );
            fileItem.analyzingHarmful = true;
            setSelectedFiles([...selectedFiles]);

            const analysis = await fileUploadAPI.analyzeHarmfulTerms(
              fileItem.file
            );
            console.log(
              `✅ Harmful terms analysis completed for ${fileItem.file.name}:`,
              analysis
            );

            setHarmfulTerms((prev) => ({ ...prev, [fileItem.id]: analysis }));
            fileItem.analyzingHarmful = false;
            fileItem.harmfulTermsResult = analysis;

            // Show toast notification based on results
            if (Array.isArray(analysis) && analysis.length === 0) {
              // Dismiss any existing toasts for this file before showing new one
              toast.dismiss(`harmful-${fileItem.id}`);
              toast.success(
                `✅ No harmful terms found in ${fileItem.file.name}`,
                {
                  id: `harmful-${fileItem.id}`,
                  duration: 3000,
                }
              );
            } else if (Array.isArray(analysis) && analysis.length > 0) {
              // Dismiss any existing toasts for this file before showing new one
              toast.dismiss(`harmful-${fileItem.id}`);
              toast.warning(
                `⚠️ Found ${analysis.length} harmful term(s) in ${fileItem.file.name}`,
                {
                  id: `harmful-${fileItem.id}`,
                  duration: 5000,
                }
              );
            }
          } catch (err) {
            console.error(
              `❌ Harmful terms analysis failed for ${fileItem.file.name}:`,
              err
            );
            setHarmfulTerms((prev) => ({
              ...prev,
              [fileItem.id]: { error: err.message },
            }));
            fileItem.analyzingHarmful = false;
            toast.error(
              `Harmful terms analysis failed for ${fileItem.file.name}`
            );
          }
        } else {
          console.log(
            `⏭️ Skipping harmful terms analysis for non-PDF file: ${fileItem.file.name} (${fileItem.file.type})`
          );
        }

        return { success: true, file: fileItem, response };
      } catch (error) {
        console.error(`❌ Upload failed for ${fileItem.file.name}:`, error);
        fileItem.status = "error";
        fileItem.error = error.message;
        return { success: false, file: fileItem, error };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      // Dismiss any existing upload toasts
      toast.dismiss("upload-batch");

      if (successful.length > 0) {
        toast.success(`${successful.length} file(s) uploaded successfully!`, {
          id: "upload-batch",
        });
        // Reload files list
        loadUserFiles();
        // Clear selected files
        setSelectedFiles([]);
      }

      if (failed.length > 0) {
        failed.forEach((result, index) => {
          toast.error(`Failed to upload ${result.file.name}: ${result.error}`, {
            id: `upload-error-${index}`,
          });
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file
  const deleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      // Dismiss any existing toasts for this file
      toast.dismiss(`delete-${fileId}`);

      await fileUploadAPI.deleteFile(fileId);
      toast.success("File deleted successfully", { id: `delete-${fileId}` });
      loadUserFiles(); // Reload the files list
    } catch (error) {
      toast.error(`Failed to delete file: ${error.message}`, {
        id: `delete-${fileId}`,
      });
    }
  };

  // Download file
  const downloadFile = async (fileId, fileName) => {
    try {
      // Dismiss any existing toasts for this file download
      toast.dismiss(`download-${fileId}`);

      await fileUploadAPI.downloadFile(fileId, fileName);
      toast.success("File download started", { id: `download-${fileId}` });
    } catch (error) {
      toast.error(`Failed to download file: ${error.message}`, {
        id: `download-${fileId}`,
      });
    }
  };

  // View file details
  const viewFileDetails = async (fileId) => {
    try {
      const fileDetails = await fileUploadAPI.findFileById(fileId);
      setSelectedFile(fileDetails);
      setShowFileDetails(true);
    } catch (error) {
      toast.error(`Failed to load file details: ${error.message}`);
    }
  };

  // Remove selected file from upload queue
  const removeSelectedFile = (fileId) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Filter files based on search and type
  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (file.fileName &&
        apiUtils.getFileExtension(file.fileName).toLowerCase() === filterType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-green-100 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                File Manager
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload Files
            </h2>
            {selectedFiles.length > 0 && (
              <button
                onClick={uploadFiles}
                disabled={isUploading}
                className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200"
              >
                {isUploading ? (
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudIcon className="h-4 w-4" />
                )}
                <span>
                  {isUploading
                    ? "Uploading..."
                    : `Upload ${selectedFiles.length} file(s)`}
                </span>
              </button>
            )}
          </div>

          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragOver
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Drag and drop files here, or{" "}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (Max 10MB
              each)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          />

          {/* Selected Files for Upload */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Files Ready for Upload
              </h3>
              <div className="space-y-3">
                {selectedFiles.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="flex-col p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="text-2xl">
                          {apiUtils.getFileTypeIcon(fileItem.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-medium text-gray-900 dark:text-white truncate"
                            title={fileItem.name}
                          >
                            {fileItem.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {apiUtils.formatFileSize(fileItem.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {fileItem.status === "uploading" && (
                          <LoaderIcon className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                        {fileItem.status === "completed" && (
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        )}
                        {fileItem.status === "error" && (
                          <AlertCircleIcon className="h-4 w-4 text-red-600" />
                        )}
                        {fileItem.status === "pending" && (
                          <button
                            onClick={() => removeSelectedFile(fileItem.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Harmful Terms Section - only visible for PDF files */}
                    {fileItem.file.type === "application/pdf" && (
                      <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                        {fileItem.analyzingHarmful ? (
                          <div className="flex items-center text-blue-600 text-sm">
                            <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                            Analyzing for harmful terms...
                          </div>
                        ) : harmfulTerms[fileItem.id] ? (
                          harmfulTerms[fileItem.id].error ? (
                            <div className="text-red-600 text-sm">
                              Error: {harmfulTerms[fileItem.id].error}
                            </div>
                          ) : (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                              <h6 className="font-semibold text-yellow-800 mb-1">
                                Harmful Terms Analysis
                              </h6>
                              {typeof harmfulTerms[fileItem.id] === "string" ? (
                                <div className="text-gray-700 text-sm">
                                  {harmfulTerms[fileItem.id]}
                                </div>
                              ) : Array.isArray(harmfulTerms[fileItem.id]) ? (
                                harmfulTerms[fileItem.id].length === 0 ? (
                                  <div className="text-green-700 text-sm">
                                    ✅ NO HARMFUL TERMS IDENTIFIED - This
                                    document appears to have fair and balanced
                                    terms.
                                  </div>
                                ) : (
                                  <ul className="list-disc pl-5 space-y-2">
                                    {harmfulTerms[fileItem.id].map(
                                      (term, idx) => (
                                        <li
                                          key={idx}
                                          className="text-gray-700 text-sm"
                                        >
                                          <span className="font-bold">
                                            {term["HARMFUL TERM"] || term.title}
                                          </span>{" "}
                                          (Page: {term["PAGE"] || term.page},
                                          Risk:{" "}
                                          {term["RISK LEVEL"] || term.risk})
                                          <br />
                                          <span className="italic">
                                            {term["DESCRIPTION"] ||
                                              term.description}
                                          </span>
                                          <br />
                                          <span className="text-red-700">
                                            Impact:{" "}
                                            {term["POTENTIAL IMPACT"] ||
                                              term.impact}
                                          </span>
                                          <br />
                                          <span className="text-blue-700">
                                            Recommendation:{" "}
                                            {term["RECOMMENDATION"] ||
                                              term.recommendation}
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )
                              ) : (
                                <div className="text-gray-700 text-sm">
                                  {JSON.stringify(harmfulTerms[fileItem.id])}
                                </div>
                              )}
                            </div>
                          )
                        ) : fileItem.status === "completed" &&
                          fileItem.file.type === "application/pdf" ? (
                          <div className="text-gray-600 text-sm">
                            📄 PDF uploaded - Harmful terms analysis will appear
                            here
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Files List Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-sm">
          <div className="p-6 border-b border-green-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Files
              </h2>
              <button
                onClick={loadUserFiles}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="doc">Word</option>
                <option value="docx">Word</option>
                <option value="xls">Excel</option>
                <option value="xlsx">Excel</option>
                <option value="ppt">PowerPoint</option>
                <option value="pptx">PowerPoint</option>
                <option value="txt">Text</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoaderIcon className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">
                  Loading files...
                </span>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <HardDriveIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {files.length === 0
                    ? "No files uploaded yet"
                    : "No files match your search"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-xl p-4 hover:shadow-xl transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="text-2xl">
                          {apiUtils.getFileTypeIcon(
                            file.fileName || file.originalFileName
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-medium text-gray-900 dark:text-white truncate"
                            title={file.fileName || file.originalFileName}
                          >
                            {file.fileName || file.originalFileName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {file.fileSize
                              ? apiUtils.formatFileSize(file.fileSize)
                              : "Unknown size"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {file.uploadDate
                          ? new Date(file.uploadDate).toLocaleDateString()
                          : "Unknown date"}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => viewFileDetails(file.id)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            downloadFile(
                              file.id,
                              file.fileName || file.originalFileName
                            )
                          }
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
                          title="Download"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            deleteFile(
                              file.id,
                              file.fileName || file.originalFileName
                            )
                          }
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Details Modal */}
      <AnimatePresence>
        {showFileDetails && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowFileDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 max-w-md w-full border border-white/20 dark:border-gray-700/50 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  File Details
                </h3>
                <button
                  onClick={() => setShowFileDetails(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    File Name
                  </label>
                  <p
                    className="text-gray-900 dark:text-white truncate"
                    title={
                      selectedFile.fileName || selectedFile.originalFileName
                    }
                  >
                    {selectedFile.fileName || selectedFile.originalFileName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    File Size
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedFile.fileSize
                      ? apiUtils.formatFileSize(selectedFile.fileSize)
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Date
                  </label>
                  <p className="text-gray-900">
                    {selectedFile.uploadDate
                      ? new Date(selectedFile.uploadDate).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    File Type
                  </label>
                  <p className="text-gray-900">
                    {selectedFile.fileName
                      ? apiUtils
                          .getFileExtension(selectedFile.fileName)
                          .toUpperCase()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() =>
                    downloadFile(
                      selectedFile.id,
                      selectedFile.fileName || selectedFile.originalFileName
                    )
                  }
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    deleteFile(
                      selectedFile.id,
                      selectedFile.fileName || selectedFile.originalFileName
                    );
                    setShowFileDetails(false);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploadPage;

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";
import {
  Upload as UploadIcon,
  X as XIcon,
  FileText as FileTextIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Loader2 as LoaderIcon,
  File as FileIcon,
  ImageIcon,
} from "lucide-react";
import { fileUploadAPI, fileUtils, apiUtils } from "../services/api";
import { auth } from "../lib/utils";
import toast from "react-hot-toast";

const FileUpload = ({ onUploadSuccess, onUploadError, maxFiles = 5 }) => {
  const [files, setFiles] = useState([]);
  // Store harmful terms analysis results per file id
  const [harmfulTerms, setHarmfulTerms] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // File validation
  const validateFile = useCallback((file) => {
    const errors = [];

    if (!fileUtils.validateFileType(file)) {
      errors.push(
        "Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT"
      );
    }

    if (!fileUtils.validateFileSize(file)) {
      errors.push("File size must be less than 10MB");
    }

    return errors;
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    (selectedFiles) => {
      const fileArray = Array.from(selectedFiles);
      const newFiles = [];

      fileArray.forEach((file) => {
        const validationErrors = validateFile(file);

        // Check for duplicates
        const isDuplicate = files.some(
          (existingFile) =>
            existingFile.file.name === file.name &&
            existingFile.file.size === file.size
        );

        if (isDuplicate) {
          toast.error(`File "${file.name}" is already selected`);
          return;
        }

        // Check max files limit
        if (files.length + newFiles.length >= maxFiles) {
          toast.error(`Maximum ${maxFiles} files allowed`);
          return;
        }

        const fileObj = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: fileUtils.formatFileSize(file.size),
          type: fileUtils.getFileTypeIcon(file.name),
          status: validationErrors.length > 0 ? "error" : "ready",
          errors: validationErrors,
          progress: 0,
        };

        newFiles.push(fileObj);

        if (validationErrors.length > 0) {
          toast.error(`${file.name}: ${validationErrors.join(", ")}`);
        }
      });

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files, maxFiles, validateFile]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFiles = e.dataTransfer.files;
      handleFileSelect(droppedFiles);
    },
    [handleFileSelect]
  );

  // Remove file from list
  const removeFile = useCallback((fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  // Upload files
  const uploadFiles = useCallback(async () => {
    const username = auth.getUsername();
    console.log("🚀 Starting upload process...");
    console.log("👤 Current username:", username);
    console.log("🔑 Current token:", auth.getToken() ? "Present" : "Missing");
    console.log("📊 User data:", auth.getUserData());

    if (!username) {
      console.error("❌ No username found");
      toast.error("Please log in to upload files");
      return;
    }

    const validFiles = files.filter((file) => file.status === "ready");
    console.log("📁 Valid files to upload:", validFiles.length);

    if (validFiles.length === 0) {
      toast.error("No valid files to upload");
      return;
    }

    setIsUploading(true);

    const uploadPromises = validFiles.map(async (fileObj, index) => {
      console.log(
        `📤 Uploading file ${index + 1}/${validFiles.length}:`,
        fileObj.name
      );

      try {
        // Update file status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, status: "uploading", progress: 0 } : f
          )
        );

        const response = await fileUploadAPI.saveFile(
          username,
          fileObj.file,
          (progress) => {
            console.log(`📊 Upload progress for ${fileObj.name}: ${progress}%`);
            setFiles((prev) =>
              prev.map((f) => (f.id === fileObj.id ? { ...f, progress } : f))
            );
          }
        );

        console.log(`✅ Upload successful for ${fileObj.name}:`, response.data);

        // Update file status to success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? {
                  ...f,
                  status: "success",
                  progress: 100,
                  uploadedData: response.data,
                }
              : f
          )
        );

        toast.success(`${fileObj.name} uploaded successfully`);
        onUploadSuccess?.(response.data);

        // Always call harmful terms analysis API after upload (only for PDFs)
        if (fileObj.file.type === "application/pdf") {
          try {
            console.log(
              `🔍 Starting harmful terms analysis for PDF: ${fileObj.name}`
            );
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id ? { ...f, analyzingHarmful: true } : f
              )
            );
            const analysis = await fileUploadAPI.analyzeHarmfulTerms(
              fileObj.file
            );
            console.log(
              `✅ Harmful terms analysis completed for ${fileObj.name}:`,
              analysis
            );
            setHarmfulTerms((prev) => ({ ...prev, [fileObj.id]: analysis }));
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id ? { ...f, analyzingHarmful: false } : f
              )
            );
          } catch (err) {
            console.error(
              `❌ Harmful terms analysis failed for ${fileObj.name}:`,
              err
            );
            setHarmfulTerms((prev) => ({
              ...prev,
              [fileObj.id]: { error: err.message },
            }));
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id ? { ...f, analyzingHarmful: false } : f
              )
            );
            toast.error(`Harmful terms analysis failed for ${fileObj.name}`);
          }
        } else {
          console.log(
            `⏭️ Skipping harmful terms analysis for non-PDF file: ${fileObj.name} (${fileObj.file.type})`
          );
        }

        return { success: true, fileId: fileObj.id, data: response.data };
      } catch (error) {
        console.error(`❌ Upload failed for ${fileObj.name}:`, error);
        const errorInfo = apiUtils.handleError(error);

        // Update file status to error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? { ...f, status: "error", errors: [errorInfo.message] }
              : f
          )
        );

        toast.error(`Failed to upload ${fileObj.name}: ${errorInfo.message}`);
        onUploadError?.(error, fileObj);

        return { success: false, fileId: fileObj.id, error: errorInfo };
      }
    });

    const results = await Promise.all(uploadPromises);
    console.log("📊 Upload results:", results);
    setIsUploading(false);
  }, [files, onUploadSuccess, onUploadError]);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploading":
        return <LoaderIcon className="w-5 h-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileTextIcon className="w-8 h-8 text-red-500" />;
      case "word":
        return <FileTextIcon className="w-8 h-8 text-blue-500" />;
      case "excel":
        return <FileTextIcon className="w-8 h-8 text-green-500" />;
      case "powerpoint":
        return <FileTextIcon className="w-8 h-8 text-orange-500" />;
      case "text":
        return <FileTextIcon className="w-8 h-8 text-gray-500" />;
      default:
        return <FileIcon className="w-8 h-8 text-gray-400" />;
    }
  };

  // Collect all harmful terms for summary
  const allHarmfulTerms = Object.values(harmfulTerms)
    .flatMap((result) => (Array.isArray(result) ? result : []))
    .filter((term) => term && (term["HARMFUL TERM"] || term.title));

  // Check if any files are PDFs
  const hasPdfFiles = files.some(
    (file) => file.file.type === "application/pdf"
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        style={{
          background: "red",
          color: "white",
          padding: 10,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        TEST DIV: FileUpload is rendering
      </div>
      {/* Harmful Terms Summary - only show when there are PDF files */}
      {hasPdfFiles && (
        <div className="mb-6">
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">
              Harmful Terms Summary (PDF Documents Only)
            </h4>
            {allHarmfulTerms.length === 0 ? (
              <div className="text-green-700 text-sm">
                No harmful terms identified in any uploaded PDF document.
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2">
                {allHarmfulTerms.map((term, idx) => (
                  <li key={idx} className="text-gray-700 text-sm">
                    <span className="font-bold">
                      {term["HARMFUL TERM"] || term.title}
                    </span>{" "}
                    (Page: {term["PAGE"] || term.page}, Risk:{" "}
                    {term["RISK LEVEL"] || term.risk})<br />
                    <span className="italic">
                      {term["DESCRIPTION"] || term.description}
                    </span>
                    <br />
                    <span className="text-red-700">
                      Impact: {term["POTENTIAL IMPACT"] || term.impact}
                    </span>
                    <br />
                    <span className="text-blue-700">
                      Recommendation:{" "}
                      {term["RECOMMENDATION"] || term.recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Upload Area */}
      <motion.div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? "border-green-400 bg-green-50"
            : "border-gray-300 hover:border-green-300 bg-gray-50/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <UploadIcon className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Legal Documents
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or{" "}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-green-600 hover:text-green-700 font-medium underline"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (max 10MB each)
            </p>
          </div>

          <motion.button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Select Files
          </motion.button>
        </motion.div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="mt-6 bg-white rounded-2xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h4 className="font-semibold text-gray-900">
                Selected Files ({files.length})
              </h4>
              <div className="space-x-2">
                <motion.button
                  onClick={clearFiles}
                  className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All
                </motion.button>
                <motion.button
                  onClick={uploadFiles}
                  disabled={
                    isUploading ||
                    files.filter((f) => f.status === "ready").length === 0
                  }
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isUploading ? (
                    <>
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-4 h-4" />
                      <span>Upload All</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  className="p-4 border-b border-gray-100 last:border-b-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900 truncate">
                          {file.name}
                        </h5>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(file.status)}
                          <motion.button
                            onClick={() => removeFile(file.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <XIcon className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{file.size}</span>
                        {file.status === "uploading" && (
                          <span>{file.progress}%</span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {file.status === "uploading" && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-green-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}

                      {/* Error Messages */}
                      {file.errors && file.errors.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          {file.errors.map((error, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-1"
                            >
                              <AlertCircleIcon className="w-4 h-4" />
                              <span>{error}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Harmful Terms Section - only visible for PDF files */}
                      {file.file.type === "application/pdf" && (
                        <div className="mt-2">
                          {file.analyzingHarmful ? (
                            <div className="flex items-center text-blue-600 text-sm">
                              <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                              Analyzing for harmful terms...
                            </div>
                          ) : harmfulTerms[file.id] ? (
                            harmfulTerms[file.id].error ? (
                              <div className="text-red-600 text-sm">
                                Error: {harmfulTerms[file.id].error}
                              </div>
                            ) : (
                              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-2">
                                <h6 className="font-semibold text-yellow-800 mb-1">
                                  Harmful Terms Identified
                                </h6>
                                {typeof harmfulTerms[file.id] === "string" ? (
                                  <div className="text-gray-700 text-sm">
                                    {harmfulTerms[file.id]}
                                  </div>
                                ) : Array.isArray(harmfulTerms[file.id]) ? (
                                  harmfulTerms[file.id].length === 0 ? (
                                    <div className="text-green-700 text-sm">
                                      NO HARMFUL TERMS IDENTIFIED - This
                                      document appears to have fair and balanced
                                      terms.
                                    </div>
                                  ) : (
                                    <ul className="list-disc pl-5 space-y-2">
                                      {harmfulTerms[file.id].map(
                                        (term, idx) => (
                                          <li
                                            key={idx}
                                            className="text-gray-700 text-sm"
                                          >
                                            <span className="font-bold">
                                              {term["HARMFUL TERM"] ||
                                                term.title}
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
                                    {JSON.stringify(harmfulTerms[file.id])}
                                  </div>
                                )}
                              </div>
                            )
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;

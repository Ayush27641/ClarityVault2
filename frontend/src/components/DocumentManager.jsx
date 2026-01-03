"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  FileText as FileTextIcon,
  Download as DownloadIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  Loader2 as LoaderIcon,
  RefreshCw as RefreshIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  MoreVertical as MoreVerticalIcon,
  FileSearch as FileSearchIcon,
} from "lucide-react";
import { fileUploadAPI, apiUtils } from "../services/api";
import { auth } from "../lib/utils";
import toast from "react-hot-toast";

const DocumentManager = ({ onDocumentSelect, showAnalysisOptions = true }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("uploadDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [documentDetails, setDocumentDetails] = useState(null);

  // Fetch detailed document information
  const fetchDocumentDetails = async (document) => {
    try {
      setLoadingDetails(true);
      console.log("🔍 Fetching detailed info for document:", document.id);

      // Fetch file metadata using the specific API
      const fileDetails = await fileUploadAPI.findFileById(document.id);
      console.log("📋 File details response:", fileDetails);

      // Download the file to identify document type
      const fileBlob = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000/api"
        }/files/download/${document.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      ).then((response) => response.blob());

      // Create a File object for document type identification
      const file = new File(
        [fileBlob],
        fileDetails.data?.fileName ||
          fileDetails.data?.filename ||
          document.filename,
        {
          type: fileBlob.type || "application/pdf",
        }
      );

      // Identify document type using the API
      let identifiedType =
        document.documentType ||
        determineDocumentType(fileDetails.data?.fileName || document.filename);
      let isFinancial = false;

      // Only attempt API identification for PDF files
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        try {
          console.log("🎯 Attempting document type identification for PDF...");
          const typeResponse = await fileUploadAPI.identifyDocumentType(file);
          console.log(
            "🎯 Document type identification response:",
            typeResponse
          );
          console.log(
            "🎯 RAW API Response (stringified):",
            JSON.stringify(typeResponse, null, 2)
          );

          // Handle the API response based on the expected format
          if (typeResponse) {
            let parsedResponse = null;

            // Parse the response to extract document_type and financial fields
            if (typeResponse.document_type) {
              identifiedType = cleanDocumentType(typeResponse.document_type);
              isFinancial = typeResponse.financial === "yes";
            }
            // Check for nested data structure
            else if (typeResponse.data) {
              if (typeof typeResponse.data === "string") {
                try {
                  parsedResponse = JSON.parse(typeResponse.data);
                } catch {
                  // If it's a plain string, clean it up aggressively
                  let rawText = typeResponse.data.toString().trim();
                  rawText = rawText.replace(/[{}",[\]]/g, "");
                  rawText = rawText.replace(/\*/g, "");
                  rawText = rawText.replace(/json/gi, "");
                  rawText = rawText.replace(/document_type:/gi, "");
                  rawText = rawText.replace(/financial:/gi, "");
                  rawText = rawText.replace(/\byes\b|\bno\b/gi, "");
                  rawText = rawText.replace(/[^\w\s-]/g, "");
                  rawText = rawText.replace(/\s+/g, " ").trim();
                  identifiedType = cleanDocumentType(rawText) || identifiedType;
                }
              } else {
                parsedResponse = typeResponse.data;
              }
            }
            // Check for AI response format
            else if (typeResponse.candidates && typeResponse.candidates[0]) {
              const candidate = typeResponse.candidates[0];
              const content = candidate.content?.parts?.[0]?.text;
              console.log("🔍 Groq API Response - Candidates format detected");
              console.log("🔍 Raw text from Groq:", content);
              if (content) {
                try {
                  parsedResponse = JSON.parse(content);
                } catch {
                  // If it's not JSON, treat as plain text and clean it aggressively
                  let rawText = content.toString().trim();
                  rawText = rawText.replace(/[{}",[\]]/g, "");
                  rawText = rawText.replace(/\*/g, "");
                  rawText = rawText.replace(/json/gi, "");
                  rawText = rawText.replace(/document_type:/gi, "");
                  rawText = rawText.replace(/financial:/gi, "");
                  rawText = rawText.replace(/\byes\b|\bno\b/gi, "");
                  rawText = rawText.replace(/[^\w\s-]/g, "");
                  rawText = rawText.replace(/\s+/g, " ").trim();
                  identifiedType = cleanDocumentType(rawText) || identifiedType;
                }
              }
            }
            // Fallback to any type field
            else if (typeResponse.type) {
              identifiedType = cleanDocumentType(typeResponse.type);
            }

            // Extract document type and financial status from parsed response
            if (parsedResponse) {
              const rawType =
                parsedResponse.document_type ||
                parsedResponse.documentType ||
                parsedResponse.type ||
                identifiedType;
              identifiedType = cleanDocumentType(rawType);
              isFinancial =
                parsedResponse.financial === "yes" ||
                parsedResponse.financial === true;
            }

            console.log("✅ Document type identified as:", identifiedType);
            console.log("💰 Financial document:", isFinancial);
          }
        } catch (error) {
          console.error("❌ Error identifying document type:", error);
          console.log(
            "🔄 Falling back to filename-based document type detection"
          );

          // Use filename-based detection as fallback
          identifiedType = determineDocumentType(
            fileDetails.data?.fileName || document.filename
          );

          // Show a subtle warning but don't fail the operation
          if (error.message.includes("400")) {
            console.warn("📄 File is not a valid PDF for type identification");
          } else if (error.message.includes("500")) {
            console.warn("🔧 Document type service temporarily unavailable");
          }
        }
      } else {
        console.log("📄 Non-PDF file, using filename-based type detection");
      }

      // Combine all the information
      const filename =
        fileDetails.data?.fileName ||
        fileDetails.data?.filename ||
        document.filename;
      const enhancedDetails = {
        ...document,
        ...fileDetails.data,
        documentType: identifiedType,
        isFinancial: isFinancial,
        realFilename: filename,
        uploadedBy: fileDetails.data?.username || fileDetails.data?.uploadedBy,
        fileSize: fileDetails.data?.fileSize || fileDetails.data?.size,
        fileType: getFileType(
          filename,
          fileDetails.data?.fileType || fileDetails.data?.type || file.type
        ),
        originalMimeType:
          fileDetails.data?.fileType || fileDetails.data?.type || file.type,
        createdAt:
          fileDetails.data?.createdAt ||
          fileDetails.data?.uploadDate ||
          document.uploadDate,
        lastModified:
          fileDetails.data?.lastModified || fileDetails.data?.modifiedDate,
      };

      console.log("✅ Enhanced document details:", enhancedDetails);
      setDocumentDetails(enhancedDetails);
    } catch (error) {
      console.error("❌ Error fetching document details:", error);
      toast.error("Failed to fetch document details");
      // Use the original document data as fallback
      setDocumentDetails(document);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Helper function to determine file type based on filename
  const getFileType = (filename, mimeType) => {
    if (!filename && !mimeType) return "Unknown";

    // Use MIME type if available
    if (mimeType) {
      if (mimeType.includes("pdf")) return "PDF";
      if (mimeType.includes("msword") || mimeType.includes("wordprocessingml"))
        return "Word Document";
      if (mimeType.includes("excel") || mimeType.includes("spreadsheetml"))
        return "Excel Spreadsheet";
      if (
        mimeType.includes("powerpoint") ||
        mimeType.includes("presentationml")
      )
        return "PowerPoint";
      if (mimeType.includes("text/plain")) return "Text File";
      if (mimeType.includes("image/")) return "Image";
    }

    // Fallback to filename extension
    if (filename) {
      const extension = filename.toLowerCase().split(".").pop();
      switch (extension) {
        case "pdf":
          return "PDF";
        case "doc":
        case "docx":
          return "Word Document";
        case "xls":
        case "xlsx":
          return "Excel Spreadsheet";
        case "ppt":
        case "pptx":
          return "PowerPoint";
        case "txt":
          return "Text File";
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "bmp":
          return "Image";
        case "zip":
        case "rar":
        case "7z":
          return "Archive";
        case "mp3":
        case "wav":
        case "flac":
          return "Audio";
        case "mp4":
        case "avi":
        case "mov":
        case "wmv":
          return "Video";
        default:
          return extension ? extension.toUpperCase() : "Unknown";
      }
    }

    return "Unknown";
  };

  // Handle view document details
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setDocumentDetails(null); // Reset details
    fetchDocumentDetails(document);
  };

  // Helper function to clean document type text
  const cleanDocumentType = (text) => {
    if (!text) return "Document";

    // Convert to string and remove all unwanted characters
    let cleanText = text.toString().trim();

    // Remove all JSON-related characters and formatting
    cleanText = cleanText.replace(/[{}",[\]]/g, "");
    cleanText = cleanText.replace(/\*/g, "");
    cleanText = cleanText.replace(/json/gi, "");
    cleanText = cleanText.replace(/document_type:/gi, "");
    cleanText = cleanText.replace(/financial:/gi, "");
    cleanText = cleanText.replace(/\byes\b|\bno\b/gi, "");
    cleanText = cleanText.replace(/\btrue\b|\bfalse\b/gi, "");

    // Remove any remaining special characters and extra spaces
    cleanText = cleanText.replace(/[^\w\s-]/g, "");
    cleanText = cleanText.replace(/\s+/g, " ").trim();

    // If it's still empty, contains suspicious patterns, or is too short
    if (
      !cleanText ||
      cleanText.length < 2 ||
      cleanText.includes("undefined") ||
      cleanText.includes("null")
    ) {
      return "Document";
    }

    // Capitalize first letter of each word for proper display
    cleanText = cleanText.replace(/\b\w/g, (l) => l.toUpperCase());

    return cleanText;
  };

  // Function to determine document type based on filename
  const determineDocumentType = (filename) => {
    if (!filename) return "Document";

    const lowerFilename = filename.toLowerCase();

    // Check for common document types based on filename patterns
    if (
      lowerFilename.includes("contract") ||
      lowerFilename.includes("agreement") ||
      lowerFilename.includes("terms")
    ) {
      return "Contract";
    } else if (
      lowerFilename.includes("invoice") ||
      lowerFilename.includes("bill") ||
      lowerFilename.includes("receipt")
    ) {
      return "Invoice";
    } else if (
      lowerFilename.includes("report") ||
      lowerFilename.includes("analysis") ||
      lowerFilename.includes("summary")
    ) {
      return "Report";
    } else if (
      lowerFilename.includes("policy") ||
      lowerFilename.includes("guideline") ||
      lowerFilename.includes("procedure")
    ) {
      return "Policy Document";
    } else if (
      lowerFilename.includes("lease") ||
      lowerFilename.includes("rental") ||
      lowerFilename.includes("tenancy")
    ) {
      return "Lease Agreement";
    } else if (
      lowerFilename.includes("nda") ||
      lowerFilename.includes("confidential") ||
      lowerFilename.includes("non-disclosure")
    ) {
      return "NDA";
    } else if (
      lowerFilename.includes("proposal") ||
      lowerFilename.includes("quote") ||
      lowerFilename.includes("quotation") ||
      lowerFilename.includes("estimate")
    ) {
      return "Proposal";
    } else if (
      lowerFilename.includes("legal") ||
      lowerFilename.includes("court") ||
      lowerFilename.includes("lawsuit") ||
      lowerFilename.includes("litigation")
    ) {
      return "Legal Document";
    } else if (
      lowerFilename.includes("memo") ||
      lowerFilename.includes("memorandum")
    ) {
      return "Memorandum";
    } else if (
      lowerFilename.includes("letter") ||
      lowerFilename.includes("correspondence")
    ) {
      return "Letter";
    } else if (
      lowerFilename.includes("certificate") ||
      lowerFilename.includes("certification")
    ) {
      return "Certificate";
    } else if (
      lowerFilename.includes("permit") ||
      lowerFilename.includes("license") ||
      lowerFilename.includes("licence")
    ) {
      return "Permit/License";
    } else if (
      lowerFilename.includes("manual") ||
      lowerFilename.includes("guide") ||
      lowerFilename.includes("handbook")
    ) {
      return "Manual/Guide";
    } else if (
      lowerFilename.includes("presentation") ||
      lowerFilename.includes("slides")
    ) {
      return "Presentation";
    } else {
      // Default based on file extension
      if (lowerFilename.endsWith(".pdf")) {
        return "PDF Document";
      } else if (
        lowerFilename.endsWith(".doc") ||
        lowerFilename.endsWith(".docx")
      ) {
        return "Word Document";
      } else if (
        lowerFilename.endsWith(".xls") ||
        lowerFilename.endsWith(".xlsx")
      ) {
        return "Spreadsheet";
      } else if (
        lowerFilename.endsWith(".ppt") ||
        lowerFilename.endsWith(".pptx")
      ) {
        return "Presentation";
      } else if (lowerFilename.endsWith(".txt")) {
        return "Text Document";
      } else {
        return "Document";
      }
    }
  };

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const username = auth.getUsername();
      console.log("🔍 DocumentManager: Fetching documents for user:", username);

      if (!username) {
        toast.error("Please log in to view documents");
        return;
      }

      console.log(
        "🔐 DocumentManager: Auth token:",
        auth.getToken() ? "Present" : "Missing"
      );
      const response = await fileUploadAPI.findFilesByUsername(username);
      console.log("📁 DocumentManager: API Response:", response);

      const documentsData =
        response.data?.files || response.files || response || [];
      console.log("📄 DocumentManager: Documents data:", documentsData);

      // Add mock status and analysis data for demonstration
      const enhancedDocuments = documentsData.map((doc) => ({
        ...doc,
        status: doc.status || "uploaded",
        riskLevel:
          doc.riskLevel ||
          ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        documentType:
          doc.documentType ||
          determineDocumentType(doc.fileName || doc.filename || doc.name),
        analysisComplete: doc.analysisComplete || Math.random() > 0.5,
        uploadDate: doc.uploadDate || new Date().toISOString(),
      }));

      console.log("📋 DocumentManager: Enhanced documents:", enhancedDocuments);
      setDocuments(enhancedDocuments);

      if (enhancedDocuments.length === 0) {
        console.log("ℹ️ DocumentManager: No documents found");
      } else {
        console.log(
          `✅ DocumentManager: Loaded ${enhancedDocuments.length} documents`
        );
      }
    } catch (error) {
      console.error("❌ DocumentManager: Error loading documents:", error);
      const errorInfo = apiUtils.handleError(error);
      toast.error(`Failed to load documents: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      // Get the filename from any of the possible property names
      const filename = doc.fileName || doc.filename || doc.name || "";
      const documentType = doc.documentType || "";

      // Make search case-insensitive and trim whitespace
      const searchQuery = searchTerm.trim().toLowerCase();

      const matchesSearch =
        searchQuery === "" ||
        filename.toLowerCase().includes(searchQuery) ||
        documentType.toLowerCase().includes(searchQuery);

      const matchesFilter =
        filterStatus === "all" || doc.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different property names for filename sorting
      if (sortBy === "filename") {
        aValue = a.fileName || a.filename || a.name || "";
        bValue = b.fileName || b.filename || b.name || "";
      }

      if (sortBy === "uploadDate") {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Delete document
  const handleDeleteDocument = async (documentId) => {
    try {
      await fileUploadAPI.deleteFile(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      toast.success("Document deleted successfully");
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      toast.error(`Failed to delete document: ${errorInfo.message}`);
    }
  };

  // Download document
  const handleDownloadDocument = async (documentId, filename) => {
    try {
      const response = await fileUploadAPI.downloadFile(documentId);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Document downloaded successfully");
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      toast.error(`Failed to download document: ${errorInfo.message}`);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "uploaded":
        return "bg-blue-100 text-blue-800";
      case "analyzing":
        return "bg-yellow-100 text-yellow-800";
      case "analyzed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get risk level color
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "uploaded":
        return <FileTextIcon className="w-4 h-4" />;
      case "analyzing":
        return <LoaderIcon className="w-4 h-4 animate-spin" />;
      case "analyzed":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "error":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <FileTextIcon className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
            <p className="text-gray-600">
              Manage and analyze your legal documents
            </p>
          </div>

          <motion.button
            onClick={fetchDocuments}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshIcon className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="uploaded">Uploaded</option>
              <option value="analyzing">Analyzing</option>
              <option value="analyzed">Analyzed</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="uploadDate">Upload Date</option>
              <option value="filename">Name</option>
              <option value="documentType">Type</option>
              <option value="riskLevel">Risk Level</option>
            </select>

            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoaderIcon className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading documents...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No documents found
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "Upload your first document to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredDocuments.map((document, index) => (
              <motion.div
                key={document.id}
                className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                        <FileTextIcon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {document.fileName ||
                              document.filename ||
                              document.name ||
                              "Untitled Document"}
                          </h3>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {document.documentType}
                            </span>
                            {document.isFinancial && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Financial
                              </span>
                            )}
                          </div>
                          <span className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {formatDate(document.uploadDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {showAnalysisOptions && (
                        <>
                          <motion.button
                            onClick={() => onDocumentSelect?.(document)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Analyze Document"
                          >
                            <FileSearchIcon className="w-5 h-5" />
                          </motion.button>
                        </>
                      )}

                      <motion.button
                        onClick={() =>
                          handleDownloadDocument(
                            document.id,
                            document.fileName ||
                              document.filename ||
                              document.name ||
                              "document"
                          )
                        }
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Download"
                      >
                        <DownloadIcon className="w-5 h-5" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleViewDocument(document)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Document Details Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Document Details
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedDocument(null);
                      setDocumentDetails(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <LoaderIcon className="w-6 h-6 animate-spin text-green-600 mr-2" />
                    <span className="text-gray-600">
                      Loading document details...
                    </span>
                  </div>
                ) : documentDetails ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filename
                      </label>
                      <p className="text-gray-900">
                        {documentDetails.realFilename ||
                          documentDetails.fileName ||
                          documentDetails.filename}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Type
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {documentDetails.documentType}
                        </span>
                        {documentDetails.isFinancial && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Financial
                          </span>
                        )}
                      </div>
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File Size
                      </label>
                      <p className="text-gray-900">
                        {documentDetails.fileSize
                          ? typeof documentDetails.fileSize === "number"
                            ? `${(
                                documentDetails.fileSize /
                                (1024 * 1024)
                              ).toFixed(2)} MB`
                            : documentDetails.fileSize
                          : "Unknown"}
                      </p>
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File Type
                      </label>
                      <p className="text-gray-900">
                        {documentDetails.fileType || "Unknown"}
                      </p>
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Uploaded By
                      </label>
                      <p className="text-gray-900">
                        {documentDetails.username ||
                          documentDetails.uploadedBy ||
                          "Unknown"}
                      </p>
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Date
                      </label>
                      <p className="text-gray-900">
                        {formatDate(
                          documentDetails.createdAt ||
                            documentDetails.uploadDate
                        )}
                      </p>
                    </div>

                    {/* {documentDetails.lastModified &&
                      documentDetails.lastModified !==
                        documentDetails.createdAt && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Modified
                          </label>
                          <p className="text-gray-900">
                            {formatDate(documentDetails.lastModified)}
                          </p>
                        </div>
                      )} */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          documentDetails.status
                        )}`}
                      >
                        {getStatusIcon(documentDetails.status)}
                        <span className="ml-1">{documentDetails.status}</span>
                      </span>
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Risk Level
                      </label>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                          documentDetails.riskLevel
                        )}`}
                      >
                        {documentDetails.riskLevel} risk
                      </span>
                    </div> */}

                    {/* {documentDetails.id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document ID
                        </label>
                        <p className="text-gray-900 font-mono text-sm">
                          {documentDetails.id}
                        </p>
                      </div>
                    )} */}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Failed to load document details
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentManager;

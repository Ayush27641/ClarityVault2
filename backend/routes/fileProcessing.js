const express = require('express');
const router = express.Router();
const {
    upload,
    convertPdfToLanguage,
    translateTextToLanguage,
    extractJargonFromPdf,
    searchVideos,
    findDocumentType,
    analyzeText,
    analyzeHarmfulTerms,
    analyzeContractAndFindAlternatives,
    analyzeLoanDocument
} = require('../controllers/FileProcessingController');

// POST /pdf_translation - Convert PDF to specified language (EXACT MATCH with Java)
router.post('/pdf_translation', upload.single('file'), convertPdfToLanguage);

// POST /text_translation - Translate text to specified language (EXACT MATCH with Java)
router.post('/text_translation', translateTextToLanguage);

// POST /pdf_jargon_extraction - Extract jargon from PDF (EXACT MATCH with Java)
router.post('/pdf_jargon_extraction', upload.single('file'), extractJargonFromPdf);

// GET /search - Search videos (EXACT MATCH with Java)
router.get('/search', searchVideos);

// POST /find_Document_type - Find document type (EXACT MATCH with Java)
router.post('/find_Document_type', upload.single('file'), findDocumentType);

// POST /analyze_text - Analyze text (EXACT MATCH with Java)
router.post('/analyze_text', analyzeText);

// POST /analyze_harmful_terms - Analyze harmful terms (EXACT MATCH with Java)
router.post('/analyze_harmful_terms', upload.single('file'), analyzeHarmfulTerms);

// POST /analyze_contract_alternatives - Analyze contract alternatives (EXACT MATCH with Java)
router.post('/analyze_contract_alternatives', upload.single('file'), analyzeContractAndFindAlternatives);

// POST /analyze_loan_document - Analyze loan document (EXACT MATCH with Java)
router.post('/analyze_loan_document', upload.single('file'), analyzeLoanDocument);

module.exports = router;
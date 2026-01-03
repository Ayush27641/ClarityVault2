const asyncHandler = require('../middleware/asyncHandler');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Import services (you'll need to create these)
const FileProcessingService = require('../services/FileProcessingService');
const YouTubeVideoService = require('../services/YouTubeVideoService');

const fileProcessingService = new FileProcessingService();
const youTubeVideoService = new YouTubeVideoService();

// @desc    Convert PDF to specified language
// @route   POST /api/file-processing/pdf_translation
// @access  Public
const convertPdfToLanguage = asyncHandler(async (req, res) => {
  try {
    const { language } = req.body; // Language from form data
    const pdfFile = req.file; // File from multer

    // Validate that a file was uploaded
    if (!pdfFile) {
      return res.status(400).json("Only PDF files are supported");
    }

    // Validate that the uploaded file is a PDF - EXACT SAME validation as Java
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json("Only PDF files are supported");
    }

    // Create prompt for language conversion - EXACT SAME as Java
    const prompt = `Please convert the content of this PDF document to ${language}. ` +
                  'Maintain the original structure and formatting as much as possible. ' +
                  'Provide a clear and accurate translation of all text content.';

    // Call the service to process the PDF
    const response = await fileProcessingService.getResponse(pdfFile, prompt);

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error processing PDF:', error);
    return res.status(500).json(`Error processing PDF: ${error.message}`);
  }
});

// @desc    Translate text to specified language
// @route   POST /api/file-processing/text_translation  
// @access  Public
const translateTextToLanguage = asyncHandler(async (req, res) => {
  try {
    // Java uses @RequestParam which means form data or query params
    const { text, language } = req.body;

    if (!text || !language) {
      return res.status(500).json('Error translating text: Text and language parameters are required');
    }

    // Get the translation from service - EXACT SAME logic as Java
    const translation = await fileProcessingService.generateTranslation(text, language);

    // Parse the JSON response if it's a string - EXACT SAME logic as Java
    let jsonResponse;
    if (typeof translation === 'string') {
      try {
        jsonResponse = JSON.parse(translation);
      } catch (parseError) {
        return res.status(200).json(translation);
      }
    } else {
      jsonResponse = translation;
    }

    // Extract the translated text from the API response structure - EXACT SAME as Java
    if (jsonResponse.candidates && Array.isArray(jsonResponse.candidates) && jsonResponse.candidates.length > 0) {
      const content = jsonResponse.candidates[0].content;
      if (content && content.parts && Array.isArray(content.parts) && content.parts.length > 0) {
        const translatedText = content.parts[0].text;
        return res.status(200).json(translatedText);
      }
    }

    // If we couldn't extract the text, return the raw response - EXACT SAME as Java
    return res.status(200).json(translation);

  } catch (error) {
    console.error('Error translating text:', error);
    return res.status(500).json(`Error translating text: ${error.message}`);
  }
});

// @desc    Extract jargon from PDF
// @route   POST /api/file-processing/pdf_jargon_extraction
// @access  Public
const extractJargonFromPdf = asyncHandler(async (req, res) => {
  try {
    const { language } = req.body;
    const pdfFile = req.file;

    // Validate that a file was uploaded and is PDF - EXACT SAME validation as Java
    if (!pdfFile || pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json("Only PDF files are supported");
    }

    // EXACT SAME prompt as Java
    const prompt = `Analyze this PDF document to identify and summarize its most important sections and key clauses. ` +
            `Your goal is to make a complex document easy to navigate and understand.\n\n` +
            `For each critical section you identify, provide the output in the following exact format:\n\n` +
            `SECTION: [The name or title of the key section, e.g., 'Limitation of Liability']\n` +
            `PAGE: [The exact page number where the section begins]\n` +
            `SUMMARY: [A brief, easy-to-understand summary of what this section means and its implications, written in ${language}]\n` +
            `---\n\n` +
            `Please focus on locating and explaining sections related to:\n` +
            `- Core obligations and responsibilities of the parties\n` +
            `- Financial elements like payment terms, fees, and penalties\n` +
            `- Legal and liability clauses (Indemnification, Limitation of Liability, Governing Law)\n` +
            `- The duration of the agreement (Term and Termination)\n` +
            `- Confidentiality and data protection\n` +
            `- Dispute resolution processes\n\n` +
            `Provide summaries in ${language} and ensure they are clear and concise for a general audience.`;

    // Call the service to process the PDF
    const response = await fileProcessingService.getResponse(pdfFile, prompt);

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error extracting jargon from PDF:', error);
    return res.status(500).json(`Error extracting jargon from PDF: ${error.message}`);
  }
});

// @desc    Search videos
// @route   GET /api/file-processing/search
// @access  Public
const searchVideos = asyncHandler(async (req, res) => {
  try {
    // Java uses @RequestParam which means query parameters
    const { title, language } = req.query;

    if (!title || !language) {
      return res.status(400).json("Title and language parameters are required");
    }

    // EXACT SAME logic as Java
    const videoLinks = await youTubeVideoService.searchVideosByTitleAndLanguage(title, language);
    
    return res.status(200).json(videoLinks);

  } catch (error) {
    console.error('Error searching videos:', error);
    return res.status(500).json(`Error searching videos: ${error.message}`);
  }
});

// @desc    Find document type
// @route   POST /api/file-processing/find_Document_type
// @access  Public
const findDocumentType = asyncHandler(async (req, res) => {
  try {
    const pdfFile = req.file;

    // EXACT SAME validation as Java
    if (!pdfFile || pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json("Only PDF files are supported");
    }

    // EXACT SAME prompt as Java
    const prompt = 'Identify the type of this document (e.g., contract, invoice, report, etc.) whether' +
            ' it is a legal, financial, or technical document. give it in a single word or short phrase';

    const response = await fileProcessingService.getResponse(pdfFile, prompt);

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error processing PDF:', error);
    return res.status(500).json(`Error processing PDF: ${error.message}`);
  }
});

// @desc    Analyze text
// @route   POST /api/file-processing/analyze_text
// @access  Public
const analyzeText = asyncHandler(async (req, res) => {
  try {
    // Java uses @RequestParam - form data parameters
    const { text, language, documentType } = req.body;

    if (!text || !language || !documentType) {
      return res.status(500).json('Error analyzing text: Text, language, and documentType parameters are required');
    }

    // Get the analysis from service - EXACT SAME logic as Java  
    const analysis = await fileProcessingService.analyzeText(text, language, documentType);

    // Parse the JSON response if it's a string - EXACT SAME logic as Java
    let jsonResponse;
    if (typeof analysis === 'string') {
      try {
        jsonResponse = JSON.parse(analysis);
      } catch (parseError) {
        return res.status(200).json(analysis);
      }
    } else {
      jsonResponse = analysis;
    }

    // Extract the analysis text from the API response structure - EXACT SAME as Java
    if (jsonResponse.candidates && Array.isArray(jsonResponse.candidates) && jsonResponse.candidates.length > 0) {
      const content = jsonResponse.candidates[0].content;
      if (content && content.parts && Array.isArray(content.parts) && content.parts.length > 0) {
        const analysisText = content.parts[0].text;
        return res.status(200).json(analysisText);
      }
    }

    // If we couldn't extract the text, return the raw response - EXACT SAME as Java
    return res.status(200).json(analysis);

  } catch (error) {
    console.error('Error analyzing text:', error);
    return res.status(500).json(`Error analyzing text: ${error.message}`);
  }
});

// @desc    Analyze harmful terms
// @route   POST /api/file-processing/analyze_harmful_terms
// @access  Public
const analyzeHarmfulTerms = asyncHandler(async (req, res) => {
  try {
    const pdfFile = req.file;

    // EXACT SAME validation as Java
    if (!pdfFile || pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json("Only PDF files are supported");
    }

    // EXACT SAME prompt as Java - Create a comprehensive prompt to analyze harmful terms and conditions
    const harmfulTermsPrompt = `Carefully analyze this PDF document to identify potentially harmful, unfair, or risky terms and conditions that could negatively impact the client or party agreeing to this document.\n\n` +
            `For each potentially harmful term or condition you identify, provide the output in the following exact format:\n\n` +
            `HARMFUL TERM: [Brief title of the problematic clause]\n` +
            `PAGE: [Exact page number where this term appears]\n` +
            `RISK LEVEL: [HIGH/MEDIUM/LOW]\n` +
            `DESCRIPTION: [Detailed explanation of what this term means and why it's potentially harmful]\n` +
            `POTENTIAL IMPACT: [How this could negatively affect the client/party]\n` +
            `RECOMMENDATION: [What action should be taken - negotiate, reject, seek legal advice, etc.]\n` +
            `---\n\n` +
            `Focus specifically on identifying:\n` +
            `• Unfair liability clauses that put excessive responsibility on one party\n` +
            `• Hidden fees, penalties, or unexpected charges\n` +
            `• Automatic renewal clauses without clear opt-out mechanisms\n` +
            `• Broad termination rights favoring one party\n` +
            `• Excessive limitation of liability for the service provider\n` +
            `• Broad indemnification requirements\n` +
            `• Unreasonable confidentiality or non-compete clauses\n` +
            `• Vague or ambiguous language that could be interpreted unfavorably\n` +
            `• Unfair dispute resolution mechanisms\n` +
            `• Intellectual property clauses that transfer excessive rights\n` +
            `• Data privacy concerns or broad data usage rights\n` +
            `• Unreasonable performance standards or service level agreements\n\n` +
            `If no harmful terms are found, state: 'NO HARMFUL TERMS IDENTIFIED - This document appears to have fair and balanced terms.'\n\n` +
            `Provide clear, actionable advice for each identified risk.`;

    // Call the service to process the PDF
    const response = await fileProcessingService.getResponse(pdfFile, harmfulTermsPrompt);

    // Extract the text content from Google API response structure
    let harmfulTermsText = '';
    if (response.candidates && Array.isArray(response.candidates) && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts && Array.isArray(content.parts) && content.parts.length > 0) {
        harmfulTermsText = content.parts[0].text;
      }
    }

    // If no harmful terms found, return empty array
    if (!harmfulTermsText || harmfulTermsText.includes('NO HARMFUL TERMS IDENTIFIED')) {
      return res.status(200).json([]);
    }

    try {
      // Try to parse the response as JSON if it looks like structured data
      if (harmfulTermsText.trim().startsWith('[') || harmfulTermsText.trim().startsWith('{')) {
        const parsedTerms = JSON.parse(harmfulTermsText);
        return res.status(200).json(Array.isArray(parsedTerms) ? parsedTerms : [parsedTerms]);
      } else {
        // Parse the structured text format into array of objects
        const terms = [];
        const sections = harmfulTermsText.split('---').filter(section => section.trim());
        
        for (const section of sections) {
          const lines = section.trim().split('\n').filter(line => line.trim());
          const term = {};
          
          for (const line of lines) {
            if (line.includes('HARMFUL TERM:')) {
              term['HARMFUL TERM'] = line.replace('HARMFUL TERM:', '').trim();
            } else if (line.includes('PAGE:')) {
              term['PAGE'] = line.replace('PAGE:', '').trim();
            } else if (line.includes('RISK LEVEL:')) {
              term['RISK LEVEL'] = line.replace('RISK LEVEL:', '').trim();
            } else if (line.includes('DESCRIPTION:')) {
              term['DESCRIPTION'] = line.replace('DESCRIPTION:', '').trim();
            } else if (line.includes('POTENTIAL IMPACT:')) {
              term['POTENTIAL IMPACT'] = line.replace('POTENTIAL IMPACT:', '').trim();
            } else if (line.includes('RECOMMENDATION:')) {
              term['RECOMMENDATION'] = line.replace('RECOMMENDATION:', '').trim();
            }
          }
          
          if (term['HARMFUL TERM']) {
            terms.push(term);
          }
        }
        
        return res.status(200).json(terms);
      }
    } catch (parseError) {
      console.error('Error parsing harmful terms response:', parseError);
      // Return the raw text as a fallback
      return res.status(200).json([{
        'HARMFUL TERM': 'Analysis Result',
        'DESCRIPTION': harmfulTermsText,
        'PAGE': 'N/A',
        'RISK LEVEL': 'Unknown',
        'POTENTIAL IMPACT': 'See description',
        'RECOMMENDATION': 'Review analysis manually'
      }]);
    }

  } catch (error) {
    console.error('Error analyzing harmful terms in PDF:', error);
    return res.status(500).json(`Error analyzing harmful terms in PDF: ${error.message}`);
  }
});

// @desc    Analyze contract alternatives
// @route   POST /api/file-processing/analyze_contract_alternatives
// @access  Public
const analyzeContractAndFindAlternatives = asyncHandler(async (req, res) => {
  try {
    const pdfFile = req.file;

    // EXACT SAME validation as Java
    if (!pdfFile || pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json("Only PDF files are supported");
    }

    // EXACT SAME prompt as Java - Create a comprehensive prompt to analyze the contract and find alternatives
    const contractAnalysisPrompt = `Perform a comprehensive analysis of this contract document and provide alternative contract recommendations based on your knowledge database.\n\n` +
            `PHASE 1 - CONTRACT ANALYSIS:\n` +
            `First, analyze this contract thoroughly and provide:\n\n` +
            `CONTRACT TYPE: [Identify the specific type of contract - e.g., Service Agreement, Employment Contract, Lease Agreement, etc.]\n` +
            `KEY TERMS SUMMARY:\n` +
            `• Duration: [Contract term/duration]\n` +
            `• Financial Terms: [Payment amounts, schedules, fees]\n` +
            `• Main Obligations: [Key responsibilities of each party]\n` +
            `• Termination Conditions: [How and when the contract can be terminated]\n` +
            `• Risk Factors: [Identify any concerning clauses or terms]\n\n` +
            `CONTRACT STRENGTHS:\n` +
            `• [List 3-4 positive aspects of this contract]\n\n` +
            `CONTRACT WEAKNESSES:\n` +
            `• [List 3-4 areas where this contract could be improved]\n\n` +
            `OVERALL RATING: [Rate this contract from 1-10 with brief justification]\n\n` +
            `---\n\n` +
            `PHASE 2 - ALTERNATIVE CONTRACT RECOMMENDATIONS:\n` +
            `Based on the contract type identified, search your knowledge base and provide 4-5 alternative contract templates or approaches that could be better suited. For each alternative, provide:\n\n` +
            `ALTERNATIVE 1: [Name/Type of alternative contract]\n` +
            `DESCRIPTION: [Brief description of this alternative approach]\n` +
            `ADVANTAGES OVER CURRENT CONTRACT:\n` +
            `• [Specific benefits compared to the analyzed contract]\n` +
            `• [How it addresses weaknesses in the current contract]\n` +
            `POTENTIAL DRAWBACKS:\n` +
            `• [Any limitations or downsides of this alternative]\n` +
            `BEST FOR: [What situations or parties this alternative works best for]\n` +
            `RECOMMENDATION SCORE: [Rate 1-10 how much better this is than current contract]\n\n` +
            `[Repeat this format for ALTERNATIVE 2, 3, 4, and 5]\n\n` +
            `---\n\n` +
            `PHASE 3 - FINAL RECOMMENDATIONS:\n` +
            `SHOULD CLIENT KEEP CURRENT CONTRACT?: [Yes/No with detailed reasoning]\n\n` +
            `TOP RECOMMENDED ALTERNATIVE: [Which alternative is best and why]\n\n` +
            `ACTION PLAN:\n` +
            `• [Immediate steps the client should take]\n` +
            `• [Long-term contract strategy recommendations]\n` +
            `• [What to negotiate if staying with current contract]\n\n` +
            `RISK MITIGATION:\n` +
            `• [How to reduce risks in current contract]\n` +
            `• [How alternatives better protect the client]\n\n` +
            `Note: Base your alternative recommendations on widely available contract templates, industry standards, and best practices from your training data. Focus on practical, implementable alternatives that address the specific weaknesses identified in the client's current contract.`;

    // Call the service to process the PDF
    const response = await fileProcessingService.getResponse(pdfFile, contractAnalysisPrompt);

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error analyzing contract and finding alternatives:', error);
    return res.status(500).json(`Error analyzing contract and finding alternatives: ${error.message}`);
  }
});

// @desc    Analyze loan document
// @route   POST /api/file-processing/analyze_loan_document
// @access  Public
const analyzeLoanDocument = asyncHandler(async (req, res) => {
  try {
    const pdfFile = req.file;

    // EXACT SAME validation as Java
    if (!pdfFile || pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json("Only PDF files are supported");
    }

    // EXACT SAME prompt as Java - Create a comprehensive prompt for loan document analysis with EMI calculations
    const loanAnalysisPrompt = `Perform a comprehensive financial analysis of this loan document and provide detailed EMI calculations and payment breakdown.\n\n` +
            `PHASE 1 - LOAN DOCUMENT ANALYSIS:\n` +
            `Extract and analyze the following key information from the loan document:\n\n` +
            `LOAN BASIC DETAILS:\n` +
            `• Loan Type: [Personal Loan/Home Loan/Car Loan/Business Loan/etc.]\n` +
            `• Principal Amount: [Total loan amount sanctioned]\n` +
            `• Interest Rate: [Annual percentage rate - fixed/floating]\n` +
            `• Loan Tenure: [Duration in months/years]\n` +
            `• EMI Amount: [Monthly installment amount if mentioned]\n` +
            `• Processing Fee: [One-time charges]\n` +
            `• Other Charges: [Documentation, legal, insurance, etc.]\n\n` +
            `REPAYMENT TERMS:\n` +
            `• EMI Start Date: [When payments begin]\n` +
            `• EMI Due Date: [Monthly payment date]\n` +
            `• Prepayment Terms: [Partial/full prepayment conditions]\n` +
            `• Late Payment Penalty: [Charges for delayed payments]\n` +
            `• Grace Period: [If any]\n\n` +
            `---\n\n` +
            `PHASE 2 - EMI CALCULATIONS & FINANCIAL BREAKDOWN:\n` +
            `Based on the loan details extracted, calculate and provide:\n\n` +
            `EMI CALCULATION FORMULA:\n` +
            `• Show the EMI calculation using: EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]\n` +
            `• Where P = Principal, R = Monthly interest rate, N = Number of months\n\n` +
            `MONTHLY EMI BREAKDOWN:\n` +
            `• Monthly EMI Amount: ₹[calculated amount]\n` +
            `• Principal Component (Month 1): ₹[amount going toward principal]\n` +
            `• Interest Component (Month 1): ₹[amount going toward interest]\n` +
            `• Outstanding Balance After Month 1: ₹[remaining amount]\n\n` +
            `TOTAL PAYMENT ANALYSIS:\n` +
            `• Total Amount Payable: ₹[EMI × Number of months]\n` +
            `• Total Interest Payable: ₹[Total payable - Principal]\n` +
            `• Interest as % of Principal: [Percentage]\n` +
            `• Total Cost including all charges: ₹[Including processing fee and other charges]\n\n` +
            `YEAR-WISE PAYMENT BREAKDOWN:\n` +
            `For each year of the loan, provide:\n` +
            `Year 1:\n` +
            `• Total EMI Payments: ₹[12 × EMI or remaining months]\n` +
            `• Principal Repaid: ₹[amount]\n` +
            `• Interest Paid: ₹[amount]\n` +
            `• Outstanding Balance at Year End: ₹[amount]\n` +
            `[Repeat for each year until loan completion]\n\n` +
            `Note: All calculations should be precise and based on standard EMI calculation formulas. If any loan details are missing from the document, clearly state what information is needed for complete analysis.`;

    // Call the service to process the PDF
    const response = await fileProcessingService.getResponse(pdfFile, loanAnalysisPrompt);

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error analyzing loan document:', error);
    return res.status(500).json(`Error analyzing loan document: ${error.message}`);
  }
});

module.exports = {
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
}; +

                    "MILESTONE PAYMENTS:\n" +
                    "• 25% of loan repaid by: Month [number] (₹[amount] paid)\n" +
                    "• 50% of loan repaid by: Month [number] (₹[amount] paid)\n" +
                    "• 75% of loan repaid by: Month [number] (₹[amount] paid)\n" +
                    "• 100% of loan repaid by: Month [number] (₹[amount] paid)\n\n" +

                    "---\n\n" +

                    "PHASE 4 - FINANCIAL IMPACT ANALYSIS:\n" +

                    "AFFORDABILITY ASSESSMENT:\n" +
                    "• Recommended Monthly Income: ₹[EMI should be max 40% of income]\n" +
                    "• Debt-to-Income Ratio: [If EMI is 40% of income]\n\n" +

                    "COST OPTIMIZATION SUGGESTIONS:\n" +
                    "• Prepayment Strategy: [How much to save on interest with prepayments]\n" +
                    "• If you prepay ₹[amount] annually: Total interest savings = ₹[amount]\n" +
                    "• If you prepay ₹[amount] in Year 5: Total interest savings = ₹[amount]\n\n" +

                    "RISK FACTORS:\n" +
                    "• Variable Interest Rate Risk: [If applicable]\n" +
                    "• Late Payment Impact: [Additional cost per delayed payment]\n" +
                    "• Prepayment Penalty: [Cost if you want to close loan early]\n\n" +

                    "COMPARISON WITH ALTERNATIVES:\n" +
                    "• If interest rate was 1% lower: Monthly savings = ₹[amount], Total savings = ₹[amount]\n" +
                    "• If tenure was 12 months shorter: Monthly EMI = ₹[amount], Total interest savings = ₹[amount]\n" +
                    "• If tenure was 12 months longer: Monthly EMI = ₹[amount], Additional interest cost = ₹[amount]\n\n" +

                    "---\n\n" +

                    "PHASE 5 - ACTION RECOMMENDATIONS:\n" +

                    "IMMEDIATE ACTIONS:\n" +
                    "• Set up auto-debit for EMI payments\n" +
                    "• Budget ₹[EMI amount + buffer] monthly for loan repayment\n" +
                    "• Review and understand all terms and conditions\n\n" +

                    "FINANCIAL PLANNING:\n" +
                    "• Emergency Fund: Keep ₹[3-6 months of EMI] as backup\n" +
                    "• Prepayment Strategy: [When and how much to prepay for maximum benefit]\n" +
                    "• Insurance: Ensure adequate life/health insurance to cover loan amount\n\n" +

                    "MONITORING:\n" +
                    "• Track payments and outstanding balance monthly\n" +
                    "• Review interest rate changes (if floating rate)\n" +
                    "• Consider refinancing if better rates become available\n\n" +

                    "Note: All calculations should be precise and based on standard EMI calculation formulas. If any loan details are missing from the document, clearly state what information is needed for complete analysis.";
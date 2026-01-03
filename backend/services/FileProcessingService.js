const axios = require('axios');
const FormData = require('form-data');
const Groq = require('groq-sdk');
const { PDFParse } = require('pdf-parse');
require('dotenv').config();

class FileProcessingService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        if (!this.apiKey) {
            throw new Error('GROQ_API_KEY environment variable is required');
        }
        this.groq = new Groq({ apiKey: this.apiKey });
        this.model = 'llama-3.3-70b-versatile';
    }

    async getResponse(file, prompt) {
        try {
            console.log('📄 Processing file:', file.originalname, 'Type:', file.mimetype);
            
            // Extract text from PDF
            let fileText = '';
            if (file.mimetype === 'application/pdf') {
                console.log('📄 Extracting text from PDF...');
                const pdfParser = new PDFParse({ data: file.buffer });
                const pdfData = await pdfParser.getText();
                fileText = pdfData.text;
                console.log('✅ Extracted text length:', fileText.length, 'characters');
                console.log('📝 First 200 characters:', fileText.substring(0, 200));
            } else {
                // For text files, convert to UTF-8
                fileText = file.buffer.toString('utf-8');
            }

            if (!fileText || fileText.trim().length === 0) {
                throw new Error('No text could be extracted from the file');
            }

            return await this.generateContent(fileText, prompt);
        } catch (error) {
            console.error('Error in getResponse:', error);
            throw new Error(`File processing failed: ${error.message}`);
        }
    }

    async generateContent(content, prompt) {
        try {
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: `${prompt}\n\nContent:\n${content}`
                    }
                ],
                model: this.model,
                temperature: 0.7,
                max_tokens: 8000,
            });

            console.log('\n🤖 GROQ RESPONSE (generateContent):');
            console.log('Raw chatCompletion:', JSON.stringify(chatCompletion, null, 2));
            console.log('Message content:', chatCompletion.choices[0]?.message?.content);

            // Transform Groq response to match Gemini format for compatibility
            const transformedResponse = {
                candidates: [
                    {
                        content: {
                            parts: [
                                {
                                    text: chatCompletion.choices[0]?.message?.content || ''
                                }
                            ]
                        }
                    }
                ]
            };
            console.log('Transformed response:', JSON.stringify(transformedResponse, null, 2));

            return transformedResponse;
        } catch (error) {
            console.error('Error generating content:', error);
            throw new Error(`Content generation failed: ${error.message}`);
        }
    }

    async generateTranslation(prompt, language) {
        try {
            const updatedPrompt = ` ${prompt}\n\n` +
                `Given the text above translate the given text in ${language} ` +
                'and maintain the original structure and formatting as much as possible. and dont give extra text';

            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: updatedPrompt
                    }
                ],
                model: this.model,
                temperature: 0.5,
                max_tokens: 8000,
            });

            console.log('\n🌍 GROQ RESPONSE (generateTranslation):');
            console.log('Message content:', chatCompletion.choices[0]?.message?.content);

            // Transform Groq response to match Gemini format
            return {
                candidates: [
                    {
                        content: {
                            parts: [
                                {
                                    text: chatCompletion.choices[0]?.message?.content || ''
                                }
                            ]
                        }
                    }
                ]
            };
        } catch (error) {
            console.error('Error generating translation:', error);
            throw new Error(`Translation failed: ${error.message}`);
        }
    }

    async analyzeText(text, language, documentType) {
        try {
            let analysisPrompt;

            // Check if it's a small section or just wants meaning explanation
            if (documentType.toLowerCase().includes('meaning') || 
                documentType.toLowerCase().includes('definition') ||
                documentType.toLowerCase().includes('explain') || 
                text.length < 500) {

                analysisPrompt = `Explain the meaning and significance of the following text in ${language}:\n\n` +
                    `Text: ${text}\n\n` +
                    `Document/Section Type: ${documentType}\n\n` +
                    `Please provide:\n` +
                    `1. MEANING: Clear explanation of what this text means\n` +
                    `2. KEY TERMS: Definition of any technical, legal, or specialized terms\n` +
                    `3. CONTEXT: Why this is important in the context of ${documentType}\n` +
                    `4. IMPLICATIONS: What this means for the parties involved\n\n` +
                    `Keep the explanation clear and concise in ${language}.`;

            } else {
                // Full document analysis
                analysisPrompt = `Analyze the following ${documentType} document and provide a comprehensive analysis in ${language}:\n\n` +
                    `Document Text: ${text}\n\n` +
                    `Document Type: ${documentType}\n\n` +
                    `Please provide analysis in the following format:\n\n` +
                    `DOCUMENT OVERVIEW:\n` +
                    `- Brief description of this ${documentType} and its purpose\n\n` +
                    `KEY TERMS AND DEFINITIONS:\n` +
                    `- [List and explain any technical, financial, or legal terms specific to ${documentType}]\n\n` +
                    `FINANCIAL CALCULATIONS (if applicable):\n` +
                    `- [For financial documents, perform relevant calculations such as:\n` +
                    `  * Total amounts, interest calculations, payment schedules\n` +
                    `  * Monthly/yearly costs, percentages, rates\n` +
                    `  * Due dates, penalties, late fees]\n\n` +
                    `IMPORTANT CLAUSES AND OBLIGATIONS:\n` +
                    `- [Highlight key responsibilities, rights, and obligations of parties involved]\n\n` +
                    `CRITICAL DATES AND DEADLINES:\n` +
                    `- [Extract and list any important dates, deadlines, or time-sensitive information]\n\n` +
                    `RISKS AND CONCERNS:\n` +
                    `- [Identify potential risks, penalties, or areas of concern specific to ${documentType}]\n\n` +
                    `ACTIONABLE ITEMS:\n` +
                    `- [What actions need to be taken based on this ${documentType}]\n\n` +
                    `SUMMARY:\n` +
                    `- [Provide a concise summary of the document's purpose and main points]\n\n` +
                    `Please ensure all explanations are clear and in ${language} language.`;
            }

            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: analysisPrompt
                    }
                ],
                model: this.model,
                temperature: 0.7,
                max_tokens: 8000,
            });

            console.log('\n📊 GROQ RESPONSE (analyzeText):');
            console.log('Message content:', chatCompletion.choices[0]?.message?.content);

            // Transform Groq response to match Gemini format
            return {
                candidates: [
                    {
                        content: {
                            parts: [
                                {
                                    text: chatCompletion.choices[0]?.message?.content || ''
                                }
                            ]
                        }
                    }
                ]
            };
        } catch (error) {
            console.error('Error analyzing text:', error);
            throw new Error(`Text analysis failed: ${error.message}`);
        }
    }
}

module.exports = FileProcessingService;
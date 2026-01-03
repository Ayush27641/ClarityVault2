"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText as DocumentTextIcon,
  Play as PlayIcon,
  ArrowRight as ArrowRightIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Shield as ShieldCheckIcon,
  Globe as GlobeAltIcon,
  BarChart3 as ChartBarIcon,
  MessageSquare as ChatBubbleLeftRightIcon,
  Eye as EyeIcon,
  Cpu as CpuChipIcon,
  CloudUpload as CloudArrowUpIcon,
  Languages as LanguageIcon,
  Calculator as CalculatorIcon,
  Search as MagnifyingGlassIcon,
  Star as StarIcon,
  Menu as Bars3Icon,
  X as XMarkIcon,
} from "lucide-react";
import { useState } from "react";
import styles from "./LandingPage.module.css";

const LandingPage = () => {
  console.log("🚀 LandingPage component is rendering");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation variants
  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.2,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
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

  // Split title into lines for better mobile display
  const titleLines = [
    "Simplify Docs",
    "Reveal Value",
    // "Understandable",
    // "Insights",
  ];

  const features = [
    {
      icon: CloudArrowUpIcon,
      title: "Document Upload & Translation",
      description:
        "Upload PDFs, DOCX, or images. Get instant translation into any language with AI-powered analysis.",
    },
    {
      icon: EyeIcon,
      title: "Key Information Extraction",
      description:
        "Automatically identifies important sections with page numbers and easy-to-understand summaries.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Risk Assessment & Highlighting",
      description:
        "Flags unfavorable clauses with risk levels and clear explanations of potential issues.",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Interactive Q&A System",
      description:
        "Ask specific questions about any part of your document and get immediate plain-language answers.",
    },
    {
      icon: GlobeAltIcon,
      title: "Multimedia Educational Content",
      description:
        "Get relevant YouTube video links explaining legal concepts in multiple languages.",
    },
    {
      icon: CalculatorIcon,
      title: "Financial Analysis",
      description:
        "EMI calculations, total cost analysis, and market comparisons for financial documents.",
    },
    {
      icon: ChartBarIcon,
      title: "Visual Summaries",
      description:
        "Charts and graphs showing payment schedules, interest accumulation, and fee structures.",
    },
    {
      icon: CpuChipIcon,
      title: "Smart Document Recognition",
      description:
        "AI detects document types for specialized, context-aware analysis and recommendations.",
    },
  ];

  const steps = [
    {
      icon: CloudArrowUpIcon,
      title: "Upload Your Document",
      description:
        "Simply drag and drop or upload any legal document in PDF, DOCX, or image format.",
    },
    {
      icon: CpuChipIcon,
      title: "AI Analysis",
      description:
        "Our advanced AI analyzes the document, identifies key sections, and assesses risks.",
    },
    {
      icon: LanguageIcon,
      title: "Get Plain Language Summary",
      description:
        "Receive clear summaries, risk assessments, and translations in your preferred language.",
    },
    {
      icon: MagnifyingGlassIcon,
      title: "Interactive Exploration",
      description:
        "Ask questions, explore financial implications, and access educational resources.",
    },
  ];

  const benefits = [
    {
      icon: ShieldCheckIcon,
      title: "Proactive Legal Protection",
      description:
        "Avoid potential financial and legal risks by understanding unfavorable clauses before signing.",
    },
    {
      icon: GlobeAltIcon,
      title: "Breaking Language Barriers",
      description:
        "Access legal information in any language, making documents accessible to everyone.",
    },
    {
      icon: EyeIcon,
      title: "Informed Decision-Making",
      description:
        "Make truly informed decisions with clear summaries and explanations of complex terms.",
    },
    {
      icon: ChartBarIcon,
      title: "Market Awareness",
      description:
        "Compare financial products globally to ensure you're getting competitive deals.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content:
        "Clarity Vault AI saved me from signing a terrible lease agreement. The risk assessment highlighted hidden fees I would have missed.",
      rating: 5,
    },
    {
      name: "Miguel Rodriguez",
      role: "First-time Home Buyer",
      content:
        "The financial analysis feature helped me understand my mortgage terms completely. The EMI calculator was spot-on.",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "Freelance Designer",
      content:
        "Finally, a tool that explains legal jargon in plain English. The multilingual support is fantastic for my international clients.",
      rating: 5,
    },
  ];

  return (
    <div className={styles.landingPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <motion.div
            className={styles.headerContent}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.logo}>
              <DocumentTextIcon className={styles.logoIcon} />
              <span className={styles.logoText}>Clarity Vault AI</span>
            </div>

            <nav
              className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}
            >
              <a href="#features" className={styles.navLink}>
                Features
              </a>
              <a href="#how-it-works" className={styles.navLink}>
                How It Works
              </a>
              <a href="#benefits" className={styles.navLink}>
                Benefits
              </a>
              <a href="#pricing" className={styles.navLink}>
                Pricing
              </a>
            </nav>

            <div className={styles.headerActions}>
              <Link to="/login">
                <motion.button
                  className={styles.loginBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  className={styles.signupBtn}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 5px 15px rgba(34, 197, 94, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Link>

              <button
                className={styles.mobileMenuBtn}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
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

        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <motion.h1
                className={styles.heroTitle}
                variants={titleVariants}
                initial="hidden"
                animate="visible"
              >
                {titleLines.map((line, lineIndex) => (
                  <div key={lineIndex} className={styles.titleLine}>
                    {line.split("").map((char, charIndex) => (
                      <motion.span
                        key={`${lineIndex}-${charIndex}`}
                        variants={charVariants}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </div>
                ))}
              </motion.h1>

              <motion.p
                className={styles.heroSubtitle}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Upload any legal document and get instant plain-language
                summaries, risk assessments, and financial analysis. No more
                legal jargon confusion.
              </motion.p>

              <motion.div
                className={styles.heroStats}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <motion.div
                  className={styles.stat}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={styles.statNumber}>95.6%</div>
                  <div className={styles.statLabel}>
                    Users struggle with legal docs
                  </div>
                </motion.div>
                <motion.div
                  className={styles.stat}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={styles.statNumber}>100%</div>
                  <div className={styles.statLabel}>Face language barriers</div>
                </motion.div>
                <motion.div
                  className={styles.stat}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={styles.statNumber}>60.9%</div>
                  <div className={styles.statLabel}>Don't understand T&Cs</div>
                </motion.div>
              </motion.div>

              <motion.div
                className={styles.heroActions}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <Link to="/register">
                  <motion.button
                    className={styles.primaryCta}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span>Start Free Analysis</span>
                    <ArrowRightIcon className={styles.buttonIcon} />
                  </motion.button>
                </Link>

                <Link to="/register">
                  <motion.button
                    className={styles.secondaryCta}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <PlayIcon className={styles.buttonIcon} />
                    <span>Watch Demo</span>
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            <motion.div
              className={styles.heroVisual}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <motion.div
                className={styles.documentPreview}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={styles.documentHeader}>
                  <div className={styles.documentDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className={styles.documentTitle}>
                    <DocumentTextIcon className={styles.headerIcon} />
                    Legal Document Analysis
                  </span>
                </div>

                <div className={styles.documentContent}>
                  <motion.div
                    className={styles.analysisCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.riskBadge}>
                        <ExclamationTriangleIcon className={styles.badgeIcon} />
                        Medium Risk
                      </div>
                    </div>
                    <div className={styles.cardContent}>
                      <h4>Key Findings</h4>
                      <ul>
                        <li>Early termination penalty: $2,500</li>
                        <li>Interest rate increases after 12 months</li>
                        <li>Limited dispute resolution options</li>
                      </ul>
                    </div>
                  </motion.div>

                  <motion.div
                    className={styles.analysisCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.successBadge}>
                        <CheckCircleIcon className={styles.badgeIcon} />
                        Translated
                      </div>
                    </div>
                    <div className={styles.cardContent}>
                      <h4>Plain Language Summary</h4>
                      <p>
                        This contract requires you to pay a fee if you cancel
                        early...
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>
              Powerful Features for Legal Clarity
            </h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to understand and analyze legal documents with
              confidence
            </p>
          </motion.div>

          <motion.div
            className={styles.featuresGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureCard}
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={styles.featureIcon}>
                  <feature.icon />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>How Clarity Vault AI Works</h2>
            <p className={styles.sectionSubtitle}>
              Simple, fast, and accurate legal document analysis in four easy
              steps
            </p>
          </motion.div>

          <div className={styles.stepsContainer}>
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={styles.stepCard}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={styles.stepNumber}>{index + 1}</div>
                <div className={styles.stepIcon}>
                  <step.icon />
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={styles.benefits}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>
              Why Choose Clarity Vault AI?
            </h2>
            <p className={styles.sectionSubtitle}>
              Empowering individuals and businesses with legal clarity and
              protection
            </p>
          </motion.div>

          <motion.div
            className={styles.benefitsGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className={styles.benefitCard}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={styles.benefitIcon}>
                  <benefit.icon />
                </div>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitDescription}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>What Our Users Say</h2>
            <p className={styles.sectionSubtitle}>
              Join thousands of satisfied users who trust Clarity Vault AI
            </p>
          </motion.div>

          <motion.div
            className={styles.testimonialsGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className={styles.testimonialCard}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className={styles.starIcon} />
                  ))}
                </div>
                <p className={styles.testimonialContent}>
                  "{testimonial.content}"
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>{testimonial.name}</h4>
                    <p className={styles.authorRole}>{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className={styles.pricing}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
            <p className={styles.sectionSubtitle}>
              Choose the plan that fits your needs
            </p>
          </motion.div>

          <motion.div
            className={styles.pricingGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className={styles.pricingCard}
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className={styles.planName}>Free</h3>
              <div className={styles.planPrice}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>0</span>
                <span className={styles.period}>/month</span>
              </div>
              <ul className={styles.planFeatures}>
                <li>3 document analyses per month</li>
                <li>Basic risk assessment</li>
                <li>Plain language summaries</li>
                <li>Email support</li>
              </ul>
              <motion.button
                className={styles.planButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </motion.div>

            <motion.div
              className={`${styles.pricingCard} ${styles.featured}`}
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 20px 40px rgba(34, 197, 94, 0.2)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={styles.featuredBadge}>Most Popular</div>
              <h3 className={styles.planName}>Professional</h3>
              <div className={styles.planPrice}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>29</span>
                <span className={styles.period}>/month</span>
              </div>
              <ul className={styles.planFeatures}>
                <li>Unlimited document analyses</li>
                <li>Advanced risk assessment</li>
                <li>Financial analysis & EMI calculator</li>
                <li>Market comparison</li>
                <li>Multi-language support</li>
                <li>Priority support</li>
              </ul>
              <motion.button
                className={`${styles.planButton} ${styles.primary}`}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
              </motion.button>
            </motion.div>

            <motion.div
              className={styles.pricingCard}
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className={styles.planName}>Enterprise</h3>
              <div className={styles.planPrice}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>99</span>
                <span className={styles.period}>/month</span>
              </div>
              <ul className={styles.planFeatures}>
                <li>Everything in Professional</li>
                <li>Team collaboration</li>
                <li>Custom integrations</li>
                <li>Advanced analytics</li>
                <li>Dedicated account manager</li>
                <li>24/7 phone support</li>
              </ul>
              <motion.button
                className={styles.planButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Sales
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.ctaTitle}>
              Ready to Understand Your Legal Documents?
            </h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of users who trust Clarity Vault AI for legal
              document analysis
            </p>
            <motion.div
              className={styles.ctaActions}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.button
                className={styles.ctaPrimary}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Start Free Analysis
                <ArrowRightIcon className={styles.buttonIcon} />
              </motion.button>
              {/* <motion.button
                className={styles.ctaSecondary}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Schedule Demo
              </motion.button> */}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <DocumentTextIcon className={styles.logoIcon} />
                <span className={styles.logoText}>Clarity Vault AI</span>
              </div>
              <p className={styles.footerDescription}>
                Making legal documents accessible and understandable for
                everyone through AI-powered analysis.
              </p>
            </div>

            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4 className={styles.linkGroupTitle}>Product</h4>
                <a href="#features" className={styles.footerLink}>
                  Features
                </a>
                <a href="#pricing" className={styles.footerLink}>
                  Pricing
                </a>
                <a href="#" className={styles.footerLink}>
                  API
                </a>
                <a href="#" className={styles.footerLink}>
                  Security
                </a>
              </div>

              <div className={styles.linkGroup}>
                <h4 className={styles.linkGroupTitle}>Company</h4>
                <a href="#" className={styles.footerLink}>
                  About
                </a>
                <a href="#" className={styles.footerLink}>
                  Blog
                </a>
                <a href="#" className={styles.footerLink}>
                  Careers
                </a>
                <a href="#" className={styles.footerLink}>
                  Contact
                </a>
              </div>

              <div className={styles.linkGroup}>
                <h4 className={styles.linkGroupTitle}>Support</h4>
                <a href="#" className={styles.footerLink}>
                  Help Center
                </a>
                <a href="#" className={styles.footerLink}>
                  Documentation
                </a>
                <a href="#" className={styles.footerLink}>
                  Status
                </a>
                <a href="#" className={styles.footerLink}>
                  Community
                </a>
              </div>

              <div className={styles.linkGroup}>
                <h4 className={styles.linkGroupTitle}>Legal</h4>
                <a href="#" className={styles.footerLink}>
                  Privacy Policy
                </a>
                <a href="#" className={styles.footerLink}>
                  Terms of Service
                </a>
                <a href="#" className={styles.footerLink}>
                  Cookie Policy
                </a>
                <a href="#" className={styles.footerLink}>
                  GDPR
                </a>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.copyright}>
              © 2024 Clarity Vault AI by Team House_Stark. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

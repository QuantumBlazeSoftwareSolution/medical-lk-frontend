"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Globe,
  Heart,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Copy,
  CheckSquare,
  Square,
  AlertCircle,
  Bookmark,
  Clipboard,
} from "lucide-react";
import { BASE_URL } from "@/utils/api";

export default function RegisterWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Step 1 Fields: Business Info
  const [pharmacyName, setPharmacyName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [brNumber, setBrNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [city, setCity] = useState("");

  // Step 2 Fields: Subdomain
  const [subdomain, setSubdomain] = useState("");
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Step 3 Fields: Admin Account
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clipboard success state
  const [copied, setCopied] = useState(false);

  // Generate subdomain slug & suggestions when pharmacy name changes
  useEffect(() => {
    if (pharmacyName && step === 1) {
      const slug = pharmacyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      setSubdomain(slug);

      // Generate suggested alternatives
      if (slug) {
        setSuggestions([
          `${slug}-med`,
          `${slug.replace("-", "")}pharmacy`,
          `${slug}-medical`,
        ]);
      }
    }
  }, [pharmacyName, step]);

  // Real-time subdomain availability check
  const checkSubdomainAvailability = async (sub: string) => {
    if (!sub) {
      setSubdomainAvailable(null);
      return;
    }
    setSubdomainChecking(true);
    setSubdomainAvailable(null);
    try {
      // Call public config endpoint on this subdomain to check if it already exists
      const response = await fetch(`${BASE_URL}/api/tenant/public`, {
        headers: {
          "X-Tenant-Subdomain": sub,
        },
      });
      if (response.ok) {
        setSubdomainAvailable(false); // Subdomain taken (return 200 OK)
      } else {
        setSubdomainAvailable(true); // Subdomain available (returns 404 Not Found)
      }
    } catch {
      setSubdomainAvailable(true);
    } finally {
      setSubdomainChecking(false);
    }
  };

  // Trigger subdomain check when user stops typing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (subdomain && step === 2) {
        checkSubdomainAvailability(subdomain);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [subdomain, step]);

  // Step 1 Validation
  const validateStep1 = () => {
    if (!pharmacyName.trim()) return "Pharmacy Name is required.";
    if (!regNumber.trim()) return "NMRA Registration Number is required.";
    if (!businessEmail.trim()) return "Business Email is required.";
    if (!contactNumber.trim()) return "Contact Number is required.";
    if (!city) return "Please select a city.";
    return "";
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!subdomain.trim()) return "Subdomain is required.";
    if (subdomainAvailable === false) return "This subdomain is already taken.";
    return "";
  };

  // Step 3 Validation
  const validateStep3 = () => {
    if (!fullName.trim()) return "Full Name is required.";
    if (!username.trim()) return "Admin Username is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!agreeTerms) return "You must agree to the Terms and Privacy Policy.";
    return "";
  };

  const handleNext = () => {
    setGlobalError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setGlobalError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setGlobalError(err);
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setGlobalError("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Final Registration Request Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    const err = validateStep3();
    if (err) {
      setGlobalError(err);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pharmacy_name: pharmacyName.trim(),
          subdomain: subdomain.trim().toLowerCase(),
          username: username.trim(),
          email: businessEmail.trim(),
          password: password,
          nmra_number: regNumber.trim(),
          br_number: brNumber.trim() || null,
          contact_number: contactNumber.trim(),
          city: city,
          full_name: fullName.trim(),
          origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to complete registration.");
      }

      setStep(4);
    } catch (err: any) {
      setGlobalError(err.message || "Onboarding failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasNumSymbol = /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  const hasUpperLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const isStrong = hasMinLength && hasNumSymbol && hasUpperLower;

  const copyToClipboard = () => {
    const portalUrl = `http://${subdomain}.localhost:3000/login`;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f7f9fc] text-[#191c1e] font-sans">
      {/* LEFT PANEL: B2B Brand Pitch (Hidden on Mobile) */}
      <aside className="hidden lg:flex lg:w-5/12 bg-[#00273b] relative flex-col justify-between overflow-hidden p-10 select-none">
        {/* Glowing dot grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#a3cbeb_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Header logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-[#6bfe9c]">
              <Shield className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Medical.lk
            </span>
          </div>
        </div>

        {/* Dynamic Image Graphic */}
        <div className="relative z-10 flex-grow flex items-center justify-center py-6">
          <div className="w-full max-w-sm aspect-square bg-[#00273b] rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl">
            <img 
              src="/onboarding-pitch-banner.png" 
              alt="Pharmacy SaaS Interface" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-lighten"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001e2f] via-[#001e2f]/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
              <span className="text-xs uppercase font-bold tracking-widest text-teal-400 mb-2">Sri Lanka B2B Enterprise</span>
              <h3 className="font-display text-xl font-bold leading-snug">
                Clinical-clean software architecture tailored for regulatory compliance.
              </h3>
            </div>
          </div>
        </div>

        {/* Value Proposition list */}
        <div className="relative z-10 bg-gradient-to-t from-[#001e2f]/90 to-transparent pt-12">
          <ul className="space-y-4 mb-8 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <Check className="h-4.5 w-4.5 text-[#6bfe9c] shrink-0" />
              <span>Independent pharmacy subdomain mapping</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4.5 w-4.5 text-[#6bfe9c] shrink-0" />
              <span>3 months full-access free trial usage</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4.5 w-4.5 text-[#6bfe9c] shrink-0" />
              <span>Enterprise stock management & billing POS</span>
            </li>
          </ul>

          {/* Testimonial Quote */}
          <div className="bg-[#0f3d57]/50 backdrop-blur-sm p-4 rounded-xl border border-teal-500/10">
            <p className="text-slate-300 text-xs italic mb-2 leading-relaxed">
              "Signing up for Medical.lk streamlined our stock logistics and
              POS checkout. Highly recommended."
            </p>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide">
              - Perera Medical Pharmacy
            </span>
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL: Form Stepper Wizard */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="lg:hidden bg-white px-6 py-4 border-b border-[#e6e8eb] flex justify-between items-center shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#00273b]" />
            <span className="font-display font-bold text-base text-[#00273b]">
              Medical.lk
            </span>
          </div>
          <Link
            href="/login"
            className="text-xs font-bold text-[#006d37] hover:underline"
          >
            Log In
          </Link>
        </header>

        {/* Form area wrapper */}
        <div className="flex-grow flex flex-col justify-center items-center px-6 py-10 md:py-16">
          <div className="w-full max-w-[560px] space-y-8">
            {/* Step Indicators (Only for steps 1-3) */}
            {step < 4 && (
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > 1
                        ? "bg-[#00273b] text-white"
                        : "bg-[#2ECC71] text-white"
                    }`}
                  >
                    {step > 1 ? <Check className="h-4.5 w-4.5" /> : "1"}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      step >= 1 ? "text-[#00273b]" : "text-slate-400"
                    }`}
                  >
                    Info
                  </span>
                </div>
                <div
                  className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${
                    step > 1 ? "bg-[#2ECC71]" : "bg-slate-200"
                  }`}
                />

                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > 2
                        ? "bg-[#00273b] text-white"
                        : step === 2
                          ? "bg-[#2ECC71] text-white"
                          : "border-2 border-slate-200 text-slate-400"
                    }`}
                  >
                    {step > 2 ? <Check className="h-4.5 w-4.5" /> : "2"}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      step >= 2 ? "text-[#00273b]" : "text-slate-400"
                    }`}
                  >
                    Subdomain
                  </span>
                </div>
                <div
                  className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${
                    step > 2 ? "bg-[#2ECC71]" : "bg-slate-200"
                  }`}
                />

                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === 3
                        ? "bg-[#2ECC71] text-white"
                        : "border-2 border-slate-200 text-slate-400"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      step === 3 ? "text-[#00273b]" : "text-slate-400"
                    }`}
                  >
                    Admin
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {globalError && (
              <div className="p-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

            {/* Card Content wrapper */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.04)]">
              {/* STEP 1: BUSINESS INFO */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#00273b] tracking-tight">
                      Tell us about your pharmacy
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      This information will appear on your public website.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Pharmacy Name *
                      </label>
                      <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                        <Building2 className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Perera Medical Pharmacy"
                          value={pharmacyName}
                          onChange={(e) => setPharmacyName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* NMRA Reg Number */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        NMRA Registration Number *
                      </label>
                      <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                        <ShieldCheck className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="NMRA/PH/COL/2026"
                          value={regNumber}
                          onChange={(e) => setRegNumber(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0 font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* BR Number */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Business Registration (BR) Number
                      </label>
                      <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                        <Bookmark className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. PV 123456"
                          value={brNumber}
                          onChange={(e) => setBrNumber(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* Contact Number & Email */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                          Contact Number *
                        </label>
                        <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                          <Phone className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="077 123 4567"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                          Business Email *
                        </label>
                        <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                          <Mail className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="hello@pharmacy.lk"
                            value={businessEmail}
                            onChange={(e) => setBusinessEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* City Dropdown */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        City Location *
                      </label>
                      <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                        <MapPin className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                        <select
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full pl-11 pr-10 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0 appearance-none text-slate-700"
                        >
                          <option value="">Select a City</option>
                          <option value="Colombo">Colombo</option>
                          <option value="Kandy">Kandy</option>
                          <option value="Galle">Galle</option>
                          <option value="Kurunegala">Kurunegala</option>
                          <option value="Jaffna">Jaffna</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 font-semibold text-white bg-[#2ECC71] hover:bg-[#27AE60] rounded-xl flex items-center gap-2 active:scale-[0.98] transition-all cursor-pointer text-xs"
                    >
                      Continue to Subdomain <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SUBDOMAIN SELECTOR */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#00273b] tracking-tight">
                      Choose Your Pharmacy's Web Address
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      This is where your clients and cashiers will find you.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Subdomain Address Name
                      </label>
                      <div className="flex items-stretch border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                        <input
                          type="text"
                          required
                          placeholder="your-pharmacy"
                          value={subdomain}
                          onChange={(e) =>
                            setSubdomain(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, ""),
                            )
                          }
                          className="flex-grow pl-4 pr-2 py-3 bg-transparent border-0 outline-none text-sm font-mono"
                        />
                        <div className="bg-[#f2f4f7] px-4 py-3 border-l border-slate-200 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-slate-500 font-mono">
                            .medical.lk
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subdomain validation feedback */}
                    {subdomain && (
                      <div className="p-4 rounded-xl border flex items-start gap-3 transition-all animate-fade-in bg-[#f2f4f7] border-slate-200">
                        {subdomainChecking ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 animate-spin text-teal-600 mt-0.5" />
                            <span className="text-xs text-slate-500">
                              Checking availability...
                            </span>
                          </>
                        ) : subdomainAvailable ? (
                          <>
                            <Check className="h-4.5 w-4.5 text-[#006d37] mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-[#006d37]">
                                Address is available!
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Live portal will be generated at:{" "}
                                <span className="underline font-semibold text-teal-700">
                                  {subdomain}.medical.lk
                                </span>
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4.5 w-4.5 text-red-500 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-red-600">
                                Address is taken.
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Please check suggestions below or try another
                                address name.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Suggestions list */}
                    {suggestions.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Suggested Alternatives
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => {
                                setSubdomain(sug);
                                checkSubdomainAvailability(sug);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#E7EBF0] text-[#00273b] hover:bg-[#00273b] hover:text-white transition-all border border-transparent cursor-pointer"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={subdomainAvailable !== true}
                      className="px-6 py-3 font-semibold text-white bg-[#2ECC71] hover:bg-[#27AE60] rounded-xl flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-xs shadow-sm"
                    >
                      Continue to Admin Setup <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ADMIN ACCOUNT CREATION */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#00273b] tracking-tight">
                      Create Your Admin Account
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Master credentials for your secure dashboard portal.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Admin Full Name
                      </label>
                      <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                        <User className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Jane Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* Admin Username */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Admin Username *
                      </label>
                      <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                        <User className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. jane.doe"
                          value={username}
                          onChange={(e) =>
                            setUsername(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9._-]/g, ""),
                            )
                          }
                          className="w-full pl-11 pr-4 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0 font-mono"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Password *
                      </label>
                      <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                        <Lock className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-12 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4.5 w-4.5" />
                          ) : (
                            <Eye className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </div>

                      {/* Password strength details */}
                      {password && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full flex-grow rounded-full transition-all ${
                                hasMinLength ? "bg-[#2ECC71]" : "bg-slate-300"
                              }`}
                            />
                            <div
                              className={`h-full flex-grow rounded-full transition-all ${
                                hasNumSymbol ? "bg-[#2ECC71]" : "bg-slate-300"
                              }`}
                            />
                            <div
                              className={`h-full flex-grow rounded-full transition-all ${
                                hasUpperLower ? "bg-[#2ECC71]" : "bg-slate-300"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-bold block ${isStrong ? "text-[#006d37]" : "text-slate-400"}`}
                          >
                            {isStrong
                              ? "Strong Password ✓"
                              : "Password requires adjustments:"}
                          </span>
                          <ul className="text-[10px] space-y-1 font-medium text-slate-400">
                            <li
                              className={`flex items-center gap-1 ${hasMinLength ? "text-[#006d37]" : ""}`}
                            >
                              <Check className="h-3 w-3" /> 8+ characters
                            </li>
                            <li
                              className={`flex items-center gap-1 ${hasNumSymbol ? "text-[#006d37]" : ""}`}
                            >
                              <Check className="h-3 w-3" /> Number & symbol
                            </li>
                            <li
                              className={`flex items-center gap-1 ${hasUpperLower ? "text-[#006d37]" : ""}`}
                            >
                              <Check className="h-3 w-3" /> Uppercase &
                              lowercase letter
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Confirm Password *
                      </label>
                      <div className="relative flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-[#00273b] focus-within:ring-2 focus-within:ring-[#00273b]/10 transition-all">
                        <Lock className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-transparent border-0 outline-none text-sm focus:ring-0 font-mono"
                        />
                      </div>
                    </div>

                    {/* Terms Checklist */}
                    <div className="flex items-start gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setAgreeTerms(!agreeTerms)}
                        className="text-[#006d37] hover:text-[#005228] p-0.5 cursor-pointer"
                      >
                        {agreeTerms ? (
                          <CheckSquare className="h-4.5 w-4.5" />
                        ) : (
                          <Square className="h-4.5 w-4.5 text-slate-300" />
                        )}
                      </button>
                      <span className="text-xs text-slate-500 leading-normal select-none">
                        I agree to the{" "}
                        <a
                          href="#"
                          className="font-bold text-[#00273b] hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="font-bold text-[#00273b] hover:underline"
                        >
                          Privacy Policy
                        </a>
                        .
                      </span>
                    </div>

                    {/* Security message banner */}
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-teal-50 border border-teal-100 text-teal-900 mt-6">
                      <Lock className="h-4.5 w-4.5 shrink-0 text-teal-600" />
                      <p className="text-[10px] font-medium leading-relaxed">
                        Security Notice: Credentials are encrypted at rest under
                        advanced cryptographic protocols.
                      </p>
                    </div>

                    {/* Form Navigation Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 font-semibold text-white bg-[#2ECC71] hover:bg-[#27AE60] rounded-xl flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-xs"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />{" "}
                            Finalizing...
                          </>
                        ) : (
                          <>
                            Create My Account <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 4: REGISTRATION COMPLETED SUCCESS STATE */}
              {step === 4 && (
                <div className="space-y-8 text-center animate-fade-in-up">
                  {/* Floating success indicator */}
                  <div className="w-20 h-20 bg-emerald-50 text-[#006d37] rounded-full border border-emerald-100 flex items-center justify-center mx-auto shadow-md">
                    <Check className="h-10 w-10 animate-bounce" />
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[#00273b] tracking-tight">
                      Welcome to Medical.lk,
                      <br />
                      <span className="text-[#006d37]">{pharmacyName}!</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                      Your business profile has been verified and your custom
                      subdomain portal is now live.
                    </p>
                  </div>

                  {/* Summary Block */}
                  <div className="bg-[#f7f9fc] border border-[#E2E8F0] p-5 rounded-2xl text-left space-y-4">
                    <h3 className="text-xs font-bold text-[#00273b] uppercase tracking-wide border-b border-slate-200 pb-2">
                      Account Summary
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Subdomain Web Link
                        </span>
                        <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg mt-1 select-all font-mono text-xs text-slate-700">
                          <span className="truncate mr-2">
                            {subdomain}.medical.lk
                          </span>
                          <button
                            type="button"
                            onClick={copyToClipboard}
                            className="text-slate-400 hover:text-teal-600 transition-colors p-1 cursor-pointer"
                            title="Copy link to clipboard"
                          >
                            {copied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Clipboard className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Admin Login Username
                        </span>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-lg mt-1 font-mono text-xs text-slate-700 font-semibold">
                          {username}
                        </div>
                      </div>
                    </div>

                    {/* Confirmation Email Banner */}
                    <div className="mt-2 flex items-start gap-3 bg-teal-50/50 p-3 rounded-lg border border-teal-200/50">
                      <Mail className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-700">
                          A confirmation email with onboarding documents has
                          been sent to <strong>{businessEmail}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <a
                      href={`http://${subdomain}.localhost:3000/login`}
                      className="py-4 px-6 bg-[#006d37] hover:bg-[#005228] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm flex flex-col items-center justify-center gap-1.5"
                    >
                      <Globe className="h-5 w-5 shrink-0" />
                      <span>Go to Dashboard</span>
                    </a>

                    <a
                      href={`http://${subdomain}.localhost:3000`}
                      className="py-4 px-6 bg-white border border-slate-200 hover:bg-[#f7f9fc] text-[#00273b] font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1.5"
                    >
                      <Building2 className="h-5 w-5 shrink-0" />
                      <span>View Public Site</span>
                    </a>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    Need help setting up your POS? Visit our{" "}
                    <a
                      href="#"
                      className="font-bold text-[#00273b] hover:underline"
                    >
                      Onboarding Guide
                    </a>{" "}
                    or contact technical support.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Footer (Desktop) */}
        <footer className="hidden md:block py-6 border-t border-[#e6e8eb] bg-white text-center text-[10px] text-slate-400 shrink-0">
          <p>&copy; 2026 Medical.lk Solutions. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

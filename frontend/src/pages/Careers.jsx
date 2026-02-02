import React, { useState } from 'react';
import { Briefcase, Send, CheckCircle, AlertCircle, Mail, Phone, Upload } from 'lucide-react';
import axios from 'axios';

const Careers = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    address: '',
    employmentStatus: 'fresher',
    yearsOfExperience: '',
    companyName: '',
    role: '',
    resume: null
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
        setError('Only PDF, DOC, and DOCX files are allowed.');
        setResumeFileName('');
        setFormData((prev) => ({ ...prev, resume: null }));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        setResumeFileName('');
        setFormData((prev) => ({ ...prev, resume: null }));
        return;
      }

      setResumeFileName(file.name);
      setFormData((prev) => ({ ...prev, resume: file }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      
      // Validate required fields
      if (!formData.name || !formData.age || !formData.email || !formData.phone || !formData.address || !formData.resume) {
        setError('All required fields must be filled, including resume upload.');
        setLoading(false);
        return;
      }

      if (formData.employmentStatus === 'experienced' && (!formData.yearsOfExperience || !formData.companyName)) {
        setError('Years of experience and company name are required for experienced candidates.');
        setLoading(false);
        return;
      }

      const normalizedPhone = formData.phone.replace(/\D/g, '');
      if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
        setError('Please enter a valid phone number (10-15 digits).');
        setLoading(false);
        return;
      }

      const age = parseInt(formData.age);
      if (age < 18 || age > 75) {
        setError('Age must be between 18 and 75.');
        setLoading(false);
        return;
      }

      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name.trim());
      formDataToSubmit.append('age', age);
      formDataToSubmit.append('email', formData.email.trim());
      formDataToSubmit.append('phone', normalizedPhone);
      formDataToSubmit.append('address', formData.address.trim());
      formDataToSubmit.append('employmentStatus', formData.employmentStatus);
      if (formData.employmentStatus === 'experienced') {
        formDataToSubmit.append('yearsOfExperience', formData.yearsOfExperience);
        formDataToSubmit.append('companyName', formData.companyName.trim());
      }
      if (formData.role) {
        formDataToSubmit.append('role', formData.role.trim());
      }
      formDataToSubmit.append('resume', formData.resume);

      const response = await axios.post(`${API_URL}/careers`, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setFormData({
          name: '',
          age: '',
          email: '',
          phone: '',
          address: '',
          employmentStatus: 'fresher',
          yearsOfExperience: '',
          companyName: '',
          role: '',
          resume: null
        });
        setResumeFileName('');
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-16 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-96 h-96 bg-secondary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <section className="relative z-10 pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <span className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-semibold tracking-wide">
              Careers
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Build Your Future <span className="italic text-secondary">With Us</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Join our team at Jalarams Wedding Couture. Share your details and resume with us today!
          </p>
        </div>
      </section>

      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-surface-dark to-surface-dark/50 border border-primary/20 rounded-2xl p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Why Work With Us</h3>
              <p className="text-white/60 text-sm">
                Join a passionate team crafting premium ethnic wear and delightful customer experiences.
              </p>
            </div>
            <div className="bg-gradient-to-br from-surface-dark to-surface-dark/50 border border-secondary/20 rounded-2xl p-6">
              <h4 className="text-white font-bold mb-3">Reach Us</h4>
              <div className="space-y-3 text-white/60 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-secondary" />
                  <span>jalaramweddingcouture8789@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-secondary" />
                  <span>+91 99987 17666</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-surface-dark/70 border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Apply Now</h2>

              {success && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-400/30 text-green-200 px-4 py-3 rounded-xl mb-6">
                  <CheckCircle className="w-5 h-5" />
                  <span>Your application has been submitted successfully. We will get back to you soon!</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl mb-6">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="75"
                    placeholder="Your age"
                    className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 99987 17666"
                    className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2 text-sm">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Your full address"
                    className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Employment Status */}
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">Employment Status *</label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  >
                    <option value="fresher">Fresher</option>
                    <option value="experienced">Experienced</option>
                  </select>
                </div>

                {/* Years of Experience (Conditional) */}
                {formData.employmentStatus === 'experienced' && (
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Years of Experience *</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      required={formData.employmentStatus === 'experienced'}
                      min="0"
                      placeholder="e.g. 5"
                      className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                )}

                {/* Company Name (Conditional) */}
                {formData.employmentStatus === 'experienced' && (
                  <div className={formData.employmentStatus === 'experienced' ? '' : 'md:col-span-2'}>
                    <label className="block text-white font-semibold mb-2 text-sm">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required={formData.employmentStatus === 'experienced'}
                      placeholder="Your previous company"
                      className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                )}

                {/* Interested Role */}
                <div className={formData.employmentStatus === 'experienced' ? 'md:col-span-2' : 'md:col-span-2'}>
                  <label className="block text-white font-semibold mb-2 text-sm">Interested Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. Fashion Designer, Marketing Manager"
                    className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Resume Upload */}
                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2 text-sm">Upload Resume (PDF, DOC, DOCX) *</label>
                  <div className="relative">
                    <input
                      type="file"
                      name="resume"
                      onChange={handleFileChange}
                      required
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="w-full bg-background-dark/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 file:mr-3 file:py-2 file:px-3 file:bg-primary/20 file:text-primary file:border-0 file:rounded-lg file:text-sm file:font-semibold hover:file:bg-primary/30"
                    />
                    {resumeFileName && (
                      <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {resumeFileName}
                      </p>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-2">Max file size: 10MB. Accepted formats: PDF, DOC, DOCX</p>
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 flex items-center justify-between gap-4">
                  <p className="text-white/50 text-sm">We will reply to the email you provide.</p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-black font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;

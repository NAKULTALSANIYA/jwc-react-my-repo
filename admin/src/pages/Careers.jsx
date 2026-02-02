import React, { useEffect, useState } from 'react';
import { Briefcase, Mail, Phone, CheckCircle, XCircle, Search, FileText, Eye } from 'lucide-react';
import { adminApi } from '../api/admin';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';

const Careers = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionModal, setActionModal] = useState(null); // { type, application }
  const [detailsModal, setDetailsModal] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    loadCareers();
    loadStats();
  }, [statusFilter, searchTerm]);

  const loadCareers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getCareers({
        status: statusFilter,
        search: searchTerm,
        limit: 50
      });
      setApplications(data?.careers || []);
    } catch (err) {
      const message = err.message || 'Failed to load applications';
      setError(message);
      showError(message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminApi.getCareerStats();
      setStats(data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const openActionModal = (type, application) => {
    setActionModal({ type, application });
    setResponseMessage(application?.adminResponse || '');
  };

  const closeActionModal = () => {
    setActionModal(null);
    setResponseMessage('');
  };

  const openDetailsModal = (application) => {
    setDetailsModal(application);
  };

  const closeDetailsModal = () => {
    setDetailsModal(null);
  };

  const handleSubmitAction = async () => {
    if (!actionModal?.application) return;
    if (!responseMessage.trim()) {
      showError('Response message is required');
      return;
    }

    try {
      setSubmitting(true);
      const { type, application } = actionModal;
      const payload = { responseMessage: responseMessage.trim() };
      if (type === 'approve') {
        await adminApi.approveCareer(application._id, payload);
        showSuccess('Application approved and email sent');
      } else {
        await adminApi.rejectCareer(application._id, payload);
        showSuccess('Application rejected and email sent');
      }
      await loadCareers();
      await loadStats();
      closeActionModal();
    } catch (err) {
      const message = err.message || 'Failed to update application';
      setError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    if (status === 'approved') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const buildResumeUrl = (resumePath) => {
    if (!resumePath) return '';
    if (/^https?:\/\//i.test(resumePath)) return resumePath;
    const base = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : (typeof window !== 'undefined' ? window.location.origin : '');
    if (!base) return resumePath;
    const normalizedPath = resumePath.startsWith('/') ? resumePath : `/${resumePath}`;
    return `${base}${normalizedPath}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Career Applications</h1>
        <p className="text-slate-600">Review and respond to career submissions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-50' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-50' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-50' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-50' }
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-4 border border-slate-200`}>
            <p className="text-slate-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 w-80">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Applicant</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Address</th>
                <th className="px-6 py-4 font-semibold">Experience</th>
                <th className="px-6 py-4 font-semibold">Resume</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Applied</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-500" colSpan={8}>
                    <Loader label="Loading applications..." />
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="px-6 py-4 text-sm text-rose-600" colSpan={8}>{error}</td>
                </tr>
              )}
              {!loading && !error && applications.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-sm text-slate-500" colSpan={8}>No career applications found.</td>
                </tr>
              )}
              {!loading && !error && applications.map((application) => {
                const resumeUrl = buildResumeUrl(application.resumePath);
                const experienceLabel = application.employmentStatus === 'experienced'
                  ? `${application.yearsOfExperience || 0} yrs${application.companyName ? ` • ${application.companyName}` : ''}`
                  : 'Fresher';

                return (
                  <tr key={application._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-slate-900">{application.name}</p>
                        <p className="text-xs text-slate-500">Age: {application.age || '—'}</p>
                        {application.role && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Briefcase size={12} /> {application.role}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <a href={`mailto:${application.email}`} className="hover:text-blue-600">
                            {application.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <a href={`tel:${application.phone}`} className="hover:text-blue-600">
                            {application.phone}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 max-w-xs whitespace-pre-wrap">
                        {application.address || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{experienceLabel}</p>
                    </td>
                    <td className="px-6 py-4">
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 text-sm font-semibold hover:underline"
                        >
                          <FileText size={16} /> View Resume
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(application.status)}`}>
                        {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500">{formatDate(application.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openDetailsModal(application)}
                          className="inline-flex items-center gap-2 text-blue-600 text-sm font-semibold hover:underline"
                        >
                          <Eye size={16} /> Details
                        </button>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openActionModal('approve', application)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            onClick={() => openActionModal('reject', application)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {actionModal.type === 'approve' ? 'Approve Application' : 'Reject Application'}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Send a response to {actionModal.application.name} via email.
            </p>
            <textarea
              rows={6}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Write your response..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={closeActionModal}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send & Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
                <p className="text-sm text-slate-600">{detailsModal.name}</p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium">{detailsModal.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium">{detailsModal.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Age</p>
                <p className="font-medium">{detailsModal.age || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Role</p>
                <p className="font-medium">{detailsModal.role || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500">Address</p>
                <p className="font-medium whitespace-pre-wrap">{detailsModal.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Employment</p>
                <p className="font-medium">{detailsModal.employmentStatus === 'experienced' ? 'Experienced' : 'Fresher'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Experience</p>
                <p className="font-medium">
                  {detailsModal.employmentStatus === 'experienced'
                    ? `${detailsModal.yearsOfExperience || 0} yrs${detailsModal.companyName ? ` • ${detailsModal.companyName}` : ''}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <p className="font-medium">{detailsModal.status}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Applied</p>
                <p className="font-medium">{formatDate(detailsModal.createdAt)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500">Resume</p>
                {detailsModal.resumePath ? (
                  <a
                    href={buildResumeUrl(detailsModal.resumePath)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                  >
                    <FileText size={16} /> View Resume
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
              {detailsModal.adminResponse && (
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500">Admin Response</p>
                  <p className="font-medium whitespace-pre-wrap">{detailsModal.adminResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;

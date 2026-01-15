import React, { useEffect, useState } from 'react';
import {
    Mail,
    Phone,
    MessageSquare,
    MoreVertical,
    Search,
    Filter,
    CheckCircle,
    Eye,
    Trash2,
    ChevronDown
} from 'lucide-react';
import { adminApi } from '../api/admin';
import Loader from '../components/Loader';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ total: 0, new: 0, read: 0, responded: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [markingStatus, setMarkingStatus] = useState(null);
    const [page, setPage] = useState(1);

    // Load contacts and stats
    useEffect(() => {
        loadContacts();
        loadStats();
    }, [page, statusFilter, searchTerm]);

    const loadContacts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await adminApi.getContacts({
                page,
                limit: 10,
                status: statusFilter,
                search: searchTerm
            });
            setContacts(data?.contacts || []);
        } catch (err) {
            setError(err.message || 'Failed to load contacts');
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await adminApi.getContactStats();
            setStats(data?.stats || {});
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const handleDeleteContact = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;

        try {
            await adminApi.deleteContact(id);
            setContacts(contacts.filter(c => c._id !== id));
            loadStats();
        } catch (err) {
            setError(err.message || 'Failed to delete contact');
        }
    };

    const handleViewContact = (contact) => {
        setSelectedContact(contact);
        setAdminNotes(contact.adminNotes || '');
        setShowModal(true);
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            setMarkingStatus(id);
            await adminApi.updateContactStatus(id, { status });
            setContacts(contacts.map(c => c._id === id ? { ...c, status } : c));
            loadStats();
            if (selectedContact?._id === id) {
                setSelectedContact({ ...selectedContact, status });
            }
        } catch (err) {
            setError(err.message || 'Failed to update status');
        } finally {
            setMarkingStatus(null);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedContact) return;

        try {
            await adminApi.addAdminNotes(selectedContact._id, { adminNotes });
            setSelectedContact({ ...selectedContact, adminNotes });
            setContacts(contacts.map(c =>
                c._id === selectedContact._id ? { ...c, adminNotes } : c
            ));
        } catch (err) {
            setError(err.message || 'Failed to save notes');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'read':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'responded':
                return 'bg-green-500/20 text-green-400 border-green-500/50';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Contact Messages</h1>
                <p className="text-slate-600">Manage customer inquiries and messages</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Messages', value: stats.total, color: 'bg-blue-50' },
                    { label: 'New', value: stats.new, color: 'bg-blue-50' },
                    { label: 'Read', value: stats.read, color: 'bg-yellow-50' },
                    { label: 'Responded', value: stats.responded, color: 'bg-green-50' }
                ].map((stat, idx) => (
                    <div key={idx} className={`${stat.color} rounded-lg p-4 border border-slate-200`}>
                        <p className="text-slate-600 text-sm">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or message..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="responded">Responded</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Contacts List */}
            {loading ? (
                <Loader />
            ) : contacts.length === 0 ? (
                <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                    <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">No contact messages found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {contacts.map((contact) => (
                        <div key={contact._id} className="bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === contact._id ? null : contact._id)}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-slate-900 truncate">{contact.name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(contact.status)}`}>
                                                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-600 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} />
                                                <a href={`mailto:${contact.email}`} className="hover:text-blue-600 truncate">
                                                    {contact.email}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={16} />
                                                <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                                                    {contact.phone}
                                                </a>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">
                                            <span className="font-semibold">Subject:</span> {contact.subject}
                                        </p>
                                        <p className="text-xs text-slate-500">{formatDate(contact.createdAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewContact(contact);
                                            }}
                                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} className="text-blue-600" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteContact(contact._id);
                                            }}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} className="text-red-600" />
                                        </button>
                                        <ChevronDown
                                            size={20}
                                            className={`text-slate-400 transition-transform ${expandedId === contact._id ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === contact._id && (
                                <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Message</h4>
                                        <p className="text-slate-700 whitespace-pre-wrap">{contact.message}</p>
                                    </div>

                                    {contact.adminNotes && (
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Admin Notes</h4>
                                            <p className="text-slate-700 whitespace-pre-wrap">{contact.adminNotes}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {contact.status !== 'responded' && (
                                            <button
                                                onClick={() => handleUpdateStatus(contact._id, 'responded')}
                                                disabled={markingStatus === contact._id}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                            >
                                                {markingStatus === contact._id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={18} />
                                                        Mark Responded
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleViewContact(contact)}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                                        >
                                            View & Reply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for detailed view and reply */}
            {showModal && selectedContact && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Contact Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-600 hover:text-slate-900"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-600 text-sm">Name</p>
                                    <p className="font-semibold text-slate-900">{selectedContact.name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600 text-sm">Email</p>
                                    <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                                        {selectedContact.email}
                                    </a>
                                </div>
                                <div>
                                    <p className="text-slate-600 text-sm">Phone</p>
                                    <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">
                                        {selectedContact.phone}
                                    </a>
                                </div>
                                <div>
                                    <p className="text-slate-600 text-sm">Subject</p>
                                    <p className="font-semibold text-slate-900">{selectedContact.subject}</p>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <p className="text-slate-600 text-sm mb-2">Message</p>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <p className="text-slate-900 whitespace-pre-wrap">{selectedContact.message}</p>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-slate-600 text-sm mb-3">Status</p>
                                <div className="flex gap-2">
                                    {['new', 'read', 'responded'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(selectedContact._id, status)}
                                            disabled={selectedContact.status === status || markingStatus === selectedContact._id}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${selectedContact.status === status
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-slate-600 text-sm mb-2">Admin Notes</p>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes for this contact..."
                                    rows="4"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleSaveNotes}
                                    className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Save Notes
                                </button>
                            </div>

                            {/* Metadata */}
                            <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 space-y-1">
                                <p>Created: {formatDate(selectedContact.createdAt)}</p>
                                <p>Updated: {formatDate(selectedContact.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contacts;

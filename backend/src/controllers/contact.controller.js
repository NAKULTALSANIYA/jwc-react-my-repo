import Contact from '../models/contact.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

class ContactController {
    // Public route - Submit contact form
    async submitContact(req, res, next) {
        try {
            const { name, email, phone, subject, message } = req.body;

            // Validate required fields
            if (!name || !email || !phone || !subject || !message) {
                throw new ApiError(400, 'All fields are required');
            }

            // Check if email already submitted recently (prevent spam)
            const recentContact = await Contact.findOne({
                email,
                createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last 1 hour
            });

            if (recentContact) {
                throw new ApiError(429, 'Please wait before submitting another message from this email');
            }

            const contact = new Contact({
                name,
                email,
                phone,
                subject,
                message
            });

            await contact.save();

            return ApiResponse.success(res, 'Your message has been submitted successfully. We will get back to you soon!', { contact }, 201);
        } catch (error) {
            next(error);
        }
    }

    // Admin route - Get all contact messages
    async getAllContacts(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                status = 'all',
                search = '',
                sortBy = 'createdAt',
                order = 'desc'
            } = req.query;

            const skip = (page - 1) * limit;
            const sortObj = { [sortBy]: order === 'asc' ? 1 : -1 };

            // Build filter
            const filter = {};
            if (status && status !== 'all') {
                filter.status = status;
            }

            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { message: { $regex: search, $options: 'i' } }
                ];
            }

            // Get contacts with pagination
            const contacts = await Contact.find(filter)
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit))
                .exec();

            // Get total count
            const total = await Contact.countDocuments(filter);

            const pagination = {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            };

            return ApiResponse.success(res, 'Contacts retrieved successfully', {
                contacts,
                pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // Admin route - Get single contact
    async getContactById(req, res, next) {
        try {
            const { id } = req.params;

            const contact = await Contact.findByIdAndUpdate(
                id,
                { status: 'read' },
                { new: true }
            );

            if (!contact) {
                throw new ApiError(404, 'Contact not found');
            }

            return ApiResponse.success(res, 'Contact retrieved successfully', { contact });
        } catch (error) {
            next(error);
        }
    }

    // Admin route - Update contact status
    async updateContactStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, adminNotes } = req.body;

            if (!status) {
                throw new ApiError(400, 'Status is required');
            }

            if (!['new', 'read', 'responded'].includes(status)) {
                throw new ApiError(400, 'Invalid status. Must be new, read, or responded');
            }

            const contact = await Contact.findByIdAndUpdate(
                id,
                { status, adminNotes: adminNotes || '' },
                { new: true }
            );

            if (!contact) {
                throw new ApiError(404, 'Contact not found');
            }

            return ApiResponse.success(res, 'Contact updated successfully', { contact });
        } catch (error) {
            next(error);
        }
    }

    // Admin route - Add admin notes
    async addAdminNotes(req, res, next) {
        try {
            const { id } = req.params;
            const { adminNotes } = req.body;

            if (!adminNotes) {
                throw new ApiError(400, 'Admin notes are required');
            }

            const contact = await Contact.findByIdAndUpdate(
                id,
                { adminNotes },
                { new: true }
            );

            if (!contact) {
                throw new ApiError(404, 'Contact not found');
            }

            return ApiResponse.success(res, 'Admin notes added successfully', { contact });
        } catch (error) {
            next(error);
        }
    }

    // Admin route - Delete contact
    async deleteContact(req, res, next) {
        try {
            const { id } = req.params;

            const contact = await Contact.findByIdAndDelete(id);

            if (!contact) {
                throw new ApiError(404, 'Contact not found');
            }

            return ApiResponse.success(res, 'Contact deleted successfully', { contact });
        } catch (error) {
            next(error);
        }
    }

    // Admin route - Get contact statistics
    async getContactStats(req, res, next) {
        try {
            const stats = await Contact.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const totalContacts = await Contact.countDocuments();

            const formattedStats = {
                total: totalContacts,
                new: 0,
                read: 0,
                responded: 0
            };

            stats.forEach(stat => {
                formattedStats[stat._id] = stat.count;
            });

            return ApiResponse.success(res, 'Contact statistics retrieved', { stats: formattedStats });
        } catch (error) {
            next(error);
        }
    }
}

export default new ContactController();

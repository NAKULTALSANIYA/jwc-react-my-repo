import Career from '../models/career.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import emailService from '../services/email.service.js';
import path from 'path';

class CareerController {
  // Public - submit career application
  async submitCareer(req, res, next) {
    try {
      const { name, age, email, phone, address, employmentStatus, yearsOfExperience, companyName, role } = req.body;

      if (!name || !age || !email || !phone || !address || !employmentStatus) {
        throw new ApiError(400, 'All required fields must be filled');
      }

      if (employmentStatus === 'experienced' && (!yearsOfExperience || !companyName)) {
        throw new ApiError(400, 'Years of experience and company name are required for experienced candidates');
      }

      if (!req.file) {
        throw new ApiError(400, 'Resume file is required');
      }

      // Check for recent applications from same email (allow one per day)
      const recentApplication = await Career.findOne({
        email,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (recentApplication) {
        throw new ApiError(429, 'You can only submit one application per day. Please try again later.');
      }

      const career = await Career.create({
        name,
        age: parseInt(age),
        email,
        phone,
        address,
        employmentStatus,
        yearsOfExperience: employmentStatus === 'experienced' ? parseInt(yearsOfExperience) : null,
        companyName: employmentStatus === 'experienced' ? companyName : null,
        role: role || 'Not specified',
        resumePath: `/uploads/resumes/${req.file.filename}`,
        resumeOriginalName: req.file.originalname
      });

      return ApiResponse.success(
        res,
        'Your application has been submitted successfully. We will get back to you soon!',
        { career },
        201
      );
    } catch (error) {
      // Delete uploaded file if there's an error
      if (req.file) {
        const fs = await import('fs');
        const filePath = path.join(path.dirname(new URL(import.meta.url).pathname), `../../uploads/resumes/${req.file.filename}`);
        fs.default.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      next(error);
    }
  }

  // Admin - get all applications
  async getAllCareers(req, res, next) {
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

      const filter = {};
      if (status && status !== 'all') {
        filter.status = status;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      const careers = await Career.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .exec();

      const total = await Career.countDocuments(filter);

      return ApiResponse.success(res, 'Career applications retrieved successfully', {
        careers,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin - get single application
  async getCareerById(req, res, next) {
    try {
      const { id } = req.params;
      const career = await Career.findById(id);

      if (!career) {
        throw new ApiError(404, 'Application not found');
      }

      return ApiResponse.success(res, 'Career application retrieved', { career });
    } catch (error) {
      next(error);
    }
  }

  // Admin - approve application
  async approveCareer(req, res, next) {
    try {
      const { id } = req.params;
      const { responseMessage } = req.body;
      const adminId = req.user.id;

      if (!responseMessage) {
        throw new ApiError(400, 'Response message is required');
      }

      const career = await Career.findByIdAndUpdate(
        id,
        {
          status: 'approved',
          adminResponse: responseMessage,
          decidedBy: adminId,
          decidedAt: new Date()
        },
        { new: true }
      );

      if (!career) {
        throw new ApiError(404, 'Application not found');
      }

      await emailService.sendCareerStatusEmail({
        email: career.email,
        name: career.name,
        role: career.role,
        status: 'approved',
        responseMessage
      });

      return ApiResponse.success(res, 'Application approved successfully', { career });
    } catch (error) {
      next(error);
    }
  }

  // Admin - reject application
  async rejectCareer(req, res, next) {
    try {
      const { id } = req.params;
      const { responseMessage } = req.body;
      const adminId = req.user.id;

      if (!responseMessage) {
        throw new ApiError(400, 'Response message is required');
      }

      const career = await Career.findByIdAndUpdate(
        id,
        {
          status: 'rejected',
          adminResponse: responseMessage,
          decidedBy: adminId,
          decidedAt: new Date()
        },
        { new: true }
      );

      if (!career) {
        throw new ApiError(404, 'Application not found');
      }

      await emailService.sendCareerStatusEmail({
        email: career.email,
        name: career.name,
        role: career.role,
        status: 'rejected',
        responseMessage
      });

      return ApiResponse.success(res, 'Application rejected successfully', { career });
    } catch (error) {
      next(error);
    }
  }

  // Admin - stats
  async getCareerStats(req, res, next) {
    try {
      const stats = await Career.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const total = await Career.countDocuments();
      const formattedStats = {
        total,
        pending: 0,
        approved: 0,
        rejected: 0
      };

      stats.forEach(stat => {
        formattedStats[stat._id] = stat.count;
      });

      return ApiResponse.success(res, 'Career statistics retrieved', { stats: formattedStats });
    } catch (error) {
      next(error);
    }
  }
}

export default new CareerController();

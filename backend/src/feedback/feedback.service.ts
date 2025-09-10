// src/services/feedback.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument, FeedbackType, FeedbackStatus } from '../feedback/schemas/feedback.schema';
import { CreateFeedbackDto, UpdateFeedbackDto } from '../feedback/dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async createFeedback(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = new this.feedbackModel({
      ...createFeedbackDto,
      status: FeedbackStatus.PENDING,
    });
    return feedback.save();
  }

  async findAllFeedback(adminView: boolean = false): Promise<Feedback[]> {
    const query = adminView ? {} : { isPublic: true };
    return this.feedbackModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPublicFeedback(): Promise<Feedback[]> {
    return this.feedbackModel
      .find({ 
        isPublic: true,
        $or: [
          { type: FeedbackType.SURVIVAL_STORY },
          { type: FeedbackType.RESISTANCE_TIP },
          { type: FeedbackType.GENERAL_FEEDBACK }
        ]
      })
      .sort({ upvotes: -1, createdAt: -1 })
      .exec();
  }

  async findResistanceTips(): Promise<Feedback[]> {
    return this.feedbackModel
      .find({ 
        type: FeedbackType.RESISTANCE_TIP,
        isPublic: true 
      })
      .sort({ upvotes: -1 })
      .limit(20)
      .exec();
  }

  async findSurvivalStories(): Promise<Feedback[]> {
    return this.feedbackModel
      .find({ 
        type: FeedbackType.SURVIVAL_STORY,
        isPublic: true 
      })
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(10)
      .exec();
  }

  async findSlaveReports(): Promise<Feedback[]> {
    return this.feedbackModel
      .find({ 
        type: FeedbackType.SLAVE_ACTIVITY_REPORT 
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findFeedbackById(id: string): Promise<Feedback> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }
    return feedback;
  }

  async updateFeedback(id: string, updateFeedbackDto: UpdateFeedbackDto, adminId?: string): Promise<Feedback> {
    const updateData = { ...updateFeedbackDto };
    
    if (adminId) {
      updateData['reviewedBy'] = adminId;
      updateData['reviewedAt'] = new Date();
    }

    const updatedFeedback = await this.feedbackModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updatedFeedback) {
      throw new NotFoundException('Feedback not found');
    }
    
    return updatedFeedback;
  }

  async deleteFeedback(id: string): Promise<void> {
    const result = await this.feedbackModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Feedback not found');
    }
  }

  async voteFeedback(id: string, voteType: 'upvote' | 'downvote'): Promise<Feedback> {
    const feedback = await this.findFeedbackById(id);
    
    const updateField = voteType === 'upvote' ? { upvotes: feedback.upvotes + 1 } : { downvotes: feedback.downvotes + 1 };
    
    return this.feedbackModel.findByIdAndUpdate(id, updateField, { new: true }).exec();
  }

  async getFeedbackStats(): Promise<{
    total: number;
    byType: any;
    byStatus: any;
    topRatedTips: Feedback[];
    recentReports: Feedback[];
  }> {
    const allFeedback = await this.feedbackModel.find().exec();
    
    const stats = {
      total: allFeedback.length,
      byType: {
        slaveActivityReport: 0,
        survivalStory: 0,
        resistanceTip: 0,
        bugReport: 0,
        generalFeedback: 0,
      },
      byStatus: {
        pending: 0,
        reviewed: 0,
        resolved: 0,
        dismissed: 0,
      },
      topRatedTips: [],
      recentReports: [],
    };

    // Count by type and status
    allFeedback.forEach(feedback => {
      // Count by type
      switch (feedback.type) {
        case FeedbackType.SLAVE_ACTIVITY_REPORT:
          stats.byType.slaveActivityReport++;
          break;
        case FeedbackType.SURVIVAL_STORY:
          stats.byType.survivalStory++;
          break;
        case FeedbackType.RESISTANCE_TIP:
          stats.byType.resistanceTip++;
          break;
        case FeedbackType.BUG_REPORT:
          stats.byType.bugReport++;
          break;
        case FeedbackType.GENERAL_FEEDBACK:
          stats.byType.generalFeedback++;
          break;
      }

      // Count by status
      switch (feedback.status) {
        case FeedbackStatus.PENDING:
          stats.byStatus.pending++;
          break;
        case FeedbackStatus.REVIEWED:
          stats.byStatus.reviewed++;
          break;
        case FeedbackStatus.RESOLVED:
          stats.byStatus.resolved++;
          break;
        case FeedbackStatus.DISMISSED:
          stats.byStatus.dismissed++;
          break;
      }
    });

    // Get top rated tips
    stats.topRatedTips = await this.feedbackModel
      .find({ type: FeedbackType.RESISTANCE_TIP })
      .sort({ upvotes: -1 })
      .limit(5)
      .exec();

    // Get recent reports
    stats.recentReports = await this.feedbackModel
      .find({ type: FeedbackType.SLAVE_ACTIVITY_REPORT })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    return stats;
  }
}
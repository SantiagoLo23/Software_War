import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Feedback,
  FeedbackDocument,
  FeedbackType,
} from '../feedback/schemas/feedback.schema';
import { CreateFeedbackDto } from '../feedback/dto/create-feedback.dto';
import { VoteType } from '../feedback/dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  private sanitizePublicFeedback(
    feedback: FeedbackDocument,
  ): Partial<Feedback> {
    const { reporterEmail, reporterName, ...rest } = feedback.toObject();
    return rest;
  }

  async createFeedback(
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<FeedbackDocument> {
    const feedback = new this.feedbackModel({
      ...createFeedbackDto,
    });
    return feedback.save();
  }

  async findResistanceTips(): Promise<Partial<Feedback>[]> {
    const feedbacks = await this.feedbackModel
      .find({ type: FeedbackType.RESISTANCE_TIP })
      .sort({ upvotes: -1, createdAt: -1 })
      .exec();

    return feedbacks.map(this.sanitizePublicFeedback);
  }

  async findSurvivalStories(): Promise<Partial<Feedback>[]> {
    const feedbacks = await this.feedbackModel
      .find({ type: FeedbackType.SURVIVAL_STORY })
      .sort({ upvotes: -1, createdAt: -1 })
      .exec();

    return feedbacks.map(this.sanitizePublicFeedback);
  }

  async findSlaveActivityReports(): Promise<Partial<Feedback>[]> {
    const feedbacks = await this.feedbackModel
      .find({ type: FeedbackType.SLAVE_ACTIVITY_REPORT })
      .sort({ upvotes: -1, createdAt: -1 })
      .exec();

    return feedbacks.map(this.sanitizePublicFeedback);
  }

  async voteFeedback(
    id: string,
    voteType: VoteType,
    userId: string,
  ): Promise<FeedbackDocument> {
    if (!userId) {
      throw new BadRequestException('User id required to vote.');
    }

    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) throw new NotFoundException('Feedback not found');

    const hasUpvoted = feedback.upvoters.includes(userId);
    const hasDownvoted = feedback.downvoters.includes(userId);

    if (
      (voteType === 'upvote' && hasUpvoted) ||
      (voteType === 'downvote' && hasDownvoted)
    ) {
      if (voteType === 'upvote') {
        feedback.upvoters = feedback.upvoters.filter((u) => u !== userId);
        feedback.upvotes = Math.max(0, feedback.upvotes - 1);
      } else {
        feedback.downvoters = feedback.downvoters.filter((u) => u !== userId);
        feedback.downvotes = Math.max(0, feedback.downvotes - 1);
      }
      return feedback.save();
    }

    if (voteType === 'upvote') {
      if (hasDownvoted) {
        feedback.downvoters = feedback.downvoters.filter((u) => u !== userId);
        feedback.downvotes = Math.max(0, feedback.downvotes - 1);
      }
      feedback.upvoters.push(userId);
      feedback.upvotes = (feedback.upvotes || 0) + 1;
    } else {
      if (hasUpvoted) {
        feedback.upvoters = feedback.upvoters.filter((u) => u !== userId);
        feedback.upvotes = Math.max(0, feedback.upvotes - 1);
      }
      feedback.downvoters.push(userId);
      feedback.downvotes = (feedback.downvotes || 0) + 1;
    }

    return feedback.save();
  }

  async findFeedbackById(id: string): Promise<FeedbackDocument> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }
    return feedback;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Feedback,
  FeedbackDocument,
  FeedbackType,
} from '../feedback/schemas/feedback.schema';
import { CreateFeedbackDto } from '../feedback/dto/create-feedback.dto';

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
      .sort({ upvotes: -1 })
      .limit(20)
      .exec();

    return feedbacks.map(this.sanitizePublicFeedback);
  }

  async findSurvivalStories(): Promise<Partial<Feedback>[]> {
    const feedbacks = await this.feedbackModel
      .find({ type: FeedbackType.SURVIVAL_STORY })
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(10)
      .exec();

    return feedbacks.map(this.sanitizePublicFeedback);
  }

  async voteFeedback(
    id: string,
    voteType: 'upvote' | 'downvote',
  ): Promise<FeedbackDocument> {
    const updateOperation =
      voteType === 'upvote'
        ? { $inc: { upvotes: 1 } }
        : { $inc: { downvotes: 1 } };

    const updatedFeedback = await this.feedbackModel
      .findByIdAndUpdate(id, updateOperation, { new: true })
      .exec();

    if (!updatedFeedback) {
      throw new NotFoundException('Feedback not found');
    }

    return updatedFeedback;
  }

  async findFeedbackById(id: string): Promise<FeedbackDocument> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }
    return feedback;
  }
}

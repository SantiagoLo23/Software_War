import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FeedbackService } from '../feedback/feedback.service';
import {
  CreateFeedbackDto,
  VoteFeedbackDto,
} from '../feedback/dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/roles';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // Solo desarrolladores autenticados pueden enviar feedback
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.DEVELOPER)
  @Post()
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req,
  ) {
    return this.feedbackService.createFeedback(createFeedbackDto);
  }

  // Solo desarrolladores pueden ver tips y votar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.DEVELOPER)
  @Get('resistance-tips')
  async getResistanceTips() {
    return this.feedbackService.findResistanceTips();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.DEVELOPER)
  @Get('survival-stories')
  async getSurvivalStories() {
    return this.feedbackService.findSurvivalStories();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.DEVELOPER)
  @Get('slave-activity-reports')
  async getSlaveActivityReports() {
    return this.feedbackService.findSlaveActivityReports();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.DEVELOPER)
  @Patch(':id/vote')
  async voteFeedback(
    @Param('id') id: string,
    @Body() voteDto: VoteFeedbackDto,
  ) {
    return this.feedbackService.voteFeedback(id, voteDto.voteType);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(Roles.DEVELOPER)
  @Get(':id')
  async getFeedbackById(@Param('id') id: string) {
    return this.feedbackService.findFeedbackById(id);
  }
}

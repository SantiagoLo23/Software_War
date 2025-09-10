// src/controllers/feedback.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Body, 
  Param, 
  UseGuards,
  Request,
  Query,
  Patch
} from '@nestjs/common';
import { FeedbackService } from '../feedback/feedback.service';
import { CreateFeedbackDto, UpdateFeedbackDto, VoteFeedbackDto } from '../feedback/dto/create-feedback.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // Endpoints públicos para desarrolladores (sin autenticación)
  
  @Post('public')
  async createPublicFeedback(@Body() createFeedbackDto: CreateFeedbackDto) {
    // Feedback público siempre visible
    createFeedbackDto.isPublic = true;
    return this.feedbackService.createFeedback(createFeedbackDto);
  }

  @Get('public')
  async getPublicFeedback() {
    return this.feedbackService.findPublicFeedback();
  }

  @Get('resistance-tips')
  async getResistanceTips() {
    return this.feedbackService.findResistanceTips();
  }

  @Get('survival-stories')
  async getSurvivalStories() {
    return this.feedbackService.findSurvivalStories();
  }

  @Patch(':id/vote')
  async voteFeedback(
    @Param('id') id: string,
    @Body() voteDto: VoteFeedbackDto,
  ) {
    return this.feedbackService.voteFeedback(id, voteDto.voteType);
  }

  // Endpoints para administradores (Juan Sao Ville)
  
  @Get('admin/all')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async getAllFeedbackForAdmin() {
    return this.feedbackService.findAllFeedback(true);
  }

  @Get('admin/slave-reports')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async getSlaveReports() {
    return this.feedbackService.findSlaveReports();
  }

  @Get('admin/stats')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async getFeedbackStats() {
    return this.feedbackService.getFeedbackStats();
  }

  @Put('admin/:id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async updateFeedback(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @Query('adminId') adminId?: string // Temporal para testing
    // @Request() req,
  ) {
    const actualAdminId = adminId || 'juan_sao_ville_id';
    return this.feedbackService.updateFeedback(id, updateFeedbackDto, actualAdminId);
  }

  @Delete('admin/:id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('juan_sao_ville')
  async deleteFeedback(@Param('id') id: string) {
    await this.feedbackService.deleteFeedback(id);
    return { message: 'Feedback deleted successfully' };
  }

  // Endpoints generales

  @Get(':id')
  async getFeedbackById(@Param('id') id: string) {
    return this.feedbackService.findFeedbackById(id);
  }

  @Post()
  // @UseGuards(JwtAuthGuard) // Cualquier usuario autenticado puede crear feedback
  async createFeedback(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.createFeedback(createFeedbackDto);
  }
}
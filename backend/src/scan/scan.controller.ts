import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScanService } from './scan.service';

@Controller('api/scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadAndAnalyze(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Gambar sampah belum diunggah.');
    }

    const result = await this.scanService.analyzeWasteImage(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    return {
      success: true,
      message: 'Analisis sampah berhasil',
      data: result,
    };
  }
}

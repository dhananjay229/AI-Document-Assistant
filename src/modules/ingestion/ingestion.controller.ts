import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestionService } from './ingestion.service';
import { PdfLoader } from './pdf.loader';

/**
 * IngestionController – handles POST /ingestion/upload
 *
 * Flow:
 *  1. Accept multipart/form-data PDF upload
 *  2. Validate file type
 *  3. Load + split PDF via PdfLoader
 *  4. Embed + store via IngestionService
 */
@Controller('ingestion')
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(
    private readonly ingestionService: IngestionService,
    private readonly pdfLoader: PdfLoader,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Use field name "file".');
    }

    const allowedMimes = ['application/pdf', 'text/plain'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: "${file.mimetype}". Allowed: PDF, TXT.`,
      );
    }

    this.logger.log(`Received file: "${file.originalname}" (${file.size} bytes)`);

    // Load PDF and split into chunks
    const chunks = await this.pdfLoader.loadAndSplit(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Embed chunks and store to Pinecone
    const result = await this.ingestionService.ingestChunks(chunks, file.originalname);

    return {
      message: `Document "${file.originalname}" ingested successfully.`,
      chunksIngested: result.chunksIngested,
    };
  }
}

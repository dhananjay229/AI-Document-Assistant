import { Injectable, Logger } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';

/**
 * PdfLoader – loads a PDF or plain-text buffer and splits it into chunks.
 *
 * Uses WebPDFLoader from @langchain/community (backed by pdfjs-dist) so the
 * entire pipeline stays in Node.js — no Python process, no temp files, no
 * platform-specific paths.
 */
@Injectable()
export class PdfLoader {
  private readonly logger = new Logger(PdfLoader.name);

  async loadAndSplit(
    fileBuffer: Buffer,
    filename: string,
    mimeType = 'application/pdf',
    chunkSize = 1000,
    chunkOverlap = 200,
  ): Promise<Document[]> {
    this.logger.log(`Loading "${filename}" (${fileBuffer.length} bytes)`);

    let rawDocs: Document[];

    if (mimeType === 'application/pdf') {
      // Convert the in-memory buffer to a Blob — no temp file needed.
      // Uint8Array is used because Buffer may reference a SharedArrayBuffer
      // which is not assignable to BlobPart.
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/pdf' });
      const loader = new WebPDFLoader(blob, { splitPages: true });
      rawDocs = await loader.load();
    } else {
      // Plain text: wrap directly in a single Document
      rawDocs = [
        new Document({
          pageContent: fileBuffer.toString('utf-8'),
          metadata: { loc: { pageNumber: 1 } },
        }),
      ];
    }

    this.logger.log(`Extracted ${rawDocs.length} page(s) from "${filename}"`);

    // Enrich metadata with human-readable source + page fields
    rawDocs.forEach((doc, i) => {
      doc.metadata = {
        ...doc.metadata,
        source: filename,
        page: doc.metadata?.loc?.pageNumber ?? i + 1,
      };
    });

    // Split into overlapping chunks
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
    const chunks = await splitter.splitDocuments(rawDocs);
    this.logger.log(`Split into ${chunks.length} chunk(s) (size=${chunkSize}, overlap=${chunkOverlap})`);

    return chunks;
  }
}

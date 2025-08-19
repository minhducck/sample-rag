import { injectable } from 'inversify';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as path from 'path';

@injectable()
export class PdfService {
  private readonly pdfsDir = path.resolve(process.cwd(), 'var/pdfs');

  async loadAndChunkPdf(fileName: string) {
    const filePath = path.join(this.pdfsDir, fileName);

    // Security check to prevent path traversal
    if (!filePath.startsWith(this.pdfsDir)) {
      throw new Error('Invalid file path');
    }

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    return await splitter.splitDocuments(docs);
  }
}

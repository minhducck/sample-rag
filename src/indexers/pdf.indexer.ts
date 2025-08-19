import { inject, injectable } from 'inversify';
import { Container } from '@/configuration/container';
import { PdfService } from '@/apps/pdf/services/pdf.service';
import { FaissStoreService } from '@/storages/faiss-store.service';

@injectable()
class PdfIndexer {
  constructor(
    @inject(PdfService) private pdfService: PdfService,
    @inject(FaissStoreService) private faissStore: FaissStoreService,
  ) {}

  async main(fileName: string) {
    if (!fileName) {
      console.error('File name is required');
      process.exit(1);
    }

    console.log(`Indexing PDF file: ${fileName}`);
    const chunks = await this.pdfService.loadAndChunkPdf(fileName);
    await this.faissStore.addDocuments(chunks);
    console.log(`Saved to Vector Store`);
    console.log(`Indexed PDF Done.`);
  }
}

const mainProcess = Container.getInstance().get(PdfIndexer)!;
void mainProcess.main(process.argv[2]);

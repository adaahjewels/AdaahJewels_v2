declare module 'pdfkit' {
  interface PDFDocumentOptions {
    margin?: number;
    bufferPages?: boolean;
  }

  interface PDFDocument extends NodeJS.EventEmitter {
    fontSize(size: number): PDFDocument;
    font(name: string): PDFDocument;
    text(text: string, x?: number, y?: number, options?: any): PDFDocument;
    fillColor(color: string): PDFDocument;
    rect(x: number, y: number, width: number, height: number): PDFDocument;
    fill(color?: string): PDFDocument;
    moveDown(lines?: number): PDFDocument;
    end(): void;
    on(event: string, handler: (data?: any) => void): PDFDocument;
  }

  class PDFDocument extends NodeJS.EventEmitter {
    constructor(options?: PDFDocumentOptions);
    fontSize(size: number): PDFDocument;
    font(name: string): PDFDocument;
    text(text: string, x?: number, y?: number, options?: any): PDFDocument;
    fillColor(color: string): PDFDocument;
    rect(x: number, y: number, width: number, height: number): PDFDocument;
    fill(color?: string): PDFDocument;
    moveDown(lines?: number): PDFDocument;
    end(): void;
  }

  export = PDFDocument;
}

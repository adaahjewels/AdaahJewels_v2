import PDFDocument from 'pdfkit';

interface InvoiceItem {
  productName: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  orderId: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
}

export const generateInvoicePDF = (data: InvoiceData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('श्री sootra', { align: 'center' })
      .fontSize(10)
      .font('Helvetica')
      .text('Premium Kurtis Collection', { align: 'center' })
      .text('', { align: 'center' });

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text('INVOICE', { align: 'center' }).moveDown(0.5);

    // Invoice details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice #: ${data.orderId}`, 50, 120);
    doc.text(`Date: ${data.orderDate.toLocaleDateString()}`, 50, 135);
    doc.text(`Status: Paid`, 50, 150);

    // Customer details
    doc.fontSize(11).font('Helvetica-Bold').text('BILL TO:', 50, 180);
    doc.fontSize(10).font('Helvetica');
    doc.text(data.customerName, 50, 195);
    doc.text(data.customerEmail, 50, 210);
    doc.text(data.customerPhone, 50, 225);

    // Shipping details
    doc.fontSize(11).font('Helvetica-Bold').text('SHIP TO:', 300, 180);
    doc.fontSize(10).font('Helvetica');
    doc.text(data.shippingAddress.address, 300, 195);
    doc.text(`${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}`, 300, 210);

    // Table header
    const tableTop = 280;
    const tableHeaders = ['Product', 'Qty', 'Price', 'Amount'];
    const colWidths = [250, 60, 70, 80];
    let x = 50;

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#b8860b');
    doc.rect(50, tableTop - 5, 500, 25).fill('#b8860b');
    doc.fillColor('white');

    tableHeaders.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });

    // Table rows
    let yPosition = tableTop + 30;
    doc.fontSize(10).font('Helvetica').fillColor('black');

    data.items.forEach((item) => {
      const amount = item.quantity * item.price;
      doc.text(item.productName, 50, yPosition, { width: colWidths[0] });
      doc.text(item.quantity.toString(), 50 + colWidths[0], yPosition, { width: colWidths[1], align: 'center' });
      doc.text(`₹${item.price.toFixed(2)}`, 50 + colWidths[0] + colWidths[1], yPosition, { width: colWidths[2], align: 'right' });
      doc.text(`₹${amount.toFixed(2)}`, 50 + colWidths[0] + colWidths[1] + colWidths[2], yPosition, { width: colWidths[3], align: 'right' });
      yPosition += 25;
    });

    // Summary
    yPosition += 10;
    doc.fontSize(10).font('Helvetica');
    doc.text(`Subtotal:`, 350, yPosition, { width: 100, align: 'right' });
    doc.text(`₹${data.subtotal.toFixed(2)}`, 450, yPosition, { width: 100, align: 'right' });

    yPosition += 20;
    doc.text(`Tax (18% GST):`, 350, yPosition, { width: 100, align: 'right' });
    doc.text(`₹${data.tax.toFixed(2)}`, 450, yPosition, { width: 100, align: 'right' });

    yPosition += 20;
    doc.text(`Shipping:`, 350, yPosition, { width: 100, align: 'right' });
    doc.text(`₹${data.shippingCost.toFixed(2)}`, 450, yPosition, { width: 100, align: 'right' });

    yPosition += 20;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#b8860b');
    doc.text(`TOTAL:`, 350, yPosition, { width: 100, align: 'right' });
    doc.text(`₹${data.total.toFixed(2)}`, 450, yPosition, { width: 100, align: 'right' });

    // Footer
    yPosition += 50;
    doc.fontSize(9).font('Helvetica').fillColor('gray');
    doc.text('Payment Method: ' + data.paymentMethod, 50, yPosition);
    doc.text('Thank you for your order!', 50, yPosition + 20, { align: 'center' });
    doc.text('© 2026 श्री sootra. All rights reserved.', 50, yPosition + 40, { align: 'center' });

    doc.end();
  });
};

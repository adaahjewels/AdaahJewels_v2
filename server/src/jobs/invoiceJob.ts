import Bull from 'bull';

// Lazy-import invoice helpers so this module stays resilient during builds
const getInvoiceService = () => {
  try {
    // prefer commonjs require to avoid TS/ESM build issues if service path differs
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const svc = require('../services/invoice.service');
    return svc;
  } catch (err) {
    console.warn('Could not load invoice.service:', (err as any)?.message || err);
    return null;
  }
};

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
};

export const invoiceQueue = new Bull('invoices', { redis: redisConfig as any });

invoiceQueue.process(async (job: any) => {
  const { orderId, email } = job.data || {};
  if (!orderId) throw new Error('Missing orderId in invoice job');

  const invoiceService = getInvoiceService();
  if (!invoiceService || !invoiceService.generateInvoicePDF || !invoiceService.sendInvoiceEmail) {
    throw new Error('Invoice service is not available; cannot process job');
  }

  try {
    const pdfBuffer = await invoiceService.generateInvoicePDF(orderId);
    // If email is provided, send; otherwise persist PDF or attach to order as needed
    if (email) {
      await invoiceService.sendInvoiceEmail(email, pdfBuffer, orderId);
    } else {
      // fallback: persist to storage or attach to order (invoiceService should provide helper)
      if (invoiceService.saveInvoiceBuffer) {
        await invoiceService.saveInvoiceBuffer(orderId, pdfBuffer);
      }
    }
    return { ok: true };
  } catch (err) {
    console.error('Error processing invoice job for order', orderId, err);
    throw err;
  }
});

export const enqueueInvoice = (orderId: number, email?: string | null) => {
  return invoiceQueue.add({ orderId, email });
};

declare module 'nodemailer' {
  interface TransportOptions {
    service?: string;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  interface SendMailOptions {
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename?: string;
      content?: Buffer | string;
      contentType?: string;
    }>;
  }

  interface Transporter {
    sendMail(mailOptions: SendMailOptions, callback?: (err: Error | null, info: any) => void): Promise<any>;
  }

  interface Nodemailer {
    createTransport(options: TransportOptions): Transporter;
  }

  const nodemailer: Nodemailer;
  export = nodemailer;
}

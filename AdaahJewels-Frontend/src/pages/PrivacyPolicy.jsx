import { motion } from 'framer-motion';
import { PageTransition } from '../components/ui/PageTransition';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: '1. Introduction',
      content: `Adaah Jewels ("we," "us," "our," or "Company") respects the privacy of its users ("user" or "you"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website adaahjewels.com (the "Site") and use our services.

Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Site. Your use of our Site signifies your acceptance of this Privacy Policy.`,
    },
    {
      title: '2. Information We Collect',
      content: `We may collect information about you in a variety of ways. The information we may collect on the Site includes:

a) Personal Data You Provide:
- Name, email address, phone number
- Billing and shipping address
- Payment information (processed securely)
- Account credentials and preferences
- Customer service communications

b) Automatic Information:
- Browser type and version
- IP address and device information
- Pages visited and time spent
- Referring/exit pages
- Operating system information
- Cookies and similar tracking technologies

c) Third-Party Information:
- Information from payment processors
- Information from social media platforms (if you connect your accounts)
- Information from analytics providers`,
    },
    {
      title: '3. How We Use Your Information',
      content: `We use the information we collect for various purposes:

- To process transactions and send related information
- To respond to your inquiries and provide customer service
- To send periodic emails about your order status and special offers
- To improve our website functionality and user experience
- To monitor and analyze trends, usage, and activities
- To detect, prevent, and address fraudulent transactions and other illegal activities
- To comply with legal obligations and enforce our agreements
- To personalize your experience and deliver targeted content`,
    },
    {
      title: '4. Disclosure of Your Information',
      content: `We may share your information in the following situations:

a) Service Providers:
We may share your information with third-party service providers who assist us in operating our website and conducting our business, including:
- Payment processors
- Shipping and logistics partners
- Email service providers
- Analytics providers

b) Legal Requirements:
We may disclose your information if required by law or if we believe in good faith that such disclosure is necessary to comply with legal obligations, enforce our Terms & Conditions, or protect the rights, property, or safety of Adaah Jewels, our users, or the public.

c) Business Transfers:
If Adaah Jewels is involved in a merger, acquisition, or bankruptcy, your information may be transferred as part of that transaction.

d) With Your Consent:
We may share your information with third parties with your explicit consent for purposes other than those listed above.`,
    },
    {
      title: '5. Data Security',
      content: `We have implemented appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:

- SSL/TLS encryption for data transmission
- Secure payment gateway integration
- Regular security assessments
- Limited employee access to personal information
- Confidentiality agreements with service providers

However, no method of transmission over the Internet or electronic storage is completely secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.`,
    },
    {
      title: '6. Cookies and Tracking Technologies',
      content: `We use cookies, web beacons, pixels, and similar tracking technologies to:

- Remember your preferences and login information
- Understand how you interact with our Site
- Deliver personalized content and advertisements
- Analyze site traffic and usage patterns
- Improve website functionality

You can control cookie settings through your browser. However, disabling cookies may affect your ability to use certain features of our website.`,
    },
    {
      title: '7. Your Privacy Rights',
      content: `Depending on your location, you may have certain rights regarding your personal information:

a) Right to Access:
You have the right to request access to the personal information we hold about you.

b) Right to Correction:
You can request corrections to inaccurate or incomplete information.

c) Right to Deletion:
You may request deletion of your personal information, subject to legal and contractual obligations.

d) Right to Opt-Out:
You can opt out of receiving promotional communications by clicking the "unsubscribe" link in our emails or contacting us directly.

e) Right to Data Portability:
You may request a copy of your personal information in a structured, commonly used format.

To exercise any of these rights, please contact us at privacy@adaahjewels.com.`,
    },
    {
      title: '8. Third-Party Links',
      content: `Our Site may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites before providing your personal information.`,
    },
    {
      title: '9. Children\'s Privacy',
      content: `Our Site is not directed toward children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13 without parental consent, we will take steps to delete such information and terminate the child's account.`,
    },
    {
      title: '10. International Data Transfers',
      content: `Your information may be transferred to, stored in, and processed in countries other than your country of residence, which may have data protection rules that differ from your home country. By using our Site, you consent to the transfer of your information to countries outside of your country of residence.`,
    },
    {
      title: '11. Retention of Information',
      content: `We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. The retention period may vary depending on the type of information and our business needs.

When information is no longer needed, we will securely delete or anonymize it.`,
    },
    {
      title: '12. Changes to This Privacy Policy',
      content: `We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, and other factors. We will notify you of any material changes by updating the "Last Updated" date and posting the revised policy on our Site.

Your continued use of our Site following the posting of revised Privacy Policy means that you accept and agree to the changes.`,
    },
    {
      title: '13. Contact Us',
      content: `If you have questions about this Privacy Policy, our privacy practices, or your personal information, please contact us:

Email: privacy@adaahjewels.com
Phone: +91 (Your Contact Number)
Address: Adaah Jewels
Your Business Address
City, State, Pincode
Country

We will respond to your inquiry within 30 days of receipt.`,
    },
  ];

  return (
    <PageTransition variant="slideUp">
      <div className="min-h-screen bg-cream-50 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto mb-12 px-4 text-center md:mb-16"
        >
          <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl" style={{ color: 'var(--color-ink)' }}>
            Privacy Policy
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-ink-muted)' }}>
            Your privacy is important to us. Learn how we protect and handle your data.
          </p>
          <div
            className="mx-auto mt-6 h-1 w-24 rounded-full"
            style={{ background: 'linear-gradient(to right, var(--color-brand-400), var(--color-gold-300))' }}
          />
        </motion.div>

        {/* Content */}
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
            className="space-y-8"
          >
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-cream-200 bg-white p-8 shadow-sm transition hover:shadow-lg"
              >
                <h2
                  className="mb-4 font-display text-2xl font-bold"
                  style={{ color: 'var(--color-brand-600)' }}
                >
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.split('\n\n').map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="leading-relaxed"
                      style={{ color: 'var(--color-ink)' }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Last Updated */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p style={{ color: 'var(--color-ink-muted)' }} className="text-sm">
              Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;

import { siteConfig } from '@/lib/site-config'

export type LegalSection = {
  heading: string
  body: string[]
}

export type LegalDocument = {
  updated: string
  intro: string
  sections: LegalSection[]
}

const { legalName, contact } = siteConfig

// NOTE: Template legal content. Please have it reviewed by a qualified
// professional before publishing.
export const privacyPolicy: LegalDocument = {
  updated: 'July 2026',
  intro: `This Privacy Policy explains how ${legalName} ("we", "us" or "our") collects, uses and protects the information you provide when you use our website.`,
  sections: [
    {
      heading: 'Information We Collect',
      body: [
        'When you contact us through our website, we may collect personal information such as your name, email address, phone number and the contents of your message.',
        'We may also collect non-personal information automatically, such as your browser type and general usage data, to help us improve our website.',
      ],
    },
    {
      heading: 'How We Use Your Information',
      body: [
        'We use the information you provide solely to respond to your enquiries, provide the services you request and improve our communications with you.',
        'We do not sell, rent or trade your personal information to third parties.',
      ],
    },
    {
      heading: 'Data Security',
      body: [
        'We take reasonable measures to protect the information you share with us against unauthorised access, loss or misuse. However, no method of transmission over the internet is completely secure.',
      ],
    },
    {
      heading: 'Third-Party Services',
      body: [
        'Our contact form uses a trusted third-party email delivery service to process and deliver your messages. These providers handle your data in accordance with their own privacy practices.',
      ],
    },
    {
      heading: 'Your Rights',
      body: [
        'You may request access to, correction of, or deletion of the personal information we hold about you by contacting us using the details below.',
      ],
    },
    {
      heading: 'Contact Us',
      body: [
        `If you have any questions about this Privacy Policy, please contact us at ${contact.email} or by post at ${contact.address.street}, ${contact.address.city}, ${contact.address.country}.`,
      ],
    },
  ],
}

export const termsAndConditions: LegalDocument = {
  updated: 'July 2026',
  intro: `These Terms & Conditions govern your use of the ${legalName} website. By accessing or using our website, you agree to be bound by these terms.`,
  sections: [
    {
      heading: 'Use of Our Website',
      body: [
        'You may use our website for lawful purposes only. You agree not to use it in any way that could damage, disable or impair the website or interfere with any other party’s use of it.',
      ],
    },
    {
      heading: 'Intellectual Property',
      body: [
        'All content on this website, including text, graphics, logos and images, is the property of ' +
          legalName +
          ' or its licensors and is protected by applicable intellectual property laws.',
        'You may not reproduce, distribute or use any content without our prior written permission.',
      ],
    },
    {
      heading: 'Product Information',
      body: [
        'Information about our products and services is provided for general informational purposes and does not constitute medical advice. Always consult a qualified healthcare professional before using any healthcare product.',
        'We strive to keep information accurate and up to date but make no warranties regarding its completeness or accuracy.',
      ],
    },
    {
      heading: 'Limitation of Liability',
      body: [
        'To the fullest extent permitted by law, we shall not be liable for any direct, indirect or consequential loss arising from your use of, or inability to use, this website.',
      ],
    },
    {
      heading: 'External Links',
      body: [
        'Our website may contain links to third-party websites. We are not responsible for the content or practices of those websites.',
      ],
    },
    {
      heading: 'Changes to These Terms',
      body: [
        'We may update these Terms & Conditions from time to time. Any changes will be posted on this page with an updated revision date.',
      ],
    },
    {
      heading: 'Contact Us',
      body: [
        `If you have any questions about these Terms & Conditions, please contact us at ${contact.email}.`,
      ],
    },
  ],
}

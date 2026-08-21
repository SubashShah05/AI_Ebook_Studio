export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with your first ebook.',
    features: [
      { name: 'AI Book Outline', included: true },
      { name: 'Standard Markdown Editor', included: true },
      { name: 'PDF Export', included: true },
      { name: 'AI Writing Assistant', included: false },
      { name: 'DOCX & Markdown Export', included: false },
      { name: 'Detailed Analytics', included: false }
    ],
    cta: 'Get Started'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: 'month',
    description: 'For serious creators and writers looking for AI power.',
    features: [
      { name: 'AI Book Outline', included: true },
      { name: 'Standard Markdown Editor', included: true },
      { name: 'PDF Export', included: true },
      { name: 'AI Writing Assistant', included: true },
      { name: 'DOCX & Markdown Export', included: true },
      { name: 'Detailed Analytics', included: true }
    ],
    cta: 'Upgrade to Pro'
  },
  business: {
    id: 'business',
    name: 'Business',
    price: '$49',
    period: 'month',
    description: 'For professional workflows and heavy volume writing.',
    features: [
      { name: 'AI Book Outline', included: true },
      { name: 'Standard Markdown Editor', included: true },
      { name: 'PDF Export', included: true },
      { name: 'AI Writing Assistant', included: true },
      { name: 'DOCX & Markdown Export', included: true },
      { name: 'Detailed Analytics', included: true },
      { name: 'Custom Branding Covers', included: true },
      { name: 'Priority Support', included: true }
    ],
    cta: 'Upgrade to Business'
  }
};

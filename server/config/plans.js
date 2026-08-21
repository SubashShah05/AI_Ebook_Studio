export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    maxBooks: 2,
    maxAiGenerations: 20,
    maxExports: 5,
    features: ['AI Book Outline', 'Standard Editor', 'PDF Export (Basic)']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxBooks: 10,
    maxAiGenerations: 100,
    maxExports: 50,
    features: ['AI Book Outline', 'Standard Editor', 'AI Writing Assistant', 'DOCX & Markdown Export', 'Detailed Analytics']
  },
  business: {
    id: 'business',
    name: 'Business',
    maxBooks: 100,
    maxAiGenerations: 1000,
    maxExports: 500,
    features: ['Unlimited Books', '1000 AI Generations', 'All Export Formats', 'Custom Branding Covers', 'Advanced Analytics', 'Priority Support']
  }
};

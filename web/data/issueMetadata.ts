export type Difficulty = "quick-fix" | "needs-developer" | "complex";

export interface IssueMetadata {
  whyItMatters: string;
  howToFix: string[];
  difficulty: Difficulty;
}

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bg: string }
> = {
  "quick-fix": { label: "Quick Fix", color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  "needs-developer": { label: "Needs Developer", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  complex: { label: "Complex", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};

export { DIFFICULTY_CONFIG };

const issueMetadata: Record<string, IssueMetadata> = {
  "heavy-scripts": {
    whyItMatters:
      "Large JavaScript files slow down your page significantly. Every extra second of load time can cost you up to 7% in conversions. Customers on slower connections or mobile devices are hit the hardest.",
    howToFix: [
      "Check if your theme has features you don't use (e.g., quick view, animations) and disable them in theme settings",
      "Ask your developer to split large scripts so only what's needed loads first",
      "Consider replacing heavy libraries with lighter alternatives",
      "Enable script minification in your theme settings if available",
    ],
    difficulty: "needs-developer",
  },

  "duplicate-libraries": {
    whyItMatters:
      "Your store is loading the same library multiple times from different sources. This wastes bandwidth and slows down every page load for no reason. It often happens when multiple apps include their own copy of popular libraries like jQuery.",
    howToFix: [
      "Identify which apps are loading duplicate libraries (check the resource URLs below)",
      "Contact the app developers and ask if they can use the library already included in your theme",
      "If two apps load the same library, consider removing the less essential app",
      "Ask your developer to deduplicate shared libraries",
    ],
    difficulty: "complex",
  },

  "render-blocking": {
    whyItMatters:
      "These scripts block your page from displaying anything until they finish loading. Your customers see a blank white screen while waiting. This directly hurts your bounce rate and Google search ranking.",
    howToFix: [
      "In your theme settings, look for options to defer or lazy-load JavaScript",
      "Ask your developer to add 'async' or 'defer' attributes to scripts in the theme's <head>",
      "Move non-essential scripts from the <head> to the bottom of the page",
      "Check if any apps are injecting render-blocking scripts and contact their support",
    ],
    difficulty: "needs-developer",
  },

  "image-optimization": {
    whyItMatters:
      "Oversized or unoptimized images are one of the biggest reasons for slow page loads. Large images eat up your customers' data and make your store feel sluggish, especially on mobile. Modern formats like WebP are 25-35% smaller with the same quality.",
    howToFix: [
      "Resize images to the maximum display size before uploading (e.g., 2048px wide for hero images)",
      "Use Shopify's built-in image editor to compress images, or use free tools like TinyPNG",
      "Convert PNG images to WebP or JPEG where transparency isn't needed",
      "Enable lazy loading for images below the fold in your theme settings",
    ],
    difficulty: "quick-fix",
  },

  "third-party-impact": {
    whyItMatters:
      "Third-party scripts (analytics, chat widgets, tracking pixels) add up fast. They load from external servers you don't control, so they can be slow, unreliable, and significantly increase your page weight. Too many can make your store noticeably slower.",
    howToFix: [
      "Audit your installed apps and remove any you no longer actively use",
      "For tracking pixels (Facebook, TikTok, etc.), consider using Shopify's built-in tracking instead of separate apps",
      "Ask your developer about loading chat widgets and non-essential scripts only after the page loads",
      "Prioritize apps that have a direct impact on revenue and remove \"nice to have\" ones",
    ],
    difficulty: "needs-developer",
  },

  "resource-hints": {
    whyItMatters:
      "Resource hints tell the browser to start connecting to important servers early, before it actually needs them. Without these hints, the browser discovers third-party resources late, adding extra seconds to load time.",
    howToFix: [
      "Ask your developer to add preconnect hints for your most important third-party domains",
      "Check if your theme supports resource hint settings and enable them",
      "For critical resources (fonts, hero images), add preload hints to load them earlier",
      "Most modern Shopify themes handle this automatically - consider upgrading if yours doesn't",
    ],
    difficulty: "needs-developer",
  },

  // Accessibility rule (Phase 2)
  accessibility: {
    whyItMatters:
      "Accessibility issues prevent people with disabilities from using your store. Beyond being the right thing to do, ADA non-compliance can result in lawsuits (over 4,000 filed in 2023 alone) and you lose sales from the 26% of adults who have some form of disability.",
    howToFix: [
      "Add descriptive alt text to all product images and banners in the Shopify admin",
      "Ensure your theme has a proper heading structure (one H1 per page, followed by H2s and H3s)",
      "Check that all form fields (email signup, search, etc.) have visible labels",
      "Ask your developer to set the page language attribute and add ARIA landmarks",
    ],
    difficulty: "needs-developer",
  },

  // SEO rule (Phase 2)
  "seo-checks": {
    whyItMatters:
      "Missing or poorly configured SEO elements mean your store won't rank well in Google search results. This directly reduces the free organic traffic that drives a significant portion of e-commerce sales.",
    howToFix: [
      "Add a unique, descriptive title (under 60 characters) for every page in the Shopify admin",
      "Write compelling meta descriptions (under 160 characters) that include your target keywords",
      "Add Open Graph tags so your pages look great when shared on social media",
      "Ensure every page has a canonical URL to avoid duplicate content issues",
    ],
    difficulty: "quick-fix",
  },

  // Security rule (Phase 2)
  "security-headers": {
    whyItMatters:
      "Missing security headers leave your store vulnerable to attacks like clickjacking and cross-site scripting. While Shopify handles most security for you, some headers need to be explicitly configured to fully protect your customers' data.",
    howToFix: [
      "Most security headers are managed by Shopify and your hosting - check with Shopify support if critical headers are missing",
      "If using a custom proxy or CDN, ensure it forwards all security headers correctly",
      "Ask your developer to verify HSTS (HTTP Strict Transport Security) is enabled",
      "Review any custom server configurations that might strip security headers",
    ],
    difficulty: "complex",
  },
};

export default issueMetadata;

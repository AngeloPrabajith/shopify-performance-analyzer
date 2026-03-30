const glossary: Record<string, string> = {
  "Load Time":
    "Total time from when the browser starts loading the page until everything is fully loaded, including all images, scripts, and styles.",
  TTFB: "Time to First Byte. How long it takes for your server to send back the first piece of data. Under 800ms is good.",
  FCP: "First Contentful Paint. When the first text or image becomes visible to visitors. Under 1.8 seconds is good.",
  LCP: "Largest Contentful Paint. When the biggest visible element (usually hero image or heading) finishes loading. Under 2.5 seconds is good.",
  CLS: "Cumulative Layout Shift. How much the page content moves around while loading. Under 0.1 means a stable layout.",
  Requests:
    "The total number of files (scripts, images, stylesheets, fonts) the browser needs to download to display your page.",
  "Transfer Size":
    "The total amount of data downloaded to load your page. Less data means faster loading, especially on mobile.",
};

export default glossary;

export function validateUrl(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Please provide a URL to analyze.');
  }

  let url = input.trim();

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Unsupported protocol: ${parsed.protocol}`);
    }

    return parsed.href;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Unsupported')) {
      throw err;
    }
    throw new Error(`Invalid URL: "${input}". Please provide a valid store URL.`);
  }
}

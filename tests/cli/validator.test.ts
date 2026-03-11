import { describe, it, expect } from 'vitest';
import { validateUrl } from '../../src/cli/validator.js';

describe('validateUrl', () => {
  it('returns a normalized URL when given a full URL', () => {
    expect(validateUrl('https://store.myshopify.com')).toBe(
      'https://store.myshopify.com/',
    );
  });

  it('adds https:// when protocol is missing', () => {
    expect(validateUrl('store.myshopify.com')).toBe(
      'https://store.myshopify.com/',
    );
  });

  it('preserves http:// if explicitly provided', () => {
    expect(validateUrl('http://store.myshopify.com')).toBe(
      'http://store.myshopify.com/',
    );
  });

  it('preserves paths and query parameters', () => {
    const result = validateUrl('https://store.myshopify.com/collections?page=2');
    expect(result).toContain('/collections');
    expect(result).toContain('page=2');
  });

  it('throws on empty input', () => {
    expect(() => validateUrl('')).toThrow('Please provide a URL');
  });

  it('throws on completely invalid input', () => {
    expect(() => validateUrl('not a url at all :::')).toThrow('Invalid URL');
  });
});

/**
 * Tests for format utility functions
 */

// Simple example formatters to test
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    test('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    test('formats negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });
  });

  describe('formatDate', () => {
    test('formats date strings correctly', () => {
      expect(formatDate('2023-05-15')).toBe('May 15, 2023');
    });

    test('formats Date objects correctly', () => {
      const date = new Date(2022, 0, 1); // January 1, 2022
      expect(formatDate(date)).toBe('January 1, 2022');
    });
  });

  describe('truncateText', () => {
    test('does not truncate text shorter than max length', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    test('truncates text longer than max length', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello...');
    });

    test('handles edge cases', () => {
      expect(truncateText('', 5)).toBe('');
      expect(truncateText('12345', 5)).toBe('12345');
    });
  });
});

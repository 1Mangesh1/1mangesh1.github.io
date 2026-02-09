import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateReadingTime, formatReadingTime } from './reading-time.ts';

describe('Reading Time Utilities', () => {
  describe('calculateReadingTime', () => {
    it('should return 1 minute for empty content', () => {
      assert.strictEqual(calculateReadingTime(''), 1);
    });

    it('should return 1 minute for short content', () => {
      const content = 'This is a short sentence.';
      assert.strictEqual(calculateReadingTime(content), 1);
    });

    it('should calculate reading time based on 225 words per minute', () => {
      // Create a string with 225 words
      const content = new Array(225).fill('word').join(' ');
      assert.strictEqual(calculateReadingTime(content), 1);

      // Create a string with 226 words
      const content2 = new Array(226).fill('word').join(' ');
      assert.strictEqual(calculateReadingTime(content2), 2);

       // Create a string with 450 words
      const content3 = new Array(450).fill('word').join(' ');
      assert.strictEqual(calculateReadingTime(content3), 2);

       // Create a string with 451 words
      const content4 = new Array(451).fill('word').join(' ');
      assert.strictEqual(calculateReadingTime(content4), 3);
    });

    it('should ignore HTML tags', () => {
      const content = '<p>word</p> '.repeat(225); // Should count as 225 words
      assert.strictEqual(calculateReadingTime(content), 1);

      const content2 = '<div>word</div> '.repeat(226); // Should count as 226 words
      assert.strictEqual(calculateReadingTime(content2), 2);
    });

    it('should ignore code blocks', () => {
      const content = `
        word
        \`\`\`
        ignore this code block
        with multiple lines
        \`\`\`
      `;
      // 'word' is 1 word. Code block is ignored.
      assert.strictEqual(calculateReadingTime(content), 1);
    });

    it('should ignore inline code', () => {
        const content = 'word `ignore code` word';
        // 'word' + 'word' = 2 words.
        // Actually, let's verify exact logic. 'word `ignore code` word' -> 'word  word' -> 2 words.
        // If the code block is removed, spaces might remain.
        // Let's create a more robust test case.
        const longContent = 'word `code` '.repeat(225);
        // Logic: 'word ' repeated 225 times.
        assert.strictEqual(calculateReadingTime(longContent), 1);
    });

    it('should ignore images but keep alt text? No, regex removes entire image tag including alt text', () => {
        // Regex: /!\[.*?\]\(.*?\)/g
        const content = 'word ![alt text](image.png) word';
        // 'word  word' -> 2 words.
        assert.strictEqual(calculateReadingTime('word '.repeat(100) + '![alt](url) '.repeat(100)), 1);
    });

    it('should remove links but keep text', () => {
      // Content with 226 words worth of link text.
      // 'link' (1 word) repeated 226 times inside markdown link syntax.
      const content = '[link](url) '.repeat(226);

      // Should be 226 words -> 2 minutes.
      // If link text is removed, word count is 0 -> 1 minute (min).
      assert.strictEqual(calculateReadingTime(content), 2);
    });

    it('should remove markdown headers', () => {
      const content = '# Header\n## Subheader\nword';
      // Regex: .replace(/#{1,6}\s/g, "")
      // '# Header' -> 'Header'
      // '## Subheader' -> 'Subheader'
      // So 'Header Subheader word' -> 3 words.

      const text = '# Word\n'.repeat(225); // 'Word\n' * 225 -> 225 words.
      assert.strictEqual(calculateReadingTime(text), 1);

      const text2 = '# Word\n'.repeat(226); // 226 words
      assert.strictEqual(calculateReadingTime(text2), 2);
    });
  });

  describe('formatReadingTime', () => {
    it('should format 1 minute correctly', () => {
      assert.strictEqual(formatReadingTime(1), '1 min read');
    });

    it('should format multiple minutes correctly', () => {
      assert.strictEqual(formatReadingTime(5), '5 min read');
      assert.strictEqual(formatReadingTime(10), '10 min read');
    });
  });
});

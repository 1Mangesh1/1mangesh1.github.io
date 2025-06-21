export function calculateReadingTime(content: string): number {
  // Remove HTML tags and markdown syntax for more accurate word count
  const cleanContent = content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]*`/g, "") // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
    .replace(/\[.*?\]\(.*?\)/g, "") // Remove links (keep text)
    .replace(/#{1,6}\s/g, "") // Remove markdown headers
    .replace(/[*_~`]/g, "") // Remove emphasis markers
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Count words (split by whitespace and filter empty strings)
  const words = cleanContent.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Average reading speed is 200-250 words per minute
  // Using 225 as a middle ground
  const wordsPerMinute = 225;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);

  // Minimum reading time of 1 minute
  return Math.max(1, readingTimeMinutes);
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return "1 min read";
  }
  return `${minutes} min read`;
}

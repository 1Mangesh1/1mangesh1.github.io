// Fun quotes and facts for the homepage
export const funQuotes = [
  "There are 10 types of people: those who understand binary and those who don't.",
  "Why do Java developers wear glasses? Because they don't C#!",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "Why did the developer go broke? Because he used up all his cache!",
  "Debugging: Removing the needles from the haystack. Programming: Adding needles to the haystack with your eyes closed.",
  "I would tell you a UDP joke, but you might not get it.",
  "A SQL query goes into a bar, walks up to two tables and asks... 'Can I join you?'",
  "Why do programmers prefer dark mode? Because light attracts bugs!",
  "The best thing about programming? It doesn't get angry when you test your code multiple times.",
  "I'm not a great programmer; I'm just a good programmer with great habits.",
  "Talk is cheap. Show me the code. - Linus Torvalds",
  "The only way to make sense out of change is to plunge into it, move with it, and join the dance. - Alan Watts",
  "Code is poetry written for machines to execute and humans to understand.",
  "First, solve the problem. Then, write the code.",
  "Do or do not. There is no try() in production.",
  "Java is to JavaScript what Car is to Carpet.",
  "It's not a bug, it's an undocumented feature!",
  "Real programmers don't comment their code. If it was hard to write, it should be hard to read.",
  "99 little bugs in the code, 99 little bugs... Take one down, patch it around... 127 little bugs in the code.",
  "I'm not joking around. I'm a compiler."
];

export const funFacts = [
  "The first computer bug was an actual moth. 🦋",
  "The '@' symbol is called a 'snail' in Dutch and French. 🐌",
  "Python is named after Monty Python, not the snake! 🐍",
  "Stack Overflow was named after an actual computing problem. 📚",
  "The webcam was originally created to monitor a coffee pot! ☕",
  "JavaScript and Java are as related as Netflix and Net-facing. 📺",
  "There are more possible games of chess than atoms in the universe! ♟️",
  "Binary solo is a real thing—it's a song about binary! 🎵",
  "The first website ever made is still online and unchanged. 📡",
  "Unix time runs out on January 19, 2038 (Year 2038 Problem). ⏰"
];

export function getRandomQuote() {
  return funQuotes[Math.floor(Math.random() * funQuotes.length)];
}

export function getRandomFact() {
  return funFacts[Math.floor(Math.random() * funFacts.length)];
}

export function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return funQuotes[dayOfYear % funQuotes.length];
}

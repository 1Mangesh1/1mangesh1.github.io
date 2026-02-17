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
  "I'm not joking around. I'm a compiler.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. - Martin Fowler",
  "Premature optimization is the root of all evil. - Donald Knuth",
  "Make it work, make it right, make it fast. In that order.",
  "A good programmer is someone who looks both ways before crossing a one-way street. - Doug Linder",
  "Code without tests is broken as designed. - Jacob Kaplan-Moss",
  "If it hurts, do it more often. - Extreme Programming",
  "You can't have great software without a great team. - Steve Jobs",
  "The most devastating thing to any programmer is a stupid manager. - Richard Stallman",
  "If you think hardware is expensive, try buying software. - Tom Syroid",
  "Measuring programming progress by lines of code is like measuring aircraft building progress by weight. - Bill Gates",
  "90% of my code is garbage. The other 10% will be rewritten tomorrow.",
  "Git purge: where you delete your entire project and start from scratch because merge conflicts got out of hand.",
  "CSS: Cascading Strong Suggestions. Maybe they'll work, maybe they won't.",
  "To understand what recursion is, you must first understand what recursion is.",
  "As a programmer, you are not paid to create code. You are paid to solve problems.",
  "The only valid measurement of code quality: WTFs per minute.",
  "UNIX is simple. It just takes a genius to understand its simplicity.",
  "The best error message is one that never appears.",
  "Debugging is like being the detective in a crime drama, except you are also the murderer.",
  "In programming, there are 2 hard problems: cache invalidation, naming things, and off-by-one errors.",
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
  "Unix time runs out on January 19, 2038 (Year 2038 Problem). ⏰",
  "Grace Hopper created the first compiler and invented the concept of programming. 👩‍💻",
  "CSS Zen Garden proves the same HTML can look completely different with different CSS. 🎨",
  "The Rust programming language prevents entire classes of memory bugs at compile time. 🦀",
  "TypeScript adds type safety to JavaScript without changing runtime behavior. 📝",
  "Open source software powers 96% of the web. 🌐",
  "The Linux kernel is rewritten millions of times per day by developers worldwide. 🐧",
  "Git was created by Linus Torvalds in 2 weeks to manage Linux kernel development. ⏱️",
  "Google processes over 8.5 billion searches every single day. 🔍",
  "The first iPhone was released in 2007, starting the mobile revolution. 📱",
  "React.js was open-sourced by Facebook and changed frontend development forever. ⚛️",
  "Node.js allows JavaScript to run on the server side, not just in browsers. 🖥️",
  "Docker revolutionized deployment by containerizing applications. 🐳",
  "Kubernetes automates deployment and scaling of containerized applications. ☸️",
  "ChatGPT was trained on 570 GB of text data from the internet. 🤖",
  "The term 'googling' became so popular Google was concerned about trademark dilution. 🔎",
  "The domain google.com was registered on September 15, 1997. 📅",
  "YouTube processes over 500 hours of video uploaded every minute. 🎥",
  "Netflix uses machine learning to recommend shows you'll actually want to watch. 🎬",
  "Spotify's algorithm recommendation engine is one of the most advanced in the world. 🎵",
  "Bitcoin's blockchain uses more electricity than some countries annually. ⚡",
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

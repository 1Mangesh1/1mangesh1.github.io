const numBookmarks = 1000000;
const bookmarks = Array.from({ length: numBookmarks }, (_, i) => ({
  data: {
    featured: i % 10 === 0,
    title: `Bookmark ${i}`,
  },
}));

function measure(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(4)}ms`);
  return result;
}

console.log(`Benchmarking with ${numBookmarks} bookmarks...`);

// Current approach
const currentApproach = () => {
  const featuredBookmarks = bookmarks.filter(b => b.data.featured);
  const regularBookmarks = bookmarks.filter(b => !b.data.featured);
  return { featuredBookmarks, regularBookmarks };
};

// Optimized approach (for...of)
const forOfApproach = () => {
  const featuredBookmarks = [];
  const regularBookmarks = [];
  for (const b of bookmarks) {
    if (b.data.featured) {
      featuredBookmarks.push(b);
    } else {
      regularBookmarks.push(b);
    }
  }
  return { featuredBookmarks, regularBookmarks };
};

// Warmup
for (let i = 0; i < 5; i++) {
    currentApproach();
    forOfApproach();
}

measure('Current Approach (two filters)', currentApproach);
measure('Optimized Approach (for...of)', forOfApproach);

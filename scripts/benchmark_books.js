
// Benchmark for book filtering logic
// Run with: node scripts/benchmark_books.js

const generateBooks = (count) => {
  const statuses = ['reading', 'completed', 'want-to-read', 'abandoned'];
  const books = [];
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const finishDate = status === 'completed' ? new Date(Date.now() - Math.random() * 10000000000) : undefined;
    books.push({
      data: {
        title: `Book ${i}`,
        status,
        finishDate,
      },
      slug: `book-${i}`,
    });
  }
  return books;
};

const currentImplementation = (allBooks) => {
  const reading = allBooks.filter(b => b.data.status === 'reading');
  const completed = allBooks.filter(b => b.data.status === 'completed')
    .sort((a, b) => (b.data.finishDate?.getTime() || 0) - (a.data.finishDate?.getTime() || 0));
  const wantToRead = allBooks.filter(b => b.data.status === 'want-to-read');
  return { reading, completed, wantToRead };
};

const optimizedImplementation = (allBooks) => {
  const reading = [];
  const completed = [];
  const wantToRead = [];

  for (const book of allBooks) {
    if (book.data.status === 'reading') {
      reading.push(book);
    } else if (book.data.status === 'completed') {
      completed.push(book);
    } else if (book.data.status === 'want-to-read') {
      wantToRead.push(book);
    }
  }

  completed.sort((a, b) => (b.data.finishDate?.getTime() || 0) - (a.data.finishDate?.getTime() || 0));

  return { reading, completed, wantToRead };
};

const runBenchmark = () => {
  const iterations = 100;
  const bookCount = 100000;
  const allBooks = generateBooks(bookCount);

  console.log(`Running benchmark with ${bookCount} books over ${iterations} iterations...`);

  let totalCurrentTime = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    currentImplementation(allBooks);
    totalCurrentTime += performance.now() - start;
  }
  const avgCurrentTime = totalCurrentTime / iterations;
  console.log(`Current Implementation Avg Time: ${avgCurrentTime.toFixed(4)} ms`);

  let totalOptimizedTime = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    optimizedImplementation(allBooks);
    totalOptimizedTime += performance.now() - start;
  }
  const avgOptimizedTime = totalOptimizedTime / iterations;
  console.log(`Optimized Implementation Avg Time: ${avgOptimizedTime.toFixed(4)} ms`);

  const improvement = ((avgCurrentTime - avgOptimizedTime) / avgCurrentTime) * 100;
  console.log(`Improvement: ${improvement.toFixed(2)}%`);
};

runBenchmark();

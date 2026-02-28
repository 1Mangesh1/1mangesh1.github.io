---
title: "React Infinite Scroll Hook"
description: "A custom React hook for infinite scrolling with Intersection Observer"
language: "typescript"
tags: ["react", "hooks", "ui"]
date: 2026-02-15T00:00:00Z
draft: true
---

## The Hook

```typescript
import { useEffect, useRef, useCallback, useState } from "react";

interface UseInfiniteScrollOptions {
  /** Function that fetches the next page. Return false when no more pages. */
  fetchMore: () => Promise<boolean>;
  /** IntersectionObserver threshold (0–1). Default: 0.1 */
  threshold?: number;
  /** Root margin for triggering earlier/later. Default: "200px" */
  rootMargin?: string;
  /** Whether fetching is allowed (e.g., disable while loading). */
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  /** Ref to attach to the sentinel element at the bottom of the list. */
  sentinelRef: React.RefCallback<HTMLElement>;
  /** Whether a fetch is currently in progress. */
  isLoading: boolean;
  /** Whether all pages have been loaded. */
  isComplete: boolean;
}

export function useInfiniteScroll({
  fetchMore,
  threshold = 0.1,
  rootMargin = "200px",
  enabled = true,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Stable reference to fetchMore to avoid re-creating the observer
  const fetchMoreRef = useRef(fetchMore);
  fetchMoreRef.current = fetchMore;

  const handleIntersect = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (!entry.isIntersecting || isLoading || isComplete || !enabled) return;

      setIsLoading(true);
      try {
        const hasMore = await fetchMoreRef.current();
        if (!hasMore) {
          setIsComplete(true);
        }
      } catch (error) {
        console.error("Infinite scroll fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isComplete, enabled]
  );

  // Use a ref callback so the observer re-attaches when the sentinel mounts
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || !enabled || isComplete) return;

      observerRef.current = new IntersectionObserver(handleIntersect, {
        threshold,
        rootMargin,
      });
      observerRef.current.observe(node);
    },
    [handleIntersect, threshold, rootMargin, enabled, isComplete]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return { sentinelRef, isLoading, isComplete };
}
```

## Usage Example

```tsx
import { useState } from "react";
import { useInfiniteScroll } from "./useInfiniteScroll";

interface Post {
  id: number;
  title: string;
  body: string;
}

export function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);

  const { sentinelRef, isLoading, isComplete } = useInfiniteScroll({
    fetchMore: async () => {
      const res = await fetch(`/api/posts?page=${page}&limit=20`);
      const data: Post[] = await res.json();

      if (data.length === 0) return false; // No more pages

      setPosts((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
      return true; // More pages available
    },
  });

  return (
    <div className="post-feed">
      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </article>
      ))}

      {/* Sentinel element — triggers fetch when scrolled into view */}
      {!isComplete && (
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
      )}

      {isLoading && <p className="loading-indicator">Loading more posts…</p>}
      {isComplete && <p className="end-message">You've reached the end!</p>}
    </div>
  );
}
```

**Key features:**

- Uses `IntersectionObserver` instead of scroll event listeners for performance.
- `rootMargin: "200px"` pre-fetches before the user reaches the bottom.
- Ref callback pattern ensures the observer re-attaches if the sentinel remounts.
- Returns `isLoading` and `isComplete` for UI feedback.
- Graceful error handling prevents the scroll from breaking on network failures.

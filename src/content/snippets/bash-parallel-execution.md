---
title: "Parallel Command Execution in Bash"
description: "Run multiple commands in parallel with proper error handling and output collection"
language: "bash"
tags: ["parallel", "automation", "performance"]
date: 2026-01-30T00:00:00Z
draft: true
---

## 1. Background Processes with `wait`

The simplest built-in approach — no extra tools required:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Launch jobs in background
urls=(
  "https://api.example.com/users"
  "https://api.example.com/orders"
  "https://api.example.com/products"
)

pids=()
for url in "${urls[@]}"; do
  curl -sS "$url" -o "/tmp/$(basename "$url").json" &
  pids+=($!)   # capture the PID of each background job
done

# Wait for all and collect exit codes
failures=0
for pid in "${pids[@]}"; do
  if ! wait "$pid"; then
    echo "Job $pid failed" >&2
    ((failures++))
  fi
done

if ((failures > 0)); then
  echo "$failures job(s) failed" >&2
  exit 1
fi

echo "All downloads complete"
```

## 2. GNU Parallel

Best for data-parallel workloads — handles job slots, retries, and output ordering:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Process images in parallel (4 jobs at a time, with progress bar)
find ./raw -name '*.png' | \
  parallel -j4 --bar --halt soon,fail=1 \
    'convert {} -resize 800x600 -quality 85 ./processed/{/}'

# Run multiple different commands, capturing output per job
parallel --tag --keep-order ::: \
  "echo 'Task A' && sleep 2 && echo 'A done'" \
  "echo 'Task B' && sleep 1 && echo 'B done'" \
  "echo 'Task C' && sleep 3 && echo 'C done'"

# Process a CSV: each line becomes one job
parallel -j8 --colsep ',' \
  'curl -sS "https://api.example.com/users/{1}" -o "output/{2}.json"' \
  :::: users.csv
```

## 3. `xargs -P` for Quick Parallelism

Available everywhere — good for simple fan-out:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Lint all JS files, 8 in parallel
find src -name '*.js' -print0 | \
  xargs -0 -P8 -I{} eslint --fix {}

# Download URLs from a file, 4 at a time
cat urls.txt | xargs -P4 -I{} curl -sS -O {}

# Parallel SSH commands across hosts
echo -e "web1\nweb2\nweb3" | \
  xargs -P3 -I{} ssh {} 'sudo systemctl restart nginx'
```

## 4. Job Control with Output Isolation

When you need per-job stdout/stderr without interleaving:

```bash
#!/usr/bin/env bash
set -euo pipefail

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

tasks=("lint" "typecheck" "test" "build-docs")

run_task() {
  local task=$1
  local outfile="$tmpdir/$task.log"

  echo "Starting: $task"
  case "$task" in
    lint)       eslint src/ > "$outfile" 2>&1 ;;
    typecheck)  tsc --noEmit > "$outfile" 2>&1 ;;
    test)       jest --ci > "$outfile" 2>&1 ;;
    build-docs) typedoc > "$outfile" 2>&1 ;;
  esac
}

export -f run_task
export tmpdir

# Run all tasks in parallel
printf '%s\n' "${tasks[@]}" | parallel -j4 run_task {}
status=$?

# Print logs for any failed tasks
for task in "${tasks[@]}"; do
  if [[ -f "$tmpdir/$task.log" ]]; then
    echo "=== $task ===" 
    cat "$tmpdir/$task.log"
  fi
done

exit $status
```

## 5. Concurrency-Limited Loop (Pure Bash)

When you can't install GNU parallel:

```bash
#!/usr/bin/env bash
set -euo pipefail

MAX_JOBS=4

job_count() { jobs -rp | wc -l; }

items=( $(seq 1 20) )

for item in "${items[@]}"; do
  # Throttle: wait if we've hit the limit
  while (( $(job_count) >= MAX_JOBS )); do
    sleep 0.1
  done

  (
    echo "Processing item $item"
    sleep $((RANDOM % 3 + 1))  # simulate work
    echo "Finished item $item"
  ) &
done

wait
echo "All items processed"
```

**Choosing the right tool:**

| Approach | Install needed? | Error handling | Output ordering |
|---|---|---|---|
| `&` + `wait` | No | Manual PID tracking | Interleaved |
| `xargs -P` | No | Limited | Interleaved |
| GNU `parallel` | Yes | `--halt`, `--retry` | `--keep-order` |
| Job control loop | No | Manual | Isolated with temp files |

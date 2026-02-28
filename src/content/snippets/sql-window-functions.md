---
title: "SQL Window Functions Cheat Sheet"
description: "Essential SQL window functions with practical examples for analytics queries"
language: "sql"
tags: ["analytics", "queries"]
date: 2026-01-20T00:00:00Z
draft: true
---

## Ranking Functions

```sql
-- ROW_NUMBER: unique sequential number (no ties)
-- RANK:       same number for ties, gaps after       (1, 2, 2, 4)
-- DENSE_RANK: same number for ties, no gaps          (1, 2, 2, 3)

SELECT
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
  RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rank,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rank
FROM employees;
```

### Top-N per group (e.g., top 3 earners per department)

```sql
WITH ranked AS (
  SELECT
    name,
    department,
    salary,
    ROW_NUMBER() OVER (
      PARTITION BY department
      ORDER BY salary DESC
    ) AS rn
  FROM employees
)
SELECT * FROM ranked WHERE rn <= 3;
```

## LEAD and LAG — Access Adjacent Rows

```sql
-- Compare each month's revenue to the previous and next month
SELECT
  month,
  revenue,
  LAG(revenue, 1)  OVER (ORDER BY month) AS prev_month_revenue,
  LEAD(revenue, 1) OVER (ORDER BY month) AS next_month_revenue,
  revenue - LAG(revenue, 1) OVER (ORDER BY month) AS month_over_month_change,
  ROUND(
    100.0 * (revenue - LAG(revenue, 1) OVER (ORDER BY month))
    / NULLIF(LAG(revenue, 1) OVER (ORDER BY month), 0),
    2
  ) AS mom_pct_change
FROM monthly_revenue;
```

## Running Totals

```sql
-- Cumulative revenue by date
SELECT
  order_date,
  daily_revenue,
  SUM(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM daily_sales;

-- Running total per customer
SELECT
  customer_id,
  order_date,
  amount,
  SUM(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
  ) AS customer_running_total
FROM orders;
```

## Moving Averages

```sql
-- 7-day moving average of daily revenue
SELECT
  order_date,
  daily_revenue,
  AVG(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7d,
  -- 30-day moving average
  AVG(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
  ) AS moving_avg_30d
FROM daily_sales;
```

## FIRST_VALUE / LAST_VALUE / NTH_VALUE

```sql
-- For each employee: show the highest and lowest salary in their dept
SELECT
  name,
  department,
  salary,
  FIRST_VALUE(name) OVER (
    PARTITION BY department ORDER BY salary DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS highest_paid,
  LAST_VALUE(name) OVER (
    PARTITION BY department ORDER BY salary DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS lowest_paid
FROM employees;
```

## NTILE — Divide Rows into Buckets

```sql
-- Split customers into quartiles by lifetime spend
SELECT
  customer_id,
  total_spend,
  NTILE(4) OVER (ORDER BY total_spend DESC) AS spend_quartile
FROM customer_lifetime_value;
```

## Percent Rank and Cumulative Distribution

```sql
SELECT
  name,
  salary,
  PERCENT_RANK() OVER (ORDER BY salary) AS pct_rank,    -- 0 to 1
  CUME_DIST()    OVER (ORDER BY salary) AS cume_dist     -- fraction ≤ current value
FROM employees;
```

## Named Window Clause (DRY)

Reuse the same window definition across multiple functions:

```sql
SELECT
  order_date,
  daily_revenue,
  SUM(daily_revenue) OVER w AS running_total,
  AVG(daily_revenue) OVER w AS running_avg,
  COUNT(*)           OVER w AS running_count
FROM daily_sales
WINDOW w AS (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
ORDER BY order_date;
```

**Quick reference for frame clauses:**

| Frame | Meaning |
|---|---|
| `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` | All rows from start to current |
| `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` | Last 7 rows (inclusive) |
| `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` | Entire partition |
| `ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING` | Current to end |

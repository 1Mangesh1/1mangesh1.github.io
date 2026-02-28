---
title: "Idiomatic Go Error Handling"
description: "A clean pattern for wrapping and handling errors in Go with context"
language: "go"
tags: ["errors", "patterns"]
date: 2026-02-20T00:00:00Z
draft: true
---

## Custom Error Types

Define domain-specific errors that carry structured context:

```go
package order

import (
	"errors"
	"fmt"
)

// Sentinel errors for quick comparisons
var (
	ErrNotFound     = errors.New("order not found")
	ErrUnauthorized = errors.New("unauthorized access")
)

// Custom error type with context
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation failed on %q: %s", e.Field, e.Message)
}
```

## Wrapping Errors with `fmt.Errorf` and `%w`

Always wrap errors to preserve the chain and add context at each layer:

```go
func GetOrder(id string) (*Order, error) {
	order, err := db.FindOrder(id)
	if err != nil {
		// %w wraps the original error so callers can unwrap it
		return nil, fmt.Errorf("GetOrder(%s): %w", id, err)
	}
	return order, nil
}

func ProcessRefund(orderID string) error {
	order, err := GetOrder(orderID)
	if err != nil {
		return fmt.Errorf("ProcessRefund: %w", err)
	}

	if order.Status != "completed" {
		return fmt.Errorf("ProcessRefund: %w",
			&ValidationError{Field: "status", Message: "order must be completed"})
	}

	return nil
}
```

## Inspecting Errors with `errors.Is` and `errors.As`

```go
func HandleRequest(orderID string) {
	err := ProcessRefund(orderID)
	if err == nil {
		fmt.Println("Refund processed successfully")
		return
	}

	// errors.Is checks anywhere in the wrapped chain
	if errors.Is(err, ErrNotFound) {
		fmt.Println("404 — order does not exist")
		return
	}

	// errors.As extracts a specific error type from the chain
	var valErr *ValidationError
	if errors.As(err, &valErr) {
		fmt.Printf("400 — bad field %q: %s\n", valErr.Field, valErr.Message)
		return
	}

	// Fallback
	fmt.Printf("500 — unexpected error: %v\n", err)
}
```

## Practical Pattern: Repository Layer

```go
type OrderRepo struct {
	db *sql.DB
}

func (r *OrderRepo) FindByID(ctx context.Context, id string) (*Order, error) {
	row := r.db.QueryRowContext(ctx, "SELECT id, status, total FROM orders WHERE id = $1", id)

	var o Order
	err := row.Scan(&o.ID, &o.Status, &o.Total)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("OrderRepo.FindByID(%s): %w", id, ErrNotFound)
		}
		return nil, fmt.Errorf("OrderRepo.FindByID(%s): %w", id, err)
	}

	return &o, nil
}
```

**Key takeaways:**

- Use `%w` in `fmt.Errorf` to wrap errors — never discard the original.
- Use sentinel errors (`var Err... = errors.New(...)`) for expected conditions.
- Use custom error types (implementing `Error() string`) when you need structured data.
- Use `errors.Is` for sentinels and `errors.As` for typed errors.
- Add context at every layer so the full call path is visible in logs.

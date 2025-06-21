---
title: "How to implement soft delete in Django"
description: "Learn how to implement soft delete functionality in Django using custom managers and model mixins."
pubDate: 2025-02-13T00:00:00Z
tags: ["Django", "Soft Delete"]
---

In this post, I will show you how to implement soft delete in Django. Soft delete is a technique used to mark a record as deleted without actually removing it from the database. This is useful when you want to keep a record of deleted items or when you want to restore them later.

## Step 1: We will create a custom manager to handle soft delete

```python

class SoftDeletableManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)
```

## Step 2: We will create a mixin to add soft delete functionality to models

```python
class SoftDeletableModel(models.Model):
    deleted_at = models.DateTimeField(null=True, default=None)
    objects = SoftDeletableManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self):
        self.deleted_at = timezone.now()
        for field in self._meta.fields:
            if field.unique and getattr(self, field.name):
                current_value = getattr(self, field.name)
                setattr(
                    self,
                    field.name,
                    f"{current_value}__deleted_{self.deleted_at.timestamp()}",
                )
        self.save()

    def restore(self):
        for field in self._meta.fields:
            if field.unique and getattr(self, field.name):
                current_value = getattr(self, field.name)
                if "__deleted_" in current_value:
                    original_value = current_value.split("__deleted_")[0]
                    exists_query = Q(**{field.name: original_value})
                    if self.__class__.objects.filter(exists_query).exists():
                        raise IntegrityError(
                            f"Cannot restore record - {field.name} with value '{original_value}' already exists"
                        )

                    setattr(self, field.name, original_value)

        self.deleted_at = None
        self.save()
```

## Step 3: We will create a model that uses the mixin

```python

class Post(SoftDeletableModel):
    title = models.CharField(max_length=100)
    content = models.TextField()
```

Now you can use the `delete` and `restore` methods on instances of the `Post` model to soft delete and restore records.

That's it! You have successfully implemented soft delete in Django. I hope you found this post helpful. If you have any questions or feedback, feel free to dm me on [X](https://x.com/Mangesh_Bide) mail me at [gmail](mailto:mangeshsbide@gmail.com]).


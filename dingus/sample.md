## Welcome to CommonMark

You can play with CommonMark by editing the text on
the left and seeing how it renders on the right.

> Here's a *block quote with a **list***:
>
> 1. foo
> 2. bar

Some inline code: `x >>= y`.

Fenced code:

``` haskell
fibs = 0 : 1 : next fibs
  where
      next (a : t@(b:_)) = (a+b) : next t
```

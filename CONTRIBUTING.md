Contributing
============

Submitting bug reports
----------------------

There is a [forum for discussing CommonMark](http://talk.commonmark.org);
use it for questions and discussions that might be open-ended. Use the
[github issue tracker](http://github.com/jgm/commonmark.js/issues)
only for simple, clear, actionable issues.

Submitting pull requests
------------------------

1. A good pull request makes one logical change and does not mix
   several independent changes.
2. If you have several commits that successively refine a single
   logical change, rebase them into a single clean commit.
3. Ensure that all tests pass (`make test`).
4. Use `make lint` to check for problems.
5. Ensure that performance has not been affected (`make bench` before
   and after the change).
6. Changes to `dist` should not be committed.  (We will regenerate
   `dist/commonmark.js` before a release.)
7. Follow the style of the existing code.

oven
====

A Userscript Manager in Userscript

Install
=======
Oven can be installed [Here][oven.user.js]. Oven will try to update itself.
Self-updating works even if the browser has no support for updating userscripts.

[oven.user.js]: https://github.com/quietlynn/oven/raw/master/oven.user.js

Note
====
For now, Oven only works on Google+. Oven will check the current URL to ensure
that it begins with "https://plus.google.com/".

Permissions
===========
Oven runs only on Google+, but it matches all URLs in order to workaround the
absence of cross-domain XHRs in Google Chrome.

Storage
=======
Oven stores all the snippets along with the updated version of itself in
localStorage. They are subject to the storage limit (~5MB in major browsers).

Oven and the host website share the storage quota.

Currently, Oven has no error handling measures regarding storage limits.

Snippets
========
Snippets can be hosted anywhere including Github. However, this project only
focuses on the manager itself and therefore contains only the builtin snippets.

Some of my snippets for Google+ can be found [here][oven-gplus].

[oven-gplus]: https://github.com/quietlynn/oven-gplus

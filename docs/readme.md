# Documentation
This folder contains guides and other miscellaneous documentation for nrelay.

The code in the `src/` folder has extensive inline documentation through the use of JSDoc comments. One of the best ways to explore this documentation is by using a code editor like [VSCode](https://code.visualstudio.com/), which utilises these comments to provide a rich intellisense experience.

If you prefer to read through the documentation online, or simply need a quick reference, the entire inline documentation is also available at [docs.nrelay.net](https://docs.nrelay.net/)

### `plugin-recipes/`
The plugin recipes folder contains tutorials on how to create a variety of plugins. Use these docs if you are looking for ideas for plugins, or want to learn more about how to create functional plugins.

### [`creating-plugins.md`](creating-plugins.md)
This is a guide which provides a tutorial on how to write a basic plugin, including some of the services which are available to plugins.

Use this document to learn about the process of creating plugins which utilize available features.

### [`packet-structures.md`](packet-structures.md)
This document includes documentation for all packets which are currently implemented. The documentation includes all members which are available in the packets as well as a description of what the members are. __Some of the member descriptions may not be accurate__. If an inacuracy is suspected, there will usually be a note outlining several possibilities of what the member actually is. If you notice an incorrect member description, please open an issue outlining which description is incorrect and what the correct description is.

Use this document to learn about what members are available for packets of interest.

### [`the-standard-library.md`](the-standard-library.md)
This document provides an overview of the nrelay standard library, and includes example usages of each library that is available to use.

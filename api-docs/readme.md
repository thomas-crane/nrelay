# nrelay docs
This website provides documentation for the source code of nrelay.
[The main nrelay repository](https://github.com/thomas-crane/nrelay/blob/master/docs/readme.md) has further documentation in the form of guides and tutorials about using nrelay.

This website is generated using the [TypeDoc](http://typedoc.org/) documentation generator.
It uses the inline JSDoc comments that are written in the nrelay source. The documentation is divided in to several logically related modules:
+ [cli](https://docs.nrelay.net/modules/cli.html)
  + The CLI of nrelay and other related classes.
+ [core](https://docs.nrelay.net/modules/core.html)
  + The core entities and classes of nrelay, such as the `Client`.
+ [crypto](https://docs.nrelay.net/modules/crypto.html)
  + Classes used to provide cryptographic algorithm implementations used in RotMG.
+ [decorators](https://docs.nrelay.net/modules/decorators.html)
  + TypeScript decorators used to interact with nrelay.
+ [models](https://docs.nrelay.net/modules/models.html)
  + Enums, interfaces and classes which represent object structures and values used by nrelay or RotMG.
+ [networking](https://docs.nrelay.net/modules/networking.html)
  + Classes and interfaces related to the networking code of nrelay.
  + [/data](https://docs.nrelay.net/modules/networking_data.html)
    + Data packets used by RotMG.
  + [/packets/incoming](https://docs.nrelay.net/modules/networking_packets_incoming.html)
    + Packets which are sent from the server to the client.
  + [/packets/outgoing](https://docs.nrelay.net/modules/networking_packets_outgoing.html)
    + Packets which are sent from the client to the server.
+ [services](https://docs.nrelay.net/modules/services.html)
  + Mostly static classes that provide helpful utility functions used throughout nrelay.
  + [/http](https://docs.nrelay.net/modules/services_http.html)
    + Classes relating to http functionality.
  + [/logging](https://docs.nrelay.net/modules/services_logging.html)
    + Classes related to the logging mechanism.
  + [/pathfinding](https://docs.nrelay.net/modules/services_pathfinding.html)
    + Classes relating to the A* pathfinder implementation.
+ [stdlib](https://docs.nrelay.net/modules/stdlib.html)
  + The nrelay standard library.


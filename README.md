Hashget is a super-simple single-file file transfer CLI tool with peer discovery.

Most of the heavy lifting here is done by [discovery-channel](https://github.com/mafintosh/discovery-channel) and [discovery-server](https://github.com/mafintosh/discovery-server)!

## Usage

On the server:

`hashget awesome_file.txt --serve`

This will output the command you have to run on a client to receive the file!

## Current status

Currently, this project.. somewhat works. It's mostly a research project, to figure out how discovery-swarm works and how it can be used to practical applications.

However, there's several issues with files not always being received properly, and currently there's also ZERO security, meaning that ANYONE who connects with you MAY receive (parts of) the file you're hosting. This obviously needs to be addressed, e.g. by generating a secure random secret each time you serve a file, and only sending file contents to whomever knows said secret.
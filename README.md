Hashget is a super-simple single-file file transfer CLI tool with peer discovery.

Most of the heavy lifting here is done by [discovery-channel](https://github.com/mafintosh/discovery-channel) and [discovery-server](https://github.com/mafintosh/discovery-server)!

## Usage

On the server:

`hashget awesome_file.txt --serve`

This will output the command you have to run on a client to receive the file!

## Current status

Currently, this project.. somewhat works and is a **work in progress**. There may be bugs, even in core functionality, and what little security features have been added currently do *not* prevent your files from getting in the hands of people who know what they're doing. Hashget is currently mostly a research project, to figure out how discovery-channel and discovery-server work and how they can be used for practical applications.
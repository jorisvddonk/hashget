Hashget is a super-simple single-file file transfer CLI tool with peer discovery.

Most of the heavy lifting here is done by [discovery-channel](https://github.com/mafintosh/discovery-channel) and [discovery-server](https://github.com/mafintosh/discovery-server)!

## Usage

On the server:

`hashget awesome_file.txt --serve`

This will output the command you have to run on a client to receive the file!

## Current status

Currently, this project.. somewhat works. It's mostly a research project, to figure out how discovery-channel and discovery-server works and how it can be used to practical applications.
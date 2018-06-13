Hashget is a super-simple single-file file transfer CLI tool with peer discovery.

Most of the heavy lifting here is done by [discovery-swarm](https://github.com/mafintosh/discovery-swarm)!

## Usage

On the server:

`hashget awesome_file.txt --serve`

This will output the command you have to run on a client to receive the file!

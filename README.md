# build-ocaml

_Use [ocamlbuild] and [build] to compile your OCaml files in Atom._


## Usage

If your project contains a `_tags` file, this package provides build targets and
corresponding atom commands compatible with your currently active file.

*This is not a replacement for a decent build system, but can be used to quickly
compile individual files*


## Installation

This package requires [build], [linter] and [ocamlbuild].

```sh
apm install build linter build-oasis
opam install oasis
```


[ocamlbuild]: https://github.com/ocaml/ocamlbuild
[build]: https://atom.io/packages/build
[linter]: https://atom.io/packages/linter

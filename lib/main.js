'use babel'

import path from 'path'
import fs from 'fs'
import EventEmitter from 'events'
import {TextEditor} from 'atom'

const errorMatch = '(?s)"(?<file>[\\/0-9a-zA-Z\\._\\-]+)", line (?<line>\\d+), characters (?<col>\\d+)-(?<col_end>\\d+):\\s*(?<message>.+?)\\n\\S'

const targets = {
  '.ml': {
    '.native': 'Native Executable',
    '.byte': 'Bytecode Executable',
    '.cmo': 'Bytecode Object',
    '.cmx': 'Native Object',
    '.inferred.mli': 'Inferred Interface'
  },
  'mli': {
    '.cmi': 'Compiled Interface'
  },
  '.mllib': {
    '.cma': 'Bytecode Library',
    '.cmxa': 'Native Library'
  },
  '.mldylib': {
    '.cmxs': 'Native Plugin'
  },
  '.odocl': {
    '.docdir/index.html': 'HTML Documentation'
  },
  '.mly': {
    '.ml': 'Menhir Parser'
  },
  '.mlypack': {
    '.ml': 'Menhir Parser'
  },
  '.mlpack': {
    '.cmo': 'Bytecode Object',
    '.cmx': 'Native Object'
  },
  '.mltop': {
    '.top': 'Custom Toplevel'
  }
}

function buildTargets (file) {
  const exec = atom.config.get('build-ocaml.ocamlbuildPath')
  const p = path.parse(file)
  const fileTargets = targets[p.ext]
  const base = path.join(p.dir, p.name)
  const args = atom.config.get('build-ocaml.ocamlbuildArgs')

  const settings = []

  for (const ext in fileTargets) {
    const name = fileTargets[ext]
    const command = name.toLowerCase().replace(' ', '-')
    settings.push({
      exec,
      name,
      args: args.concat([base + ext]),
      atomCommandName: `build-ocaml:${command}`,
      errorMatch
    })
  }

  settings.push({
    exec,
    name: 'Clean',
    args: ['-clean'],
    atomCommandName: `build-ocaml:clean`
  })

  return settings
}

export function provideBuilder () {
  return class OcamlbuildBuildProvider extends EventEmitter {
    constructor (cwd) {
      super()
      this.cwd = cwd
    }

    destructor () {
      if (this.disposable) this.disposable.dispose()
    }

    getNiceName () {
      return 'Ocamlbuild'
    }

    isEligible () {
      if (fs.existsSync(path.join(this.cwd, '_tags'))) {
        if (!this.disposable) {
          this.disposable = atom.workspace.onDidStopChangingActivePaneItem((item) => {
            if (item instanceof TextEditor) {
              this.emit('refresh')
            }
          })
        }
        return true
      } else {
        if (this.disposable) this.disposable.dispose()
        this.disposable = null
        return false
      }
    }

    settings () {
      const editor = atom.workspace.getActiveTextEditor()
      if (editor && editor.getPath()) {
        const file = path.relative(this.cwd, editor.getPath())
        return buildTargets(file)
      } else {
        return []
      }
    }
  }
}

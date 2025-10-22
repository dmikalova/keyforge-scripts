# kf-format-generator

Randomly generate formats for playing KeyForge

## OCLIF

# oclif-hello-world

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g keyforge-format-generator
$ keyforge-format-generator COMMAND
running command...
$ keyforge-format-generator (--version)
keyforge-format-generator/0.0.0 darwin-arm64 node-v20.10.0
$ keyforge-format-generator --help [COMMAND]
USAGE
  $ keyforge-format-generator COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [kf-format-generator](#kf-format-generator)
  - [OCLIF](#oclif)
- [oclif-hello-world](#oclif-hello-world)
- [Usage](#usage)
- [Commands](#commands)
  - [`keyforge-format-generator hello PERSON`](#keyforge-format-generator-hello-person)
  - [`keyforge-format-generator hello world`](#keyforge-format-generator-hello-world)
  - [`keyforge-format-generator help [COMMANDS]`](#keyforge-format-generator-help-commands)
  - [`keyforge-format-generator plugins`](#keyforge-format-generator-plugins)
  - [`keyforge-format-generator plugins:install PLUGIN...`](#keyforge-format-generator-pluginsinstall-plugin)
  - [`keyforge-format-generator plugins:inspect PLUGIN...`](#keyforge-format-generator-pluginsinspect-plugin)
  - [`keyforge-format-generator plugins:install PLUGIN...`](#keyforge-format-generator-pluginsinstall-plugin-1)
  - [`keyforge-format-generator plugins:link PLUGIN`](#keyforge-format-generator-pluginslink-plugin)
  - [`keyforge-format-generator plugins:uninstall PLUGIN...`](#keyforge-format-generator-pluginsuninstall-plugin)
  - [`keyforge-format-generator plugins reset`](#keyforge-format-generator-plugins-reset)
  - [`keyforge-format-generator plugins:uninstall PLUGIN...`](#keyforge-format-generator-pluginsuninstall-plugin-1)
  - [`keyforge-format-generator plugins:uninstall PLUGIN...`](#keyforge-format-generator-pluginsuninstall-plugin-2)
  - [`keyforge-format-generator plugins update`](#keyforge-format-generator-plugins-update)

## `keyforge-format-generator hello PERSON`

Say hello

```
USAGE
  $ keyforge-format-generator hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/dmikalova/keyforge-format-generator/blob/v0.0.0/src/commands/hello/index.ts)_

## `keyforge-format-generator hello world`

Say hello world

```
USAGE
  $ keyforge-format-generator hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ keyforge-format-generator hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/dmikalova/keyforge-format-generator/blob/v0.0.0/src/commands/hello/world.ts)_

## `keyforge-format-generator help [COMMANDS]`

Display help for keyforge-format-generator.

```
USAGE
  $ keyforge-format-generator help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for keyforge-format-generator.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/src/commands/help.ts)_

## `keyforge-format-generator plugins`

List installed plugins.

```
USAGE
  $ keyforge-format-generator plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ keyforge-format-generator plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/index.ts)_

## `keyforge-format-generator plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ keyforge-format-generator plugins add plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ keyforge-format-generator plugins add

EXAMPLES
  $ keyforge-format-generator plugins add myplugin

  $ keyforge-format-generator plugins add https://github.com/someuser/someplugin

  $ keyforge-format-generator plugins add someuser/someplugin
```

## `keyforge-format-generator plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ keyforge-format-generator plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ keyforge-format-generator plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/inspect.ts)_

## `keyforge-format-generator plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ keyforge-format-generator plugins install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ keyforge-format-generator plugins add

EXAMPLES
  $ keyforge-format-generator plugins install myplugin

  $ keyforge-format-generator plugins install https://github.com/someuser/someplugin

  $ keyforge-format-generator plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/install.ts)_

## `keyforge-format-generator plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ keyforge-format-generator plugins link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ keyforge-format-generator plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/link.ts)_

## `keyforge-format-generator plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ keyforge-format-generator plugins remove plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ keyforge-format-generator plugins unlink
  $ keyforge-format-generator plugins remove

EXAMPLES
  $ keyforge-format-generator plugins remove myplugin
```

## `keyforge-format-generator plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ keyforge-format-generator plugins reset
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/reset.ts)_

## `keyforge-format-generator plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ keyforge-format-generator plugins uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ keyforge-format-generator plugins unlink
  $ keyforge-format-generator plugins remove

EXAMPLES
  $ keyforge-format-generator plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/uninstall.ts)_

## `keyforge-format-generator plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ keyforge-format-generator plugins unlink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ keyforge-format-generator plugins unlink
  $ keyforge-format-generator plugins remove

EXAMPLES
  $ keyforge-format-generator plugins unlink myplugin
```

## `keyforge-format-generator plugins update`

Update installed plugins.

```
USAGE
  $ keyforge-format-generator plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.1.10/src/commands/plugins/update.ts)_

<!-- commandsstop -->

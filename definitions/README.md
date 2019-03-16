# Lib Discord Definitions

Each 'module' in this directory will be exposed to plugins through `require('file-name')`. Their definitions should be complete enough to make them unique.

Folders should be used to collect similar modules together into a single namespace, and contain an `index.ts` file describing how they are grouped. (This will be compiled to js and run aware of the relative paths in the folder)

> JS files will be completely ignored, so feel free to use them for processing.

The plan is to set `webpackJson` in the preload script so as to hijack the normal webpack module handler. This will mean we have full control over

- Require calls
  - Full chain
- Webpacked Group load calls
  - Full chain

This means we can build the string>module map as modules are individually loaded, and automatically associate Groups with modules for future loads, improving performance by removing the need for all modules to be evaluated at startup.

This directory will be processed by a single time script (Should be part of the release process) which runs in the renderer - first loading and requiring every module in discord's webpack, then finding the simplest versions of every type in the directory which can be used to identify them. This will be saved as JSON and shipped with the client to provide mappings for the internal modules.

Optional: Have the mappings be downloaded at startup, to make updates faster. This shouldn't be needed so long as we make a solid auto-updater. If there was ever an error in the mappings, we could instantly let the user know they were out of date, and disable plugins until they restarted
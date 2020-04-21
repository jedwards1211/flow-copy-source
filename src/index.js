'use strict';

const path = require('path');
const Kefir = require('kefir');
const kefirGlob = require('./kefir-glob');
const kefirCopyFile = require('./kefir-copy-file');

const jsAndJsxPattern = '**/*.{js,mjs,jsx}';

module.exports = function flowCopySource(sources, dest, options) {
  const verbose = options && options.verbose;
  const ignore = options && options.ignore;

  return Kefir.merge(
      sources.map(src => {
        let filesToCopy;
        filesToCopy = kefirGlob(jsAndJsxPattern, {cwd: src, strict: true, ignore});

        return filesToCopy.map(match => ({src, match}));
      })
    )
    .flatMap(pair =>
      kefirCopyFile(
        path.join(pair.src, pair.match),
        path.join(dest, pair.match+'.flow')
      )
    )
    .takeErrors(1)
    .onValue(result => {
      if (verbose) {
        console.log(result.src, '->', result.dest);
      }
    })
    .scan((list, result) => {
      list.push(result);
      return list;
    }, [])
    .toPromise();
};

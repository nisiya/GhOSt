#!/bin/sh
/Wendy/node_modules/typescript/bin/tsc --version
/Wendy/node_modules/typescript/bin/tsc --rootDir source/ --outDir distrib/  source/*.ts source/host/*.ts source/os/*.ts

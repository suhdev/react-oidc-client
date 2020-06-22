rm -rf lib
tsc -p ./tsconfig.build.json --target es5 --jsx react --module commonjs --outDir lib/es5/commonjs
tsc -p ./tsconfig.build.json --target esnext --jsx react --module esnext --outDir lib/esnext/esnext
tsc -p ./tsconfig.build.json --target esnext --jsx react --module commonjs --outDir lib/esnext/commonjs
tsc -p ./tsconfig.build.json --target es6 --jsx react --module esnext --outDir lib/es6/esnext
tsc -p ./tsconfig.build.json --target es6 --jsx react --module commonjs --outDir lib/es6/commonjs
tsc -p ./tsconfig.build.json --target es2015 --jsx react --module esnext --outDir lib/es2015/esnext
tsc -p ./tsconfig.build.json --target es2015 --jsx react --module commonjs --outDir lib/es2015/commonjs
tsc -p ./tsconfig.build.json --target es2016 --jsx react --module esnext --outDir lib/es2016/esnext
# Base93

**Base93** is a binary-to-text encoding schemes that represent binary data in an ASCII string format. 

It is based on Joachim Henke's [BasE91](http://base91.sourceforge.net/) with [small modification](https://github.com/ticlo/jsonesc/commit/df4516616b6088ed2c07e8986094b25afb0a45cb#diff-e5daa9e13f272067963c7e68fd9afd3d) to optimize JSON encoding.

## Base93 vs BasE91 vs Base64

||Characters|JSON Encoded Size / Binary Size|
|:---:|:---:|:---:|
|Base93| \ " are not used|1.22551|
|BasE91| \ - ' space are not used|1.23897*|
|Base64|A-Z a-Z 0-9 + /|1.33333|

\* BasE91's original encoding ratio is 1.22974, but in JSON it's a little bit worse since " will be encoded to \\".

## Source Code

* [c](https://github.com/ticlo/jsonesc/tree/master/base93/c)
* [typescript](https://github.com/ticlo/jsonesc/blob/master/src/base93.ts)
* [javascript](https://github.com/ticlo/jsonesc/blob/master/dist/base93.js)

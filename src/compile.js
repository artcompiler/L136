/* Copyright (c) 2021, ARTCOMPILER INC */
import {assert, message, messages, reserveCodeRange} from "./share.js";
import {Compiler as BasisCompiler} from '@graffiticode/basis/compiler.js';
//import {Compiler as BasisCompiler} from '../../../../work/graffiticode/basis/src/compiler.js';
export const compiler = new BasisCompiler({
  langID: 136,
  version: 'v0.0.0',
});

/* Copyright (c) 2021, ARTCOMPILER INC */
import {assert, message, messages, reserveCodeRange} from "./share.js";
import {Compiler as BasisCompiler} from '@graffiticode/basis';
//import {Compiler as BasisCompiler} from '../../../../work/graffiticode/basis/index.js';
export const compiler = new BasisCompiler({
  langID: 136,
  version: 'v0.0.0',
});

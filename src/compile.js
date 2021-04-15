/* Copyright (c) 2021, ARTCOMPILER INC */
import {assert, message, messages, reserveCodeRange} from "./share.js";
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';
//} from '../../../../work/graffiticode/basis/index.js';

export class Checker extends BasisChecker {
  SUNBURST(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [];
      const val = node;
      resume(err, val);
    });
  }
}

export class Transformer extends BasisTransformer {
  SUNBURST(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [];
      const val = {
        type: 'sunburst',
        data: v0,
      };
      resume(err, val);
    });
  }
}

export const compiler = new BasisCompiler({
  langID: 136,
  version: 'v0.0.0',
  Checker: Checker,
  Transformer: Transformer,
});

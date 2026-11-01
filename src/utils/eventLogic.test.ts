/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runDiagnosticSelfTests } from './diagnostics.utils';

describe('Atelier Event Studio Diagnostic Suite Mirror', () => {
  it('executes all 12 diagnostic assertions with 100% pass rate', () => {
    const summary = runDiagnosticSelfTests();
    assert.equal(summary.total, 12);
    assert.equal(summary.passedCount, 12);
    assert.equal(summary.allPassed, true);
  });
});

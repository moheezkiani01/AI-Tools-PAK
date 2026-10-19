import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

test('extra cursor ring, trail, and bubbles are not loaded', () => {
  assert.doesNotMatch(app, /CursorEffects|showCursor/);
  assert.doesNotMatch(styles, /cursor-ring|cursor-dot/);
  assert.equal(existsSync(new URL('../src/components/CursorEffects.jsx', import.meta.url)), false);
});

test('existing non-cursor hover animations remain in place', () => {
  assert.match(app, /initMouseEffects/);
  assert.match(styles, /\.depth-1/);
});

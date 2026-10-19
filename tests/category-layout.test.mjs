import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { categories } from '../src/data/categories.js';

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const order = categories.map((item) => item.slug);

test('last four category cards are Marketing, VPN, Entertainment, Discounts', () => {
  assert.deepEqual(order.slice(-4), ['marketing-tools', 'vpn-security', 'entertainment', 'discounts']);
});

test('only the first two featured tiles are wide on desktop', () => {
  const classes = app.match(/const categoryCardClasses = \{([\s\S]*?)\};/)?.[1] || '';
  assert.match(classes, /"ai-tools": "lg:col-span-2 lg:row-span-2"/);
  assert.match(classes, /"creative-tools": "lg:col-span-2"/);
  for (const slug of order.slice(-4)) assert.equal(classes.includes(`"${slug}":`), false, `${slug} must use one grid column`);
  assert.match(app, /lg:grid-cols-4/);
  assert.match(app, /categoryCardClasses\[c\.slug\] \|\| ""/);
});

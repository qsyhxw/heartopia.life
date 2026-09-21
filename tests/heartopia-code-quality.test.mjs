import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractCandidateSignals,
  mergeSignal,
  promotionDecision,
  shouldRetire,
  sourceIdentity
} from '../scripts/lib/heartopia-code-quality.mjs';

const stopwords = new Set(['heartopia', 'codes', 'code', 'active', 'expired']);
const known = new Set();

test('counts independent domains instead of URLs', () => {
  assert.equal(sourceIdentity('https://www.example.com/a'), 'example.com');
  assert.equal(sourceIdentity('https://example.com/b'), 'example.com');
});

test('publishes a new code only when two independent active lists agree', () => {
  const one = extractCandidateSignals('<h2>Active codes</h2><p>fresh123 - rewards</p>', 'https://one.example/codes', known, stopwords);
  const two = extractCandidateSignals('<h2>Current Heartopia codes</h2><p>fresh123 - claim rewards</p>', 'https://two.example/codes', known, stopwords);
  const hit = mergeSignal(mergeSignal(null, one.get('fresh123')), two.get('fresh123'));
  assert.deepEqual(promotionDecision(hit), { publish: true, reason: 'two_independent_current_sources' });
});

test('does not publish single-source or active/expired conflicts', () => {
  const active = extractCandidateSignals('<h2>Active codes</h2><p>mixed123 - rewards</p>', 'https://one.example/codes', known, stopwords);
  const expired = extractCandidateSignals('<h2>Expired codes</h2><p>mixed123 - old reward</p>', 'https://two.example/codes', known, stopwords);
  const single = active.get('mixed123');
  const conflict = mergeSignal(mergeSignal(null, single), expired.get('mixed123'));
  assert.equal(promotionDecision(single).publish, false);
  assert.equal(promotionDecision(conflict).publish, false);
});

test('retires only on two-source expired consensus with no active signal', () => {
  const one = extractCandidateSignals('<h2>Expired codes</h2><p>oldcode123 - reward</p>', 'https://one.example/codes', known, stopwords);
  const two = extractCandidateSignals('<h2>Expired codes</h2><p>oldcode123 - reward</p>', 'https://two.example/codes', known, stopwords);
  const hit = mergeSignal(mergeSignal(null, one.get('oldcode123')), two.get('oldcode123'));
  assert.equal(shouldRetire(hit), true);
});

test('an official post can publish a code without a second tracker', () => {
  const official = extractCandidateSignals('<p>New Heartopia redeem code official123 — claim rewards now</p>', 'https://x.com/myheartopia/status/123', known, stopwords);
  assert.deepEqual(promotionDecision(official.get('official123')), { publish: true, reason: 'official_announcement' });
});

test('understands Japanese and Korean active/history sections', () => {
  const japanese = extractCandidateSignals('<h2>配布中のギフトコード</h2><p>fresh789</p><h2>過去のギフトコード</h2><p>oldcode789</p>', 'https://jp.example/codes', known, stopwords);
  const korean = extractCandidateSignals('<h3>사용 가능 (Active)</h3><p>fresh789</p><h3>만료된 코드 (Expired)</h3><p>oldcode789 Expired</p>', 'https://kr.example/codes', known, stopwords);
  assert.equal(japanese.get('fresh789').activeSources.size, 1);
  assert.equal(japanese.get('oldcode789').expiredSources.size, 1);
  assert.equal(korean.get('fresh789').activeSources.size, 1);
  assert.equal(korean.get('oldcode789').expiredSources.size, 1);
});

test('rejects reward fragments that resemble codes', () => {
  const hits = extractCandidateSignals('<h2>Active codes</h2><p>Eggsx10 2-Star valid123</p>', 'https://one.example/codes', known, stopwords);
  assert.equal(hits.has('eggsx10'), false);
  assert.equal(hits.has('2-star'), false);
  assert.equal(hits.has('valid123'), true);
});

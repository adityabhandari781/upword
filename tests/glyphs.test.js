import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createDisplayWord,
  drawPixelWord,
} from '../js/glyphs.js';

function createContext() {
  const fills = [];

  return {
    fills,
    fillStyle: '',
    imageSmoothingEnabled: true,
    fillRect(x, y, width, height) {
      fills.push({ x, y, width, height });
    },
  };
}

function filledRows(context, pixelSize = 1) {
  return new Set(
    context.fills
      .filter(({ width, height }) => width === pixelSize && height === pixelSize)
      .map(({ y }) => y / pixelSize),
  );
}

test('reveals the bottom row by default and the top row in top-down mode', () => {
  const bottomUp = createContext();
  const topDown = createContext();

  drawPixelWord(bottomUp, 'A', 1, { pixelSize: 1 });
  drawPixelWord(topDown, 'A', 1, { pixelSize: 1, revealDirection: 'top-down' });

  assert.deepEqual([...filledRows(bottomUp)], [6]);
  assert.deepEqual([...filledRows(topDown)], [0]);
});

test('reveals matching row pairs from the ends toward the center', () => {
  const firstPair = createContext();
  const secondPair = createContext();

  drawPixelWord(firstPair, 'A', 1, {
    pixelSize: 1,
    revealDirection: 'ends-to-center',
  });
  drawPixelWord(secondPair, 'A', 2, {
    pixelSize: 1,
    revealDirection: 'ends-to-center',
  });

  assert.deepEqual([...filledRows(firstPair)], [0, 6]);
  assert.deepEqual([...filledRows(secondPair)], [0, 1, 5, 6]);
});

test('mixed casing is chosen once per display word', () => {
  const randomValues = [0.2, 0.8, 0.3, 0.7, 0.1];
  const displayWord = createDisplayWord(
    'cabin',
    'mixed',
    () => randomValues.shift(),
  );

  assert.equal(displayWord, 'CaBiN');
});

test('case modes preserve the answer letters while changing display case', () => {
  assert.equal(createDisplayWord('cabin', 'uppercase'), 'CABIN');
  assert.equal(createDisplayWord('CABIN', 'lowercase'), 'cabin');
});

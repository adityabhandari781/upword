import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createDisplayWord,
  drawComicSansWord,
  drawPixelWord,
  drawTimesNewRomanWord,
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

function createTextContext() {
  const clipRects = [];
  const textFills = [];

  return {
    clipRects,
    textFills,
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect() {},
    save() {},
    restore() {},
    beginPath() {},
    rect(...args) {
      clipRects.push(args);
    },
    clip() {},
    measureText() {
      return {
        actualBoundingBoxAscent: 50,
        actualBoundingBoxDescent: 15,
      };
    },
    fillText(...args) {
      textFills.push(args);
    },
  };
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

test('Times New Roman starts at 24 pixels and reveals 12 more after a wrong guess', () => {
  const context = createTextContext();
  const topDownContext = createTextContext();
  const afterWrongGuessContext = createTextContext();

  const dimensions = drawTimesNewRomanWord(context, 'CABIN', 1, {
    pixelSize: 12,
    revealDirection: 'bottom-up',
  });
  drawTimesNewRomanWord(topDownContext, 'CABIN', 1, {
    pixelSize: 12,
    revealDirection: 'top-down',
  });
  drawTimesNewRomanWord(afterWrongGuessContext, 'CABIN', 2, {
    pixelSize: 12,
    revealDirection: 'bottom-up',
  });

  assert.equal(dimensions.height, 84);
  assert.deepEqual(context.clipRects, [[0, 60, dimensions.width, 24]]);
  assert.deepEqual(topDownContext.clipRects, [[0, 0, dimensions.width, 24]]);
  assert.deepEqual(afterWrongGuessContext.clipRects, [[0, 48, dimensions.width, 36]]);
  assert.equal(context.textFills.length, 1);
  assert.equal(context.textFills[0][0], 'CABIN');
  assert.equal(context.textFills[0][2], 59.5);
  assert.match(context.font, /Times New Roman/);
  assert.equal(context.textAlign, 'center');
  assert.equal(context.textBaseline, 'alphabetic');
});

test('Times New Roman halves the initial and incremental reveal per end', () => {
  const context = createTextContext();
  const afterWrongGuessContext = createTextContext();

  drawTimesNewRomanWord(context, 'CABIN', 1, {
    pixelSize: 12,
    revealDirection: 'ends-to-center',
  });
  drawTimesNewRomanWord(afterWrongGuessContext, 'CABIN', 2, {
    pixelSize: 12,
    revealDirection: 'ends-to-center',
  });

  assert.deepEqual(context.clipRects, [
    [0, 0, 348, 12],
    [0, 72, 348, 12],
  ]);
  assert.deepEqual(afterWrongGuessContext.clipRects, [
    [0, 0, 348, 18],
    [0, 66, 348, 18],
  ]);
});

test('Comic Sans starts at 24 pixels and reveals 12 more after a wrong guess', () => {
  const initialContext = createTextContext();
  const afterWrongGuessContext = createTextContext();

  const dimensions = drawComicSansWord(initialContext, 'CABIN', 1, {
    pixelSize: 12,
  });
  drawComicSansWord(afterWrongGuessContext, 'CABIN', 2, {
    pixelSize: 12,
  });

  assert.deepEqual(initialContext.clipRects, [[0, 60, dimensions.width, 24]]);
  assert.deepEqual(afterWrongGuessContext.clipRects, [[0, 48, dimensions.width, 36]]);
  assert.match(initialContext.font, /Comic Sans/);
});

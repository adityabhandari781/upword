export const GLYPH_WIDTH = 5;
export const GLYPH_HEIGHT = 7;
export const PIXEL_SIZE = 12;
const SMOOTH_INITIAL_REVEAL_HEIGHT = 24;
const SMOOTH_REVEAL_INCREMENT = 8;

const uppercaseGlyphs = {
  a: [
      '.###.', 
      '#...#', 
      '#...#', 
      '#####', 
      '#...#', 
      '#...#', 
      '#...#'
    ],
  b: [
      '####.', 
      '#...#', 
      '#...#', 
      '####.', 
      '#...#', 
      '#...#', 
      '####.'
    ],
  c: [
      '.####', 
      '#....', 
      '#....', 
      '#....', 
      '#....', 
      '#....', 
      '.####'
    ],
  d: [
      '####.', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '####.'
    ],
  e: [
      '#####', 
      '#....', 
      '#....', 
      '####.', 
      '#....', 
      '#....', 
      '#####'
    ],
  f: [
      '#####', 
      '#....', 
      '#....', 
      '####.', 
      '#....', 
      '#....', 
      '#....'
    ],
  g: [
      '.####', 
      '#....', 
      '#....', 
      '#.###', 
      '#...#', 
      '#...#', 
      '.###.'
    ],
  h: [
      '#...#', 
      '#...#', 
      '#...#', 
      '#####', 
      '#...#', 
      '#...#', 
      '#...#'
    ],
  i: [
      '#####', 
      '..#..', 
      '..#..', 
      '..#..', 
      '..#..', 
      '..#..', 
      '#####'
    ],
  j: [
      '..###', 
      '...#.', 
      '...#.', 
      '...#.', 
      '...#.', 
      '#..#.', 
      '.##..'
    ],
  k: [
      '#...#', 
      '#..#.', 
      '#.#..', 
      '##...', 
      '#.#..', 
      '#..#.', 
      '#...#'
    ],
  l: [
      '#....', 
      '#....', 
      '#....', 
      '#....', 
      '#....', 
      '#....', 
      '#####'
    ],
  m: [
      '#...#', 
      '##.##', 
      '#.#.#', 
      '#.#.#', 
      '#...#', 
      '#...#', 
      '#...#'
    ],
  n: [
      '#...#', 
      '##..#', 
      '##..#', 
      '#.#.#', 
      '#..##', 
      '#..##', 
      '#...#'
    ],
  o: [
      '.###.', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '.###.'
    ],
  p: [
      '####.', 
      '#...#', 
      '#...#', 
      '####.', 
      '#....', 
      '#....', 
      '#....'
    ],
  q: [
      '.###.', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#.#.#', 
      '#..#.', 
      '.##.#'
    ],
  r: [
      '####.', 
      '#...#', 
      '#...#', 
      '####.', 
      '#.#..', 
      '#..#.', 
      '#...#'
    ],
  s: [
      '.####', 
      '#....', 
      '#....', 
      '.###.', 
      '....#', 
      '....#', 
      '####.'
    ],
  t: [
      '#####', 
      '..#..', 
      '..#..', 
      '..#..', 
      '..#..', 
      '..#..', 
      '..#..'
    ],
  u: [
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '.###.'
    ],
  v: [
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '.#.#.', 
      '..#..'
    ],
  w: [
      '#...#', 
      '#...#', 
      '#...#', 
      '#.#.#', 
      '#.#.#', 
      '##.##', 
      '#...#'
    ],
  x: [
      '#...#', 
      '#...#', 
      '.#.#.', 
      '..#..', 
      '.#.#.', 
      '#...#', 
      '#...#'
    ],
  y: [
      '#...#', 
      '#...#', 
      '.#.#.', 
      '..#..', 
      '..#..', 
      '..#..', 
      '..#..'
    ],
  z: [
      '#####', 
      '....#', 
      '...#.', 
      '..#..', 
      '.#...', 
      '#....', 
      '#####'
    ],
};

const lowercaseGlyphs = {
  a: [
      '.....', 
      '.###.', 
      '....#', 
      '.####', 
      '#...#', 
      '#...#', 
      '.####'
    ],
  b: [
      '#....', 
      '#....', 
      '#....', 
      '#.##.', 
      '##..#', 
      '#...#', 
      '####.'
    ],
  c: [
      '.....', 
      '.####', 
      '#....', 
      '#....', 
      '#....', 
      '#....', 
      '.####'
    ],
  d: [
      '....#', 
      '....#', 
      '....#', 
      '.####', 
      '#...#', 
      '#...#', 
      '.####'
    ],
  e: [
      '.....', 
      '.###.', 
      '#...#', 
      '#####', 
      '#....', 
      '#....', 
      '.####'
    ],
  f: [
      '..##.', 
      '.#..#', 
      '.#...', 
      '####.', 
      '.#...', 
      '.#...', 
      '.#...'
    ],
  g: [
      '.....', 
      '.####', 
      '#...#', 
      '#...#', 
      '.####', 
      '....#', 
      '.###.'
    ],
  h: [
      '#....', 
      '#....', 
      '#....', 
      '####.', 
      '#...#', 
      '#...#', 
      '#...#'
    ],
  i: [
      '..#..', 
      '.....', 
      '.##..', 
      '..#..', 
      '..#..', 
      '..#..', 
      '.###.'
    ],
  j: [
      '...#.', 
      '.....', 
      '...#.', 
      '...#.', 
      '...#.', 
      '#..#.', 
      '.##..'
    ],
  k: [
      '#....', 
      '#....', 
      '#....', 
      '#..##', 
      '#.#..', 
      '##...', 
      '#..##'
    ],
  l: [
      '.##..', 
      '..#..', 
      '..#..', 
      '..#..', 
      '..#..', 
      '..#..', 
      '.###.'
    ],
  m: [
      '.....', 
      '##.##', 
      '#.#.#', 
      '#.#.#', 
      '#.#.#', 
      '#.#.#', 
      '#.#.#'
    ],
  n: [
      '.....', 
      '####.', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#'
    ],
  o: [
      '.....', 
      '.###.', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '.###.'
    ],
  p: [
      '.....', 
      '####.', 
      '#...#', 
      '#...#', 
      '####.', 
      '#....', 
      '#....'
    ],
  q: [
      '.....', 
      '.####', 
      '#...#', 
      '#...#', 
      '.####', 
      '....#', 
      '....#'
    ],
  r: [
      '.....', 
      '#.##.', 
      '##..#', 
      '#....', 
      '#....', 
      '#....', 
      '#....'
    ],
  s: [
      '.....', 
      '.####', 
      '#....', 
      '.###.', 
      '....#', 
      '....#', 
      '####.'
    ],
  t: [
      '.#...', 
      '.#...', 
      '####.', 
      '.#...', 
      '.#...', 
      '.#..#', 
      '.##..'
    ],
  u: [
      '.....', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '.####'
    ],
  v: [
      '.....', 
      '#...#', 
      '#...#', 
      '#...#', 
      '#...#', 
      '.#.#.', 
      '..#..'
    ],
  w: [
      '.....', 
      '#...#', 
      '#...#', 
      '#.#.#', 
      '#.#.#', 
      '##.##', 
      '#...#'
    ],
  x: [
      '.....', 
      '#...#', 
      '.#.#.', 
      '..#..', 
      '.#.#.', 
      '#...#', 
      '#...#'
    ],
  y: [
      '.....', 
      '#...#', 
      '#...#', 
      '.####', 
      '....#', 
      '....#', 
      '.###.'
    ],
  z: [
      '.....', 
      '#####', 
      '...#.', 
      '..#..', 
      '.#...', 
      '#....', 
      '#####'
    ],
};

export function wordDimensions(word, pixelSize = PIXEL_SIZE) {
  const logicalWidth = word.length * (GLYPH_WIDTH + 1) - 1;
  return {
    width: logicalWidth * pixelSize,
    height: GLYPH_HEIGHT * pixelSize,
  };
}

export function createDisplayWord(word, letterCase = 'uppercase', random = Math.random) {
  return [...word].map((letter) => {
    if (letterCase === 'lowercase') return letter.toLowerCase();
    if (letterCase === 'mixed') {
      return random() < 0.5 ? letter.toUpperCase() : letter.toLowerCase();
    }
    return letter.toUpperCase();
  }).join('');
}

function drawSmoothWord(
  context,
  word,
  visibleHeight,
  {
    pixelSize = PIXEL_SIZE,
    revealDirection = 'bottom-up',
    font,
  } = {},
) {
  const dimensions = wordDimensions(word, pixelSize);
  const clippedHeight = Math.max(0, Math.min(dimensions.height, visibleHeight));

  context.imageSmoothingEnabled = true;
  context.fillStyle = '#12202d';
  context.fillRect(0, 0, dimensions.width, dimensions.height);
  context.save();
  context.beginPath();

  if (revealDirection === 'ends-to-center') {
    context.rect(0, 0, dimensions.width, clippedHeight);
    context.rect(
      0,
      dimensions.height - clippedHeight,
      dimensions.width,
      clippedHeight,
    );
  } else {
    const y = revealDirection === 'top-down'
      ? 0
      : dimensions.height - clippedHeight;
    context.rect(0, y, dimensions.width, clippedHeight);
  }

  context.clip();
  context.fillStyle = '#f5b642';
  context.font = `${pixelSize * 6}px ${font}`;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  const metrics = context.measureText(word);
  const textY = (dimensions.height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
  context.fillText(word, dimensions.width / 2, textY);
  context.restore();

  return dimensions;
}

function smoothRevealHeight(dimensions, revealedRows, revealDirection) {
  if (revealedRows >= GLYPH_HEIGHT) return dimensions.height;

  const scale = revealDirection === 'ends-to-center' ? 0.5 : 1;
  return (SMOOTH_INITIAL_REVEAL_HEIGHT + Math.max(0, revealedRows - 1) * SMOOTH_REVEAL_INCREMENT) * scale;
}

export function drawTimesNewRomanWord(
  context,
  word,
  revealedRows,
  { pixelSize = PIXEL_SIZE, revealDirection = 'bottom-up' } = {},
) {
  const dimensions = wordDimensions(word, pixelSize);

  return drawSmoothWord(context, word, smoothRevealHeight(dimensions, revealedRows, revealDirection), {
    pixelSize,
    revealDirection,
    font: '"Times New Roman", Times, serif',
  });
}

export function drawComicSansWord(
  context,
  word,
  revealedRows,
  { pixelSize = PIXEL_SIZE, revealDirection = 'bottom-up' } = {},
) {
  const dimensions = wordDimensions(word, pixelSize);

  return drawSmoothWord(context, word, smoothRevealHeight(dimensions, revealedRows, revealDirection), {
    pixelSize,
    revealDirection,
    font: '"Comic Sans MS", "Comic Sans", cursive',
  });
}

export function drawPixelWord(
  context,
  word,
  revealedRows,
  { pixelSize = PIXEL_SIZE, revealDirection = 'bottom-up' } = {},
) {
  const dimensions = wordDimensions(word, pixelSize);
  const visibleRows = Math.max(0, Math.min(GLYPH_HEIGHT, revealedRows));
  const firstVisibleRow = revealDirection === 'top-down'
    ? 0
    : GLYPH_HEIGHT - visibleRows;
  const lastVisibleRow = revealDirection === 'top-down'
    ? visibleRows
    : GLYPH_HEIGHT;

  context.imageSmoothingEnabled = false;
  context.fillStyle = '#12202d';
  context.fillRect(0, 0, dimensions.width, dimensions.height);
  context.fillStyle = '#f5b642';

  for (let letterIndex = 0; letterIndex < word.length; letterIndex += 1) {
    const letter = word[letterIndex];
    const glyphSet = letter === letter.toUpperCase() ? uppercaseGlyphs : lowercaseGlyphs;
    const glyph = glyphSet[letter.toLowerCase()];
    const xOffset = letterIndex * (GLYPH_WIDTH + 1) * pixelSize;

    for (let row = 0; row < GLYPH_HEIGHT; row += 1) {
      const rowIsVisible = revealDirection === 'ends-to-center'
        ? row < visibleRows || row >= GLYPH_HEIGHT - visibleRows
        : row >= firstVisibleRow && row < lastVisibleRow;

      if (!rowIsVisible) continue;

      for (let column = 0; column < GLYPH_WIDTH; column += 1) {
        if (glyph[row][column] === '#') {
          context.fillRect(
            xOffset + column * pixelSize,
            row * pixelSize,
            pixelSize,
            pixelSize,
          );
        }
      }
    }
  }

  return dimensions;
}

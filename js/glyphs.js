export const GLYPH_WIDTH = 5;
export const GLYPH_HEIGHT = 7;
export const PIXEL_SIZE = 12;

const glyphs = {
  a: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  b: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  c: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  d: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  e: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  f: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  g: ['.####', '#....', '#....', '#.###', '#...#', '#...#', '.###.'],
  h: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  i: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  j: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  k: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  l: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  m: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  n: ['#...#', '##..#', '##..#', '#.#.#', '#..##', '#..##', '#...#'],
  o: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  p: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  r: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  s: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  t: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  u: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  v: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  w: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  x: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
};

export function wordDimensions(word, pixelSize = PIXEL_SIZE) {
  const logicalWidth = word.length * (GLYPH_WIDTH + 1) - 1;
  return {
    width: logicalWidth * pixelSize,
    height: GLYPH_HEIGHT * pixelSize,
  };
}

export function drawPixelWord(context, word, revealedRows, pixelSize = PIXEL_SIZE) {
  const dimensions = wordDimensions(word, pixelSize);
  const firstVisibleRow = GLYPH_HEIGHT - revealedRows;

  context.imageSmoothingEnabled = false;
  context.fillStyle = '#12202d';
  context.fillRect(0, 0, dimensions.width, dimensions.height);
  context.fillStyle = '#f5b642';

  for (let letterIndex = 0; letterIndex < word.length; letterIndex += 1) {
    const glyph = glyphs[word[letterIndex]];
    const xOffset = letterIndex * (GLYPH_WIDTH + 1) * pixelSize;

    for (let row = Math.max(0, firstVisibleRow); row < GLYPH_HEIGHT; row += 1) {
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

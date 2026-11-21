// Keeps the rules short and in the rule format (docs/rule-format.md). Every budgeted file stays within its word
// budget from test/word-budgets.json, and every rule file — references/core/*.md and references/stack/<tech>/*.md
// but the READMEs — has each section of the template, with a **Rule.** of at most two sentences.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const references = 'skills/simple-architecture/references';
const budgets = JSON.parse(readFileSync(join(pluginRoot, 'test', 'word-budgets.json'), 'utf8'));

// The template's sections, in order.
const sections = ['Rule', 'Why', 'How to check', 'Good', 'Bad', 'Stack notes'];

// Words as `LC_ALL=C wc -w` counts them: runs of non-whitespace with at least one printable ASCII character, so a
// dash or an arrow standing alone (—, →) is not a word.
function countWords(text) {
  return text.split(/[ \t\n\v\f\r]+/).filter((word) => /[\x21-\x7e]/.test(word)).length;
}

// The lines of a Markdown text outside fenced code blocks.
function proseLines(text) {
  const lines = [];
  let fence = null;
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const open = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      if (open && open[1][0] === fence[0] && open[1].length >= fence.length && line.trim() === open[1]) fence = null;
    } else if (open) {
      fence = open[1];
    } else {
      lines.push(line);
    }
  }
  return lines;
}

// The template sections a rule text has, in the order it has them; a section starts a line with **<Name>.**
function findSections(text) {
  const found = [];
  for (const line of proseLines(text)) {
    const label = line.match(/^\*\*([A-Za-z ]+)\.\*\*/);
    if (label && sections.includes(label[1])) found.push(label[1]);
  }
  return found;
}

// What the rule text lacks of the template: the heading and the sections, each once and in order.
function formatProblems(text) {
  const problems = [];
  if (!/^## \S/.test(text)) problems.push('does not start with a "## <Rule name>" heading');
  const found = findSections(text);
  for (const name of sections) {
    const count = found.filter((f) => f === name).length;
    if (count === 0) problems.push(`lacks the **${name}.** section`);
    if (count > 1) problems.push(`has the **${name}.** section ${count} times`);
  }
  const order = found.filter((f, i) => found.indexOf(f) === i);
  if (problems.length === 0 && order.join() !== sections.join()) {
    problems.push(`has the sections out of order: ${order.join(', ')}`);
  }
  return problems;
}

// The text of the **Rule.** paragraph, without its label; null when there is none.
function ruleBlock(text) {
  const lines = proseLines(text);
  const start = lines.findIndex((line) => line.startsWith('**Rule.**'));
  if (start === -1) return null;
  const block = [lines[start].slice('**Rule.**'.length)];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === '' || /^\*\*[A-Za-z ]+\.\*\*/.test(line)) break;
    block.push(line);
  }
  return block.join(' ').trim();
}

// Sentences in a prose text: ends are ., ! or ? before whitespace or the end, outside code spans; "e.g.", "i.e."
// and "vs." are not ends.
function countSentences(text) {
  const prose = text
    .replace(/`[^`]*`/g, 'code')
    .replace(/\b(e\.g|i\.e|vs)\./gi, '$1');
  const ends = prose.match(/[.!?]+(?=\s|$)/g) ?? [];
  return ends.length;
}

// Files on disk that must have a budget: the skill, its references, the READMEs, the agents.
function filesOnDisk() {
  const md = (dir) =>
    existsSync(join(pluginRoot, dir))
      ? readdirSync(join(pluginRoot, dir)).filter((f) => f.endsWith('.md')).map((f) => `${dir}/${f}`)
      : [];
  const stacks = readdirSync(join(pluginRoot, references, 'stack'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => md(`${references}/stack/${d.name}`));
  return [
    'README.md',
    ...md('agents'),
    'skills/simple-architecture/SKILL.md',
    ...md(references),
    ...md(`${references}/core`),
    ...stacks,
  ];
}

const ruleFiles = filesOnDisk().filter(
  (f) => /\/references\/(core|stack\/[^/]+)\/[^/]+\.md$/.test(f) && !f.endsWith('/README.md'),
);

const read = (file) => readFileSync(join(pluginRoot, file), 'utf8');

// --- The checks themselves, on small texts ---

test('countWords counts as LC_ALL=C wc -w does', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('  one two\n\tthree  `four.md` — five → six\r\n'), 6);
  assert.equal(countWords('levels→placement —here'), 2);
});

test('countSentences counts sentence ends outside code spans', () => {
  assert.equal(countSentences('Put it here. Move it when its users change.'), 2);
  assert.equal(countSentences('Keep `levels.md` and `a. b` apart, e.g. in `lib/`, i.e. the pure zone.'), 1);
  assert.equal(countSentences('A limit of 1.5 lines ([Tasks](tasks.md)). Really? Yes!'), 3);
  assert.equal(countSentences('No end mark'), 0);
});

const rule = (ruleText) => `## Orders

**Rule.** ${ruleText}

**Why.** Because.

**How to check.**

- look.

**Good.**

\`\`\`
**Bad.** inside a code block does not count
\`\`\`

**Bad.**

\`\`\`
bad
\`\`\`

**Stack notes.** None.
`;

test('ruleBlock takes the Rule paragraph up to the blank line', () => {
  assert.equal(ruleBlock(rule('One line.\nAnd a second line.')), 'One line. And a second line.');
  assert.equal(ruleBlock('## Orders\n\n**Why.** No rule.'), null);
});

test('a Rule of three sentences is too long', () => {
  assert.equal(countSentences(ruleBlock(rule('Do this. Do that.'))), 2);
  assert.equal(countSentences(ruleBlock(rule('Do this. Do that. And this.'))), 3);
});

test('formatProblems finds a missing, repeated or misplaced section', () => {
  assert.deepEqual(formatProblems(rule('Do this.')), []);
  assert.deepEqual(formatProblems(rule('Do this.').replace('**Why.** Because.', '')), ['lacks the **Why.** section']);
  assert.deepEqual(formatProblems(rule('Do this.').replace('## Orders', '# Orders')), [
    'does not start with a "## <Rule name>" heading',
  ]);
  assert.deepEqual(formatProblems(rule('Do this.') + '\n**Why.** Again.\n'), ['has the **Why.** section 2 times']);
  const swapped = rule('Do this.').replace('**Why.** Because.', 'x').replace('**Stack notes.** None.', '**Why.** B.\n\n**Stack notes.** None.');
  assert.deepEqual(formatProblems(swapped), ['has the sections out of order: Rule, How to check, Good, Bad, Why, Stack notes']);
});

// --- The plugin's files ---

test('every budgeted file exists, and every file on disk has a budget', () => {
  const onDisk = filesOnDisk();
  const missing = Object.keys(budgets).filter((f) => !existsSync(join(pluginRoot, f)));
  assert.deepEqual(missing, [], 'budgets for files that do not exist: remove them from test/word-budgets.json');
  const unbudgeted = onDisk.filter((f) => !(f in budgets));
  assert.deepEqual(unbudgeted, [], 'files with no word budget: add each to test/word-budgets.json');
});

for (const [file, budget] of Object.entries(budgets)) {
  test(`${file} is within its word budget of ${budget}`, () => {
    if (!existsSync(join(pluginRoot, file))) return; // reported by the test above
    const words = countWords(read(file));
    assert.ok(
      words <= budget,
      `${file} has ${words} words, over its budget of ${budget}: shorten it (docs/rule-format.md, "Keeping rules short")`,
    );
  });
}

for (const file of ruleFiles) {
  test(`${file} follows the rule format`, () => {
    const text = read(file);
    assert.deepEqual(formatProblems(text), [], `${file} breaks the template of docs/rule-format.md`);
    const sentences = countSentences(ruleBlock(text));
    assert.ok(sentences >= 1 && sentences <= 2, `${file}: its **Rule.** has ${sentences} sentences, not one or two`);
  });
}

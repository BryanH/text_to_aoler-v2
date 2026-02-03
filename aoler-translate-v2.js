// aol-speak-v2.js
// Evolved AOL-speak translator with per-acronym grace + cooldown state machine
// Designed to run alongside legacy translateAolSpeak()

export function translateAolSpeak2(
  input,
  {
    rng = Math.random,
    intensity = 0.6,
    maxLength = 10_000,
    numSentencesAllowed = 1,
    cooldownDepth = 1,
    debug = false
  } = {}
) {
  if (typeof input !== "string") return "";
  if (input.length > maxLength) {
    throw new Error("Input too long");
  }

  const store = createAcronymState({
    numSentencesAllowed,
    cooldownDepth,
    debug
  });

  return input
    .split(/(\s+)/)
    .map(token =>
      isWord(token)
        ? evolveWord(token, rng, intensity)
        : appendAcronymBurst(token, rng, intensity, store)
    )
    .join("");
}

/* =========================
 * Acronym State Management
 * ========================= */

function createAcronymState({ numSentencesAllowed, cooldownDepth, debug }) {
  if (debug) {
    invariant(numSentencesAllowed >= 1, "numSentencesAllowed must be >= 1");
    invariant(
      cooldownDepth >= 1 || cooldownDepth === Infinity,
      "cooldownDepth must be >= 1 or Infinity"
    );
  }

  return {
    config: { numSentencesAllowed, cooldownDepth, debug },
    state: new Map()
  };
}

function getRecord(store, tag) {
  let record = store.state.get(tag);
  if (!record) {
    record = { graceUsed: 0, cooldownSentencesRemaining: 0 };
    store.state.set(tag, record);
  }

  if (store.config.debug) {
    invariant(record.graceUsed >= 0, `${tag}: graceUsed < 0`);
    invariant(
      record.cooldownSentencesRemaining >= 0 ||
        record.cooldownSentencesRemaining === Infinity,
      `${tag}: invalid cooldown`
    );
  }

  return record;
}

function tickSentenceCooldowns(store) {
  for (const record of store.state.values()) {
    if (record.cooldownSentencesRemaining > 0) {
      if (record.cooldownSentencesRemaining !== Infinity) {
        record.cooldownSentencesRemaining -= 1;
        if (record.cooldownSentencesRemaining === 0) {
          record.graceUsed = 0;
        }
      }
    }
  }
}

/* =========================
 * Acronym Burst Logic
 * ========================= */

const SENTENCE_TAGS = ["OMG", "WTF", "LOL"];
const MAX_PER_SENTENCE = 2;

function appendAcronymBurst(text, rng, intensity, store) {
  if (!/[.!?]$/.test(text)) return text;

  const sentenceCounts = new Map();
  const selected = [];
  const shuffled = shuffle([...SENTENCE_TAGS], rng);

  for (const tag of shuffled) {
    const record = getRecord(store, tag);
    const used = sentenceCounts.get(tag) || 0;

    const clamped = record.cooldownSentencesRemaining > 0;
    const maxAllowed = clamped ? 1 : MAX_PER_SENTENCE;

    if (used >= maxAllowed) continue;

    if (chance(rng, 0.5 * intensity)) {
      selected.push(tag);
      sentenceCounts.set(tag, used + 1);
    }
  }

  // Apply grace and activate cooldown if needed
  for (const [tag, count] of sentenceCounts.entries()) {
    const record = getRecord(store, tag);

    if (count >= 2 && record.cooldownSentencesRemaining === 0) {
      record.graceUsed += 1;

      if (record.graceUsed >= store.config.numSentencesAllowed) {
        record.cooldownSentencesRemaining = store.config.cooldownDepth;
      }
    }
  }

  // Sentence clock tick (always)
  tickSentenceCooldowns(store);

  return selected.length ? text + " " + selected.join(" ") : text;
}

/* =========================
 * Word Evolution
 * ========================= */

function evolveWord(word, rng, intensity) {
  return sprinklePunctuation(
    chaoticCapitalization(
      stretchCharacters(applyWordRules(word), rng, intensity),
      rng,
      intensity
    ),
    rng,
    intensity
  );
}

const WORD_RULES = [
  [/^the$/i, "da"],
  [/^this$/i, "dis"],
  [/^that$/i, "dat"],
  [/^cool$/i, "kewl"],
  [/^you$/i, "u"],
  [/^are$/i, "r"],
  [/^please$/i, "plz"]
];

function applyWordRules(word) {
  for (const [pattern, replacement] of WORD_RULES) {
    if (pattern.test(word)) return replacement;
  }
  return word;
}

function stretchCharacters(word, rng, intensity) {
  const out = [];
  for (const ch of word) {
    out.push(ch);
    if (isVowel(ch) && chance(rng, 0.25 * intensity)) {
      out.push(ch.repeat(1 + Math.floor(rng() * 2)));
    }
  }
  return out.join("");
}

function chaoticCapitalization(word, rng, intensity) {
  if (!chance(rng, 0.3 * intensity)) return word;
  return [...word]
    .map(c => (chance(rng, 0.5) ? c.toUpperCase() : c.toLowerCase()))
    .join("");
}

const EXCLAMATIONS = ["!", "!!", "!!!", "?!", "!!!11"];

function sprinklePunctuation(word, rng, intensity) {
  if (!chance(rng, 0.4 * intensity)) return word;
  return word + EXCLAMATIONS[Math.floor(rng() * EXCLAMATIONS.length)];
}

/* =========================
 * Utilities
 * ========================= */

function shuffle(array, rng) {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function chance(rng, probability) {
  return rng() < probability;
}

function isVowel(c) {
  return /[aeiou]/i.test(c);
}

function isWord(token) {
  return /\w/.test(token);
}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`Invariant failed: ${message}`);
  }
}

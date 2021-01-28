import { createIndex, addDocumentToIndex } from "ndx";
import { query } from "ndx-query";
import { words } from "lodash-es";
import latinize from "latinize";

const termFilter = (term: string) => latinize(term.toLowerCase());

// we do a separate indexer for SEARCHING - it limits the functionality but works more in line with old search
// we consider everything you search as simple words - no special chars included
const searchWordSeparator = (val: string) => words(val, /[^, ]+/g);

// we first split the words without special chars and then acknowledge words with special chars, eg: JPY/USD as a whole word
// so for `JPY/USD` we get [`JPY`, `USD`, `JPY/USD`]
const wordSeparator = (val: string) => [
  ...words(val, /[^-[\]{}()*+?.,\\/^$|#\s]+/g),
  ...searchWordSeparator(val),
];

function createDocumentIndex<T extends { [key: string]: any }, K>(
  fields: Array<{
    key: keyof T;
    boost: number;
  }>
) {
  const index = createIndex<K>(fields.length);
  const fieldAccessors = fields.map((field) => (item: T) => item[field.key]);
  const fieldBoosters = fields.map((field) => field.boost);

  return {
    add: (doc: T, key?: K) => {
      addDocumentToIndex(
        index,
        fieldAccessors,
        wordSeparator,
        termFilter,
        key ? key : doc,
        doc // DOCUMENT
      );
    },
    search: (q: string) =>
      query(
        index,
        fieldBoosters,
        1.25,
        0.75,
        searchWordSeparator,
        termFilter,
        undefined,
        q
      ),
  };
}

export default createDocumentIndex;

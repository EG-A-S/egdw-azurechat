import { Config } from "@markdoc/markdoc";
import { blockquote } from "./blockquote";
import { citation } from "./citation";
import { fence } from "./code-block";
import { heading } from "./heading";
import { paragraph } from "./paragraph";
import { thematicBreak } from "./thematic-break";

export const citationConfig: Config = {
  nodes: {
    paragraph,
    fence,
    heading,
    hr: thematicBreak,
    blockquote,
  },
  tags: {
    citation,
  },
};

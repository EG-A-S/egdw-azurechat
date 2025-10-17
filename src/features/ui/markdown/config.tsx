import { Config } from "@markdoc/markdoc";
import { Blockquote, blockquote } from "./blockquote";
import { Citation, citation } from "./citation";
import { CodeBlock, fence } from "./code-block";
import { Heading, heading } from "./heading";
import { Paragraph, paragraph } from "./paragraph";
import { ThematicBreak, thematicBreak } from "./thematic-break";

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

export const markdownComponents = {
  Citation,
  Paragraph,
  CodeBlock,
  Heading,
  ThematicBreak,
  Blockquote,
};

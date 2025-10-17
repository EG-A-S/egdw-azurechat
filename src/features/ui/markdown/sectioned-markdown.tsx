import Markdoc from "@markdoc/markdoc";
import React, { FC } from "react";
import { Blockquote } from "./blockquote";
import { Citation } from "./citation";
import { CodeBlock } from "./code-block";
import { citationConfig } from "./config";
import { Heading } from "./heading";
import { MarkdownProvider } from "./markdown-context";
import { Paragraph } from "./paragraph";
import { parseIntoSections } from "./section-parser";
import { SectionWrapper } from "./section-wrapper";
import { ThematicBreak } from "./thematic-break";

interface Props {
  content: string;
  onCitationClick: (
    previousState: any,
    formData: FormData
  ) => Promise<JSX.Element>;
}

export const SectionedMarkdown: FC<Props> = (props) => {
  const sections = parseIntoSections(props.content);

  if (sections.length <= 1) {
    const ast = Markdoc.parse(props.content);
    const content = Markdoc.transform(ast, {
      ...citationConfig,
    });

    return (
      <MarkdownProvider onCitationClick={props.onCitationClick}>
        {Markdoc.renderers.react(content, React, {
          components: { Citation, Paragraph, CodeBlock, Heading, ThematicBreak, Blockquote },
        })}
      </MarkdownProvider>
    );
  }

  return (
    <MarkdownProvider onCitationClick={props.onCitationClick}>
      {sections.map((section, index) => {
        const ast = Markdoc.parse(section.content);
        const content = Markdoc.transform(ast, {
          ...citationConfig,
        });

        return (
          <SectionWrapper
            key={index}
            sectionContent={section.rawContent}
          >
            {Markdoc.renderers.react(content, React, {
              components: { Citation, Paragraph, CodeBlock, Heading, ThematicBreak, Blockquote },
            })}
          </SectionWrapper>
        );
      })}
    </MarkdownProvider>
  );
};
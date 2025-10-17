import Markdoc from "@markdoc/markdoc";
import React, { FC } from "react";
import { citationConfig, markdownComponents } from "./config";
import { MarkdownProvider } from "./markdown-context";
import { parseIntoSections } from "./section-parser";
import { SectionWrapper } from "./section-wrapper";

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
          components: markdownComponents,
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
              components: markdownComponents,
            })}
          </SectionWrapper>
        );
      })}
    </MarkdownProvider>
  );
};
export interface Section {
  content: string;
  rawContent: string;
}

export function parseIntoSections(markdownContent: string): Section[] {
  const sections: Section[] = [];
  
  const parts = markdownContent.split(/^---+\s*$/gm);
  
  if (parts.length === 1) {
    const headingSections = splitByHeadings(markdownContent);
    if (headingSections.length > 1) {
      return headingSections;
    }
    
    if (shouldTreatAsSingleSection(markdownContent)) {
      return [{
        content: markdownContent.trim(),
        rawContent: markdownContent.trim()
      }];
    }
    
    return splitByParagraphs(markdownContent);
  }
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part.length > 0) {
      sections.push({
        content: part,
        rawContent: part
      });
    }
  }
  
  return sections;
}

function splitByHeadings(content: string): Section[] {
  const sections: Section[] = [];
  
  const parts = content.split(/^(#{1,6}\s+.*)$/gm);
  
  let currentSection = "";
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part && part.trim().length > 0) {
      if (part.match(/^#{1,6}\s+/)) {
        if (currentSection.trim()) {
          sections.push({
            content: currentSection.trim(),
            rawContent: currentSection.trim()
          });
        }
        currentSection = part;
      } else {
        currentSection += (currentSection ? "\n\n" : "") + part;
      }
    }
  }
  
  if (currentSection.trim()) {
    sections.push({
      content: currentSection.trim(),
      rawContent: currentSection.trim()
    });
  }
  
  if (sections.length === 0) {
    sections.push({
      content: content.trim(),
      rawContent: content.trim()
    });
  }
  
  return sections;
}

function shouldTreatAsSingleSection(content: string): boolean {
  const lines = content.trim().split('\n').filter(line => line.trim().length > 0);
  
  // Very short content (3 lines or fewer) should stay as one section
  if (lines.length <= 3) {
    return true;
  }
  
  const hasBlockquotes = content.includes('> ');
  const hasCodeBlocks = content.includes('```');
  // Short responses (under 300 chars) are easier to read as a single block
  const isShortResponse = content.length < 300;
  
  // Content with special formatting should remain intact as single sections
  if (hasBlockquotes || hasCodeBlocks || isShortResponse) {
    return true;
  }
  
  return false;
}

function splitByParagraphs(content: string): Section[] {
  const sections: Section[] = [];
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Content with 2 or fewer paragraphs is too short to benefit from splitting
  if (paragraphs.length <= 2) {
    return [{
      content: content.trim(),
      rawContent: content.trim()
    }];
  }
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim()) {
      sections.push({
        content: paragraph.trim(),
        rawContent: paragraph.trim()
      });
    }
  }
  
  return sections;
}
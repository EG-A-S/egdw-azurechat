"use client";
import { cn } from "@/ui/lib";
import { CopyButton } from "../copy-button";

interface SectionWrapperProps {
  children: React.ReactNode;
  sectionContent: string;
  className?: string;
}

export const SectionWrapper = ({ children, sectionContent, className }: SectionWrapperProps) => {
  return (
    <div className={cn("relative group border-l-2 border-transparent hover:border-l-muted-foreground/30 pl-4 my-4", className)}>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <CopyButton
          content={sectionContent}
          title="Copy section"
          className="h-8 w-8 p-1"
          iconSize={14}
        />
      </div>
      {children}
    </div>
  );
};
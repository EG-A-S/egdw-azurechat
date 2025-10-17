import { cn } from "@/ui/lib";

interface HeadingProps {
  level: number;
  children: React.ReactNode;
  className?: string;
}

export const Heading = ({ level, children, className }: HeadingProps) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const headingStyles = {
    1: "text-2xl font-bold mt-6 mb-4",
    2: "text-xl font-semibold mt-5 mb-3",
    3: "text-lg font-semibold mt-4 mb-2",
    4: "text-base font-semibold mt-3 mb-2",
    5: "text-sm font-semibold mt-2 mb-1",
    6: "text-xs font-semibold mt-2 mb-1",
  };

  return (
    <HeadingTag className={cn(headingStyles[level as keyof typeof headingStyles] || headingStyles[1], className)}>
      {children}
    </HeadingTag>
  );
};

export const heading = {
  render: "Heading",
  attributes: {
    level: { type: Number, required: true },
  },
};
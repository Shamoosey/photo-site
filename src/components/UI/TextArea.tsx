interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resizeable?: boolean;
}

export function Textarea({ className = "", resizeable = false, ...props }: TextareaProps) {
  const baseClassName = "border-[1.5px] rounded-sm border-neutral-600 p-[4px] bg-neutral-50";
  const resizeDisableClass = !resizeable ? "resize-none" : "";
  const combinedClassName = [baseClassName, resizeDisableClass, className].filter(Boolean).join(" ");

  return <textarea className={combinedClassName} {...props} />;
}

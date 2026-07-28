interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ type = "text", className = "", ...props }: InputProps) {
  const baseClassName = "border-[1.5px] rounded-sm border-neutral-600 p-[4px] bg-neutral-50";
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;

  return <input className={combinedClassName} type={type} {...props} />;
}

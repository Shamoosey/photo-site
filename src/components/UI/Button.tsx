interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
  variant?: "default" | "icon";
}

export function Button({ children, disabled = false, className = "", variant = "default", ...props }: ButtonProps) {
  const variantClasses = {
    default: "px-2 py-1 hover:underline cursor-pointer font-bold",
    icon: "p-1 hover:opacity-70 cursor-pointer rounded transition-opacity",
  };

  const baseClassName = variantClasses[variant];
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const combinedClassName = [baseClassName, disabledClasses, className].filter(Boolean).join(" ");

  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

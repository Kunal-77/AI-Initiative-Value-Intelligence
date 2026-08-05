import React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", required = false, children, ...props }, ref) => {
    const hasFontWeight = className.includes("font-");
    const combinedClassName = `text-xs text-muted-foreground ${hasFontWeight ? "" : "font-medium"} ${className}`.trim();

    return (
      <label ref={ref} className={combinedClassName} {...props}>
        {children}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

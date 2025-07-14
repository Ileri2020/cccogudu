import React, { ChangeEvent } from "react";

interface InputProps {
  className?: string;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

const Input: React.FC<InputProps> = ({
  className,
  disabled,
  onChange,
  type,
  ...rest
}) => {
  return (
    <input
      type={type || "text"}
      onChange={onChange}
      className={`w-full p-1 mb-2 
        ${disabled ? "" : "border rounded"} 
        ${className || ""}`}
      {...rest}
    />
  );
};

export default Input;

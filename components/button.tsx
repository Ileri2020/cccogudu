export const Button: React.FC<{
  border?: string;
  children?: React.ReactNode;
  className?: string;
  defaultStyles?: boolean;
  disabled?: boolean;
  onClick: () => void;
  styles?: React.CSSProperties;
  value?: string;
}> = ({
  border,
  children,
  className,
  defaultStyles,
  disabled,
  styles,
  value,
  ...rest
}) => {
  return (
    <button
      className={`rounded px-4 py-1 my-1
        ${className ? className : ""} 
        ${disabled ? "hover:cursor-not-allowed" : "hover:cursor-pointer"}
        ${border ? "border border-1 border-gray-500" : ""} 
        ${defaultStyles ? "" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
      style={styles}
      {...rest}
    >
      <div className="flex w-full gap-2 justify-center">
        {children}
        {value}
      </div>
    </button>
  );
};

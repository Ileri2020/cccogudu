import React, { ChangeEvent } from "react";

interface CheckBoxProps {
  label: string;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
}

const Checkbox: React.FC<CheckBoxProps> = ({ label, onChange, ...rest }) => {
  return (
    <div className="flex items-center m-1">
      <input type="checkbox" className="m-1" onChange={onChange} {...rest} />
      <label className="my-1">{label}</label>
    </div>
  );
};

export default Checkbox;

import { Checkbox, FormControlLabel } from "@mui/material";

interface FormControlLabelType {
  key?: React.Key | null | undefined;
  label: React.ReactNode;
}
interface CheckboxType {
  checked: boolean | undefined;
  indeterminate?: boolean | undefined;
  onChange:
    | ((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void)
    | undefined;
}
type CheckBoxType = FormControlLabelType & CheckboxType;

export default function CheckBox({
  key,
  label,
  checked,
  onChange,
}: CheckBoxType): JSX.Element {
  return (
    <FormControlLabel
      key={key}
      label={label}
      control={
        <Checkbox checked={checked} indeterminate={false} onChange={onChange} />
      }
    />
  );
}

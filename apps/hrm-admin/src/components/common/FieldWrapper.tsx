import React from "react";

interface Props {
  children: React.ReactElement;
  label: string;
  source?: string;
  sortable?: boolean;
}

const FieldWrapper: React.FC<Props> = ({
  children,
  label,
  source,
  sortable,
}: Props) => children;

export default FieldWrapper;

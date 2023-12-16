import { RaRecord } from "ra-core";

export interface Customer extends RaRecord {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  zipcode: string;
  avatar: string;
  birthday: string;
  first_seen: string;
  last_seen: string;
  has_ordered: boolean;
  latest_purchase: string;
  has_newsletter: boolean;
  groups: string[];
  nb_commands: number;
  total_spent: number;
}

export interface FieldProps<T extends RaRecord = RaRecord> {
  addLabel?: boolean;
  label?: string;
  record?: T;
  source?: string;
  resource?: string;
  basePath?: string;
  formClassName?: string;
}

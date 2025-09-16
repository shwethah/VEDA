import { components } from "react-select";
import type { OptionProps, SingleValueProps } from "react-select";
import { colormapGradients } from "../constants/ColormapGradients";

interface OptionType {
  value: string;
  label: string;
}

// Small reusable component for gradient + label
const ColormapPreview = ({ value, label }: { value: string; label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div
      style={{
        width: "100px",
        height: "14px",
        borderRadius: "4px",
        backgroundImage: colormapGradients[value] || "#ccc",
      }}
    />
    <span>{label}</span>
  </div>
);

export const ColormapOption = (props: OptionProps<OptionType, false>) => (
  <components.Option {...props}>
    <ColormapPreview value={props.data.value} label={props.data.label} />
  </components.Option>
);

export const ColormapSingleValue = (props: SingleValueProps<OptionType, false>) => (
  <components.SingleValue {...props}>
    <ColormapPreview value={props.data.value} label={props.data.label} />
  </components.SingleValue>
);

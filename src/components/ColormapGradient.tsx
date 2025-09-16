import { components } from "react-select";
import type { OptionProps, SingleValueProps } from "react-select";
import { colormapGradients } from "../constants/ColormapGradients";

interface OptionType {
  value: string;
  label: string;
}

export const ColormapOption = (props: OptionProps<OptionType, false>) => (
  <components.Option {...props}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "100px",
          height: "14px",
          borderRadius: "4px",
          backgroundImage: colormapGradients[props.data.value] || "#ccc"
        }}
      />
      <span>{props.data.label}</span>
    </div>
  </components.Option>
);

export const ColormapSingleValue = (props: SingleValueProps<OptionType, false>) => (
  <components.SingleValue {...props}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "100px",
          height: "14px",
          borderRadius: "4px",
          backgroundImage: colormapGradients[props.data.value] || "#ccc"
        }}
      />
      <span>{props.data.label}</span>
    </div>
  </components.SingleValue>
);

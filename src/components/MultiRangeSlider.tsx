import { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";
import { colormapStops } from "../constants/ColormapGradients";
import "../styles/MultiRangeSlider.css";

type MultiRangeSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  step?: number;
  colormap?: string;
  onChange?: (val: [number, number]) => void;
};

export default function MultiRangeSlider({
  min,
  max,
  value,
  step = 1,
  colormap,
  onChange,
}: MultiRangeSliderProps) {
  const [range, setRange] = useState<[number, number]>(value);
  const [minInput, setMinInput] = useState(String(value[0]));
  const [maxInput, setMaxInput] = useState(String(value[1]));

    useEffect(() => {
    setRange(value);
    setMinInput(String(value[0]));
    setMaxInput(String(value[1]));
    }, [value]);

  const update = (val: [number, number]) => {
    // Clamp values so they stay inside dataset min/max
    const clamped: [number, number] = [
      Math.max(min, Math.min(val[0], max)),
      Math.max(min, Math.min(val[1], max)),
    ];
    const newValues: [number, number] = [
      Math.min(clamped[0], clamped[1]),
      Math.max(clamped[0], clamped[1]),
    ];
    setRange(newValues);
    setMinInput(String(newValues[0]));
    setMaxInput(String(newValues[1]));
    onChange?.(newValues);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Inputs */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        {/* MIN */}
        <input
          type="number"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
          onBlur={() => update([Number(minInput), range[1]])}
          className="slider-input"
        />
        {/* MAX */}
        <input
          type="number"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
          onBlur={() => update([range[0], Number(maxInput)])}
          className="slider-input"
        />
      </div>

      {/* Slider */}
      <Range
        step={step}
        min={min}
        max={max}
        values={range}
        onChange={(vals) => update([vals[0], vals[1]])}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "6px",
              width: "100%",
              borderRadius: "4px",
              background: getTrackBackground({
                values: range,
                colors: colormap && colormapStops[colormap]
                  ? colormapStops[colormap]
                  : ["#ccc", "#3b82f6", "#ccc"],
                min,
                max,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => {
          const { key, ...rest } = props;
          return (
            <div
              key={key}
              {...rest}
              style={{
                ...rest.style,
                height: "16px",
                width: "16px",
                borderRadius: "50%",
                backgroundColor: "#111827",
              }}
            />
          );
        }}
      />
    </div>
  );
}

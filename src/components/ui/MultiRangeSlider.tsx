import { useState, useEffect } from "react";
import { Range } from "react-range";

type MultiRangeSliderProps = {
  value: [number, number];
  step?: number;
  onChange?: (val: [number, number]) => void;
};

export default function MultiRangeSlider({
  value,
  step = 1,
  onChange,
}: MultiRangeSliderProps) {
  const [range, setRange] = useState<[number, number]>(value);
  const [minInput, setMinInput] = useState<string>(String(value[0]));
  const [maxInput, setMaxInput] = useState<string>(String(value[1]));

  useEffect(() => {
    setRange(value);
    setMinInput(String(value[0]));
    setMaxInput(String(value[1]));
  }, [value]);

  const update = (val: [number, number]) => {
    setRange(val);
    setMinInput(String(val[0]));
    setMaxInput(String(val[1]));
    onChange?.(val);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Min/Max inputs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontSize: "12px",
          color: "#444",
        }}
      >
        {/* MIN input */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <label style={{ fontSize: "11px", marginBottom: "2px" }}>MIN</label>
          <input
            type="number"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={() => {
              const val = Number(minInput);
              update([val, range[1]]);
            }}
            style={{
              width: "50px",
              fontSize: "12px",
              padding: "2px 4px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* MAX input */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <label style={{ fontSize: "11px", marginBottom: "2px" }}>MAX</label>
          <input
            type="number"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={() => {
              const val = Number(maxInput);
              update([range[0], val]);
            }}
            style={{
              width: "50px",
              fontSize: "12px",
              padding: "2px 4px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      {/* Slider with independent thumbs */}
      <Range
        step={step}
        min={Math.min(...range) - 50}
        max={Math.max(...range) + 50}
        values={range}
        onChange={(vals) => {
          // Only update the thumb that moved
          if (vals[0] !== range[0]) {
            update([vals[0], range[1]]); // left thumb moved
          } else if (vals[1] !== range[1]) {
            update([range[0], vals[1]]); // right thumb moved
          }
        }}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "6px",
              background: "#ddd",
              borderRadius: "4px",
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "16px",
              width: "16px",
              borderRadius: "50%",
              backgroundColor: "#111827",
            }}
          />
        )}
      />
    </div>
  );
}

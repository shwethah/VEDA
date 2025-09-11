import { useState, useEffect } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuCalendar,
  LuDatabase,
  LuPalette,
  LuArrowLeftRight,
  LuImage,
} from "react-icons/lu";
import DatePicker from "react-datepicker";
import Select from "react-select";
import type { StylesConfig, SingleValue } from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/sidebar.css";
import nasaLogo from "../assets/NASA.svg";

type SidebarProps = { collapsed?: boolean; onToggle?: () => void; logoSrc?: string };

// ---------- Types ----------
interface ApiResponse {
  id: string;
  // add more fields if needed
}

interface OptionType {
  value: string;
  label: string;
}

// ---------- Options ----------
const datasetOptions: OptionType[] = [
  { value: "hls-ndvi", label: "hls-ndvi" },
  { value: "n02-monthly ", label: "n02-monthly" },
];

const colormapOptions: OptionType[] = [
  { value: "viridis", label: "viridis" },
  { value: "magma", label: "magma" },
  { value: "rdylgn", label: "rdylgn" },
];

// ---------- Custom Styles for react-select ----------
const selectStyles: StylesConfig<OptionType, false> = {
  control: (base) => ({
    ...base,
    backgroundColor: "#fff",
    borderColor: "#d1d5db",
    boxShadow: "none",
    minHeight: "32px",
    height: "32px",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#000",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#fff",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#111827"
      : state.isFocused
      ? "#e5e7eb"
      : "#fff",
    color: state.isSelected ? "#fff" : "#000",
    cursor: "pointer",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#111827",
    padding: "0 4px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 6px",
  }),
};

export default function Sidebar({ collapsed = false, onToggle, logoSrc }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const isCollapsed = onToggle ? collapsed : internalCollapsed;

  const [date, setDate] = useState<Date | null>(null);
  const [dataset, setDataset] = useState(datasetOptions[0].value);
  const [colormap, setColormap] = useState(colormapOptions[0].value);
  const [rescale, setRescale] = useState(0);
  const [showImagery, setShowImagery] = useState(true);

  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [tileUrl, setTileUrl] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalCollapsed((v) => !v);
  };

  const widthPx = isCollapsed ? 80 : 260;

  // API call when date or dataset changes
  useEffect(() => {
    if (!date || !dataset) return;

    const fetchData = async () => {
      try {
        const payload = {
          collections: [dataset],
          datetime: date.toISOString().split("T")[0] + "T00:00:00Z",
        };

        console.log("Sending payload:", payload);

        const response = await fetch(
          "https://openveda.cloud/api/raster/searches/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const data: ApiResponse = await response.json();
        console.log("API response:", data);
        setApiResult(data);
      } catch (err) {
        console.error("Error fetching API:", err);
      }
    };

    fetchData();
  }, [date, dataset]);

  // Build tile URL when apiResult.id changes
  useEffect(() => {
    if (apiResult?.id) {
      const url = `https://openveda.cloud/api/raster/searches/${apiResult.id}/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png?assets=cog_default&pixel_selection=first`;
      console.log("Tile URL:", url);
      setTileUrl(url);
      setShowPopup(true);
    }
  }, [apiResult?.id]);

  // ---------- Inline Styles ----------
  const asideStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 20,
    height: "100%",
    flex: "0 0 auto",
    flexBasis: `${widthPx}px`,
    minWidth: 72,
    transition: "flex-basis 240ms ease",
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    boxShadow: "2px 0 6px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "system-ui, sans-serif",
    cursor: isCollapsed ? "pointer" : "default",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isCollapsed ? "column" : "row",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
    gap: isCollapsed ? 6 : 10,
  };

  const logoTextStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    textAlign: "center",
    whiteSpace: "nowrap",
    opacity: 1,
  };

  const toggleButton: React.CSSProperties = {
    marginLeft: isCollapsed ? 0 : "auto",
    cursor: "pointer",
    background: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: 4,
    transition: "all 0.2s ease",
  };

  const inputGroup: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "12px 14px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
  };

  const footerStyle: React.CSSProperties = {
    marginTop: "auto",
    padding: "10px 14px",
    fontSize: 12,
    color: "#6b7280",
    borderTop: "1px solid #f3f4f6",
    background: "#fff",
    textAlign: "center",
  };

  const Icon = isCollapsed ? LuChevronRight : LuChevronLeft;

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
      style={asideStyle}
      onClick={() => {
        if (isCollapsed) handleToggle();
      }}
    >
      {/* Header */}
      <div style={headerStyle}>
        <img
          src={logoSrc ?? nasaLogo}
          alt="Logo"
          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
        />
        <div style={logoTextStyle}>VEDA</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          style={toggleButton}
        >
          <Icon size={16} style={{ color: "#111827", strokeWidth: 2 }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Date */}
        <div style={inputGroup} title="Select Date">
          <label style={labelStyle}>
            <LuCalendar size={18} /> {!isCollapsed && "Date"}
          </label>
          {!isCollapsed && (
            <DatePicker
              selected={date}
              onChange={(d: Date | null) => setDate(d)}
              className="sidebar-input"
              placeholderText="Select a date"
              dateFormat="yyyy-MM-dd"
            />
          )}
        </div>

        {/* Dataset */}
        <div style={inputGroup} title="Dataset">
          <label style={labelStyle}>
            <LuDatabase size={18} /> {!isCollapsed && "Dataset"}
          </label>
          {!isCollapsed && (
            <Select<OptionType, false>
              options={datasetOptions}
              value={datasetOptions.find((o) => o.value === dataset)}
              onChange={(opt: SingleValue<OptionType>) =>
                setDataset(opt?.value || datasetOptions[0].value)
              }
              styles={selectStyles}
            />
          )}
        </div>

        {/* Colormap */}
        <div style={inputGroup} title="Colormap">
          <label style={labelStyle}>
            <LuPalette size={18} /> {!isCollapsed && "Colormap"}
          </label>
          {!isCollapsed && (
            <Select<OptionType, false>
              options={colormapOptions}
              value={colormapOptions.find((o) => o.value === colormap)}
              onChange={(opt: SingleValue<OptionType>) =>
                setColormap(opt?.value || colormapOptions[0].value)
              }
              styles={selectStyles}
            />
          )}
        </div>

        {/* Rescale */}
        <div style={inputGroup} title="Rescale">
          <label style={labelStyle}>
            <LuArrowLeftRight size={18} /> {!isCollapsed && "Rescale"}
          </label>
          {!isCollapsed && (
            <div style={{ width: "100%" }}>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#2563eb",
                }}
              >
                {rescale.toFixed(1)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#374151" }}>-1</span>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.1}
                  value={rescale}
                  onChange={(e) => setRescale(Number(e.target.value))}
                  className="sidebar-slider"
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 12, color: "#374151" }}>+1</span>
              </div>
            </div>
          )}
        </div>

        {/* Imagery */}
        <div style={inputGroup} title="Toggle VEDA Imagery">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LuImage size={18} style={{ color: "#111827", strokeWidth: 2 }} />
            {!isCollapsed && (
              <>
                <span>VEDA Imagery</span>
                <input
                  type="checkbox"
                  checked={showImagery}
                  onChange={(e) => setShowImagery(e.target.checked)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={footerStyle}>{!isCollapsed ? "v0.0" : ""}</div>

      {/* Popup */}
      {showPopup && tileUrl && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <img
              src={tileUrl}
              alt="Raster Tile"
              style={{ maxWidth: "100%", maxHeight: "80vh" }}
            />
            <button
              style={{
                marginTop: 10,
                padding: "6px 12px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

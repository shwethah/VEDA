import { useState, useEffect, useRef } from "react";
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
import MultiRangeSlider from "./ui/MultiRangeSlider";
import { ColormapOption, ColormapSingleValue } from "./ColormapGradient";

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  logoSrc?: string;
  onSearchId?: (id: string) => void;
  onColormapChange?: (colormap: string) => void;
  onImageryToggle?: (visible: boolean) => void;
};

interface ApiLink {
  href: string;
  rel: string;
  title?: string;
  templated?: boolean;
}

interface ApiResponse {
  id: string;
  links?: ApiLink[];
}

interface OptionType {
  value: string;
  label: string;
}

const datasetOptions: OptionType[] = [
  { value: "", label: "Select dataset" },
  { value: "hls-ndvi", label: "hls-ndvi" },
  { value: "no2-monthly", label: "no2-monthly" },
  { value: "bangladesh-landcover-2001-2020", label: "bangladesh-landcover-2001-2020" },
  { value: "barc-thomasfire", label: "barc-thomasfire" },
];

const colormapOptions: OptionType[] = [
  { value: "", label: "Select colormap names" },
  { value: "viridis", label: "viridis" },
  { value: "magma", label: "magma" },
  { value: "rdylgn", label: "rdylgn" },
];

const selectStyles: StylesConfig<OptionType, false> = {
  control: (base) => ({
    ...base,
    backgroundColor: "#fff",
    borderColor: "#d1d5db",
    boxShadow: "none",
    minHeight: "32px",
    height: "32px",
    marginLeft: "3%",
    width: "200px",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#000",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis", 
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#fff",
    zIndex: 9999,
    minWidth: "200px", 
    width: "200px",        
    marginLeft: "3%",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
    ? "#e0f2fe"   // lighter blue background for selected option
    : state.isFocused
    ? "#f3f4f6"   // light gray background on hover/focus
    : "#fff",     // default white
    color: "#000",  // keep text always readable
    cursor: "pointer",
    whiteSpace: "nowrap",      // stay single line
    overflow: "hidden",
    textOverflow: "ellipsis",  // truncate with “...”
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#111827",
    padding: "0 4px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  valueContainer: (base) => ({ ...base, padding: "0 6px" }),
};


export default function Sidebar({
  collapsed = false,
  onToggle,
  logoSrc,
  onSearchId,
  onColormapChange,
  onImageryToggle,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const isCollapsed = onToggle ? collapsed : internalCollapsed;

  const [date, setDate] = useState<Date | null>(null);
  const [dataset, setDataset] = useState(datasetOptions[0].value);
  const [colormap, setColormap] = useState(colormapOptions[0].value);
  const [rescale, setRescale] = useState<[number, number]>([0, 1000]);
  const [showImagery, setShowImagery] = useState(true);

  const handleToggle = () => (onToggle ? onToggle() : setInternalCollapsed((v) => !v));

  const widthPx = isCollapsed ? 80 : 260;
  const dateKey = date ? date.toISOString().slice(0, 10) : "";
  const datasetKey = (dataset ?? "").trim();

  const latestSigRef = useRef<string>("");

  useEffect(() => {
    if (!dateKey || !datasetKey) return;

    const ac = new AbortController();
    const sig = `${dateKey}__${datasetKey}`;
    latestSigRef.current = sig;

    (async () => {
      try {
        const payload: Record<string, unknown> = {
          collections: [datasetKey],
          datetime: `${dateKey}T00:00:00Z`,
        };

        const response = await fetch("https://openveda.cloud/api/raster/searches/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ac.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: ApiResponse = await response.json();
        console.log("register response:", data);

        const tileJsonLink = data.links?.[1];
        if (tileJsonLink) {
          const href = tileJsonLink.href.replace("{tileMatrixSetId}", "WebMercatorQuad");
          const url = new URL(href);
          url.searchParams.set("assets", "cog_default");
          url.searchParams.set("pixel_selection", "first");

          try {
            const tileResp = await fetch(url.toString());
            if (!tileResp.ok) throw new Error(`TileJSON HTTP ${tileResp.status}`);
            const tileData = await tileResp.json();
            console.log("tilejson data:", tileData);

            if (tileData.tiles && Array.isArray(tileData.tiles)) {
              const tileTemplate = tileData.tiles[0];
              if (latestSigRef.current === sig) {
                onSearchId?.(tileTemplate);
              }
            }
          } catch (err) {
            console.error("TileJSON fetch error:", err);
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("register failed:", err);
      }
    })();

    return () => ac.abort();
  }, [dateKey, datasetKey, onSearchId]);

  const handleReset = () => {
    latestSigRef.current = "__reset__";
    setDate(null);
    setDataset(datasetOptions[0].value);
    setColormap(colormapOptions[0].value);
    setRescale([0, 1000]);
    setShowImagery(true);
    onColormapChange?.("");
    onImageryToggle?.(true);
  };

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: isCollapsed ? "8px" : "14px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
    gap: 8,
  };

  const brandRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const logoTextStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    whiteSpace: "nowrap",
  };

  const toggleButton: React.CSSProperties = {
    cursor: "pointer",
    background: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: 4,
    transition: "all 0.2s ease",
    flexShrink: 0,
  };

  const inputGroup: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: isCollapsed ? "center" : "flex-start",
    gap: 6,
    padding: isCollapsed ? "10px 0" : "12px 14px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
    background: "#fff",
  };

  const itemLabel: React.CSSProperties = {
    display: "flex",
    flexDirection: isCollapsed ? "column" : "row",
    alignItems: "center",
    justifyContent: isCollapsed ? "center" : "flex-start",
    gap: isCollapsed ? 2 : 8,
    fontSize: isCollapsed ? 11 : 13,
    fontWeight: 500,
    color: "#374151",
    textAlign: "center",
  };

  const footerStyle: React.CSSProperties = {
    marginTop: "auto",
    padding: "10px 14px",
    fontSize: 12,
    color: "#6b7280",
    borderTop: "1px solid #f3f4f6",
    background: "#fff",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
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
        <div style={brandRowStyle}>
          <img
            src={logoSrc ?? nasaLogo}
            alt="Logo"
            style={{
              width: isCollapsed ? 24 : 32,
              height: isCollapsed ? 24 : 32,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          {!isCollapsed && <div style={logoTextStyle}>VEDA</div>}
        </div>

        <button
          type="button"
          className="btn-chevron"
          style={toggleButton}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <Icon size={16} style={{ color: "#111827", strokeWidth: 2 }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Date */}
        <div style={inputGroup} title="Select Date">
          <div style={itemLabel}>
            <LuCalendar size={18} />
            <span>Date</span>
          </div>
          {!isCollapsed && (
            <DatePicker
              selected={date}
              onChange={(d: Date | null) => setDate(d)}
              className="sidebar-input"
              placeholderText="Select a date"
              dateFormat="yyyy-MM-dd"
              popperPlacement="right-start"
              popperClassName="datepicker-popper"
            />
          )}
        </div>

        {/* Dataset */}
        <div style={inputGroup} title="Dataset">
          <div style={itemLabel}>
            <LuDatabase size={18} />
            <span>Dataset</span>
          </div>
          {!isCollapsed && (
            <Select<OptionType, false>
              styles={selectStyles}
              options={datasetOptions}
              value={datasetOptions.find((o) => o.value === dataset)}
              onChange={(opt: SingleValue<OptionType>) =>
                setDataset(opt?.value || datasetOptions[0].value)
              }
            />
          )}
        </div>

        {/* Colormap */}
        <div style={inputGroup} title="Colormap">
          <div style={itemLabel}>
            <LuPalette size={18} />
            <span>Colormap</span>
          </div>
          {!isCollapsed && (
            <Select<OptionType, false>
              styles={selectStyles}
              options={colormapOptions}
              value={colormapOptions.find((o) => o.value === colormap)}
              onChange={(opt: SingleValue<OptionType>) => {
                const v = opt?.value || colormapOptions[0].value;
                setColormap(v);
                onColormapChange?.(v);
              }}
              components={{
                Option: ColormapOption,
                SingleValue: ColormapSingleValue
              }}
            />
          )}
        </div>

        {/* Rescale */}
        <div style={inputGroup} title="Rescale">
          <div style={itemLabel}>
            <LuArrowLeftRight size={18} />
            <span>Rescale</span>
          </div>
          {!isCollapsed && (
            <MultiRangeSlider
              value={rescale}
              step={0.1}
              onChange={(val) => setRescale(val)}
            />
          )}
        </div>

        {/* Imagery + Reset */}
        <div style={inputGroup} title="Toggle VEDA Imagery">
          <div style={itemLabel}>
            <LuImage size={18} />
            <span>Imagery</span>
          </div>

          {!isCollapsed && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <span>VEDA Imagery</span>
                <input
                  type="checkbox"
                  checked={showImagery}
                  onChange={(e) => {
                    const visible = e.target.checked;
                    setShowImagery(visible);
                    onImageryToggle?.(visible);
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                  marginTop: 6,
                }}
              >
                <button
                  type="button"
                  className="btn-reset"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    handleReset();
                    (e.currentTarget as HTMLButtonElement).blur();
                  }}
                  title="Reset all settings"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={footerStyle}>v0.0</div>
    </aside>
  );
}

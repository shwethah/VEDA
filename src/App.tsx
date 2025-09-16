import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import MapViewer from "./components/MapViewer";

export default function App() {
  const [tileTemplateBase, setTileTemplateBase] = useState<string | null>(null);
  const [colormap, setColormap] = useState("");
  const [imageryVisible, setImageryVisible] = useState(true);
  const [rescale, setRescale] = useState<[number, number]>([0, 1000]);

  const rasterTileTemplate = useMemo(() => {
    if (!tileTemplateBase || !colormap.trim()) return null;

    // Start with base URL (already decoded in onSearchId)
    let finalUrl = tileTemplateBase;

    // Build query params
    const params = new URLSearchParams();
    params.set("colormap_name", colormap.trim());
    params.set("rescale", `${rescale[0]},${rescale[1]}`);

    // Append with ? or &
    finalUrl += finalUrl.includes("?") ? `&${params}` : `?${params}`;

    console.log("Final raster URL:", finalUrl);
    return finalUrl;
  }, [tileTemplateBase, colormap, rescale]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sidebar
        onSearchId={(url) => {
          const decoded = decodeURIComponent(url);
          console.log("Base URL from Sidebar (decoded):", decoded);
          setTileTemplateBase(decoded);
        }}
        onColormapChange={setColormap}
        onImageryToggle={setImageryVisible}
        onRescaleChange={setRescale}
      />
      <main style={{ flex: 1, position: "relative" }}>
        <MapViewer tileTemplate={rasterTileTemplate} imageryVisible={imageryVisible} />
      </main>
    </div>
  );
}

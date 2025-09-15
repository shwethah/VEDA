import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import MapViewer from "./components/MapViewer";

export default function App() {
  const [searchId, setSearchId] = useState<string | null>(null);
  const [colormap, setColormap] = useState<string>("");   // external style
  const [imageryVisible, setImageryVisible] = useState<boolean>(true);

  const hasExternalParams = Boolean((colormap ?? "").trim());

  const tileTemplate = useMemo(() => {
    // Don’t load raster until we have an id AND at least one external param
    if (!searchId || !hasExternalParams) return null;

    const params = new URLSearchParams({
      assets: "cog_default",
      pixel_selection: "first",
    });

    const cm = colormap.trim();
    if (cm) params.set("colormap_name", cm); // only when non-empty

    return `https://openveda.cloud/api/raster/searches/${searchId}/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png?${params.toString()}`;
  }, [searchId, hasExternalParams, colormap]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sidebar
        onSearchId={setSearchId}
        onColormapChange={setColormap}
        onImageryToggle={setImageryVisible} // if you wired the checkbox up
      />
      <main style={{ flex: 1, position: "relative" }}>
        <MapViewer
          tileTemplate={tileTemplate}      // null => basemap only
          imageryVisible={imageryVisible}  // must be true to render
        />
      </main>
    </div>
  );
}

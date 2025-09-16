import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import MapViewer from "./components/MapViewer";

export default function App() {
  const [tileTemplateBase, setTileTemplateBase] = useState<string | null>(null);
  const [colormap, setColormap] = useState<string>(""); 
  const [imageryVisible, setImageryVisible] = useState<boolean>(true);
  const [rescale, setRescale] = useState<[number, number]>([0, 1000]);

  const rasterTileTemplate = useMemo(() => {
    if (!tileTemplateBase) {
      console.log("No base URL from Sidebar yet");
      return null;
    }
    if (!colormap.trim()) {
      console.log("No colormap yet → raster imagery disabled");
      return null;
    }
    
    try {
      // Decode braces into {z}/{x}/{y}
      let finalUrl = decodeURIComponent(tileTemplateBase);

      // Append colormap_name manually (avoid URL() auto-encoding {z})
      if (finalUrl.includes("?")) {
        finalUrl += `&colormap_name=${encodeURIComponent(colormap.trim())}`;
      } else {
        finalUrl += `?colormap_name=${encodeURIComponent(colormap.trim())}`;
      }
      // Append rescale
      if (rescale) {
        finalUrl += `&rescale=${rescale[0]},${rescale[1]}`;
      }
      console.log("Final raster URL:", finalUrl);
      return finalUrl;
    } catch (err) {
      console.error("Invalid tileTemplateBase:", tileTemplateBase, err);
      return null;
    }
  }, [tileTemplateBase, colormap, rescale]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Sidebar
        onSearchId={(url) => {
          // Decode braces early so App always has {z}/{x}/{y}
          const decoded = decodeURIComponent(url);
          console.log("Base URL from Sidebar (decoded):", decoded);
          setTileTemplateBase(decoded);
        }}
        onColormapChange={setColormap}
        onImageryToggle={setImageryVisible}
        onRescaleChange={setRescale}  
      />
      <main style={{ flex: 1, position: "relative" }}>
        <MapViewer
          tileTemplate={rasterTileTemplate}
          imageryVisible={imageryVisible}
        />
      </main>
    </div>
  );
}

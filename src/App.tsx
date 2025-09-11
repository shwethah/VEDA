// src/App.tsx
import Sidebar from "./components/Sidebar";
import MapViewer from "./components/MapViewer";

export default function App() {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sidebar />
      <main style={{ flex: 1, position: "relative" }}>
        <MapViewer />
      </main>
    </div>
  );
}

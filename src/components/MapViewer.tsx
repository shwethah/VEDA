import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import ZoomControl from "./ZoomControls";
import { FlyToInterpolator } from "@deck.gl/core";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
};

const INITIAL_VIEW_STATE: ViewState = {
  longitude: -98,
  latitude: 39,
  zoom: 3,
  pitch: 0,
  bearing: 0,
};

// 🔹 Compare view states with tolerance (avoid jitter on decimals)
function isSameView(a: ViewState, b: ViewState) {
  return (
    Math.abs(a.longitude - b.longitude) < 1e-6 &&
    Math.abs(a.latitude - b.latitude) < 1e-6 &&
    Math.abs(a.zoom - b.zoom) < 1e-6 &&
    a.pitch === b.pitch &&
    a.bearing === b.bearing
  );
}

export default function MapViewer() {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);

  const clamp = (z: number) => Math.max(1, Math.min(22, z));

  const zoomIn = () =>
    setViewState(v => ({
      ...v,
      zoom: clamp(v.zoom + 1),
      transitionDuration: 300,
      transitionInterpolator: new FlyToInterpolator(),
    }));

  const zoomOut = () =>
    setViewState(v => ({
      ...v,
      zoom: clamp(v.zoom - 1),
      transitionDuration: 300,
      transitionInterpolator: new FlyToInterpolator(),
    }));

  const disabledIn = viewState.zoom >= 22;
  const disabledOut = viewState.zoom <= 1;

  // 🔹 DeckGL view change
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDeckChange = ({ viewState: vs }: any) => {
    if (!isSameView(vs as ViewState, viewState)) {
      setViewState(vs as ViewState);
    }
  };

  // 🔹 MapLibre move
  const handleMapMove = (evt: { viewState: ViewState }) => {
    if (!isSameView(evt.viewState, viewState)) {
      setViewState(evt.viewState);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ZoomControl
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        disabledIn={disabledIn}
        disabledOut={disabledOut}
        position="top-right"
      />

      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
        <DeckGL
          viewState={viewState}
          controller
          onViewStateChange={handleDeckChange}
        >
          <Map
            mapLib={maplibregl}
            mapStyle={MAP_STYLE}
            reuseMaps
            onMove={handleMapMove}
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
          />
        </DeckGL>
      </div>
    </div>
  );
}

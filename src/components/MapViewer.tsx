import { useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FlyToInterpolator, type ViewStateChangeParameters } from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import ZoomControl from "./ZoomControls";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
};

type MapViewerProps = {
  tileTemplate?: string | null;
  imageryVisible?: boolean;
  minZoom?: number;
  maxZoom?: number;
};

const INITIAL_VIEW_STATE: ViewState = {
  longitude: -98,
  latitude: 39,
  zoom: 3,
  pitch: 0,
  bearing: 0,
};

// avoid feedback loops when syncing view states
function isSameView(a: ViewState, b: ViewState) {
  return (
    Math.abs(a.longitude - b.longitude) < 1e-6 &&
    Math.abs(a.latitude - b.latitude) < 1e-6 &&
    Math.abs(a.zoom - b.zoom) < 1e-6 &&
    a.pitch === b.pitch &&
    a.bearing === b.bearing
  );
}

// narrow sublayer props we actually use (keeps TS + eslint happy)
type RenderProps = {
  id: string;
  data: string | HTMLImageElement | ImageBitmap;
  tile: { bbox: { west: number; south: number; east: number; north: number } };
};

export default function MapViewer({
  tileTemplate = null,
  imageryVisible = true,
  minZoom = 0,
  maxZoom = 22,
}: MapViewerProps) {
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

  const handleDeckChange = ({ viewState: vs }: ViewStateChangeParameters) => {
    const next = vs as unknown as ViewState;
    if (!isSameView(next, viewState)) setViewState(next);
  };

  const handleMapMove = (evt: { viewState: ViewState }) => {
    if (!isSameView(evt.viewState, viewState)) setViewState(evt.viewState);
  };

  // TileLayer + BitmapLayer (Deck.gl fetches tiles for the template automatically)
  const layers = useMemo(() => {
    if (!tileTemplate || !imageryVisible) return [];
    return [
      new TileLayer({
        id: "veda-tiles",
        data: tileTemplate, 
        minZoom,
        maxZoom,
        tileSize: 256,

        // props.data = fetched image, props.tile.bbox = [w,s,e,n]
        renderSubLayers: (props) => {
          const { id, data, tile } = props as unknown as RenderProps;
          const { west, south, east, north } = tile.bbox;

          return new BitmapLayer({
            id: `${id}-bitmap`,
            image: data,
            bounds: [west, south, east, north],
            pickable: false,
            opacity: 0.2,
          });
        },
      }),
    ];
  }, [tileTemplate, imageryVisible, minZoom, maxZoom]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ZoomControl
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        disabledIn={disabledIn}
        disabledOut={disabledOut}
        position="top-right"
      />

      <div style={{ position: "absolute", inset: 0 }}>
        <DeckGL
          viewState={viewState}
          controller
          onViewStateChange={handleDeckChange}
          layers={layers}
        >
          <Map
            mapLib={maplibregl}
            mapStyle={MAP_STYLE}
            reuseMaps
            onMove={handleMapMove}
            style={{ position: "absolute", inset: 0 }}
          />
        </DeckGL>
      </div>
    </div>
  );
}

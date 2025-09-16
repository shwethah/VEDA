export interface ApiLink {
  href: string;
  rel: string;
  title?: string;
  templated?: boolean;
}

export interface ApiResponse {
  id: string;
  links?: ApiLink[];
}

export async function registerRasterSearch(
  datasetKey: string,
  dateKey: string,
  signal?: AbortSignal
): Promise<string | null> {
  try {
    const payload: Record<string, unknown> = {
      collections: [datasetKey],
      datetime: `${dateKey}T00:00:00Z`,
    };

    //1. Register raster search
    const response = await fetch("/raster/searches/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse = await response.json();

    //2. Get tilejson link
    const tileJsonLink = data.links?.[1];
    if (!tileJsonLink) return null;

    //3. Replace placeholders and add query params
    const href = tileJsonLink.href.replace("{tileMatrixSetId}", "WebMercatorQuad");
    const url = new URL(href);
    url.searchParams.set("assets", "cog_default");
    url.searchParams.set("pixel_selection", "first");

    // 4. Fetch TileJSON and return the first tile URL
    const tileResp = await fetch(url.toString(), { signal });
    if (!tileResp.ok) throw new Error(`TileJSON HTTP ${tileResp.status}`);
    const tileData = await tileResp.json();

    return Array.isArray(tileData.tiles) ? tileData.tiles[0] : null;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return null;
    console.error("Raster API error:", err);
    return null;
  } 
}

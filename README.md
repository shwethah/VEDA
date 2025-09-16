### VEDA STAC
A React application for browsing and visualizing the NASA VEDA STAC Imagery
It connects to VEDA APIS, fetches the imagery collections, and renders them on a MapLibre basemap with deck.gl for raster visualization.

### CORE FEATURES:
1. Load VEDA STAC Imagery
   This application connects to VEDA API and TiTiler to transform the search results into web-map tiles displayed in browser.

  1.1 When the user selects the date and corresponding dataset, this triggers STAC /searches/register request
    - The register request's payload specifies collection and datetime
    - The API responds to the metadata containing the link, including TileJSON endpoint
  
  1.2 Fetch TileJSON metadata
    - The application replaces the placeholder (e.g., {tileMatrixSetId} -> WebMercatorQuad) in the TileJSON url
    - Additional parameters are appended for better visualization
      * assets = cog_default
      * pixel_selection = first
      * colormap_name = <selected colormap>
      * rescale = <min, max>
    - Example of TileJSON Url:
      https://openveda.cloud/.../tilejson.json?tileMatrixSetId=WebMercatorQuad&assets=cog_default&pixel_selection=first&colormap_name=viridis&rescale=-1,1

  1.3 Extract tile template
    - The TileJSON response contains tile array with URLs like:
      https://openveda.cloud/.../{z}/{x}/{y}?assets=cog_default&colormap_name=viridis&rescale=-1,1
    - These {z}/{x}/{y} placeholders are the standard XYZ web-map tile scheme.

  1.4 Render raster tiles
    - The app passes the tiletemplate into deck.gl's TileLayer
    - Each {z}/{x}/{y} request retrieves a raster png from TiTiler
    - Tiles are drawn on the map using BitmapLayer, overlaid on MapLibre Basemap

2. Functionality to navigate through dates
  - Allows the user to provide a datepicker to select specific date

3. Toggle Later Visibility
  - Check box is implemented to toggle VEDA imagery layer on and off

4. Change Colormaps and Rescale
  - Provides dropdown option for colormaps to select different colormaps (e.g., viridis, magma, rdylgn, inferno, plasma )
  - Allows the user to adjust the rescale parameters for better visualization

  

           

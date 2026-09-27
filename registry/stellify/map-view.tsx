import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet"
import { latLngBounds } from "leaflet"

import { cn } from "@/lib/utils"

export interface MapMarker {
  id: number | string
  lat: number
  lng: number
  label: string
}

export interface MapViewProps {
  markers: MapMarker[]
  selectedIds: ReadonlySet<number | string>
  onMarkerClick: (id: MapMarker["id"]) => void
  /** Initial view when there are no markers (defaults to Spain). */
  center?: [number, number]
  zoom?: number
  /** OpenStreetMap by default. OSM only paints the map: it provides no business data. */
  tileUrl?: string
  attribution?: string
  className?: string
}

const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

function FitToMarkers({ markers }: { markers: MapMarker[] }) {
  const map = useMap()
  const key = markers.map((m) => m.id).join(",")
  useEffect(() => {
    if (markers.length > 0) {
      map.fitBounds(latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number])), { padding: [32, 32], maxZoom: 14 })
    }
    // Refit only when the set of markers changes, not on selection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map])
  return null
}

/** Leaflet map with one circle marker per item; selected = primary, others = grey. */
function MapView({
  markers,
  selectedIds,
  onMarkerClick,
  center = [40.2, -3.7],
  zoom = 6,
  tileUrl = OSM_TILES,
  attribution = OSM_ATTRIBUTION,
  className,
}: MapViewProps) {
  return (
    <div data-slot="map-view" className={cn("isolate h-80 overflow-hidden rounded-xl border", className)}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer url={tileUrl} attribution={attribution} />
        <FitToMarkers markers={markers} />
        {markers.map((m) => {
          const selected = selectedIds.has(m.id)
          return (
            <CircleMarker
              key={`${m.id}-${selected}`}
              center={[m.lat, m.lng]}
              radius={selected ? 9 : 7}
              className={selected ? "cc-marker-selected" : "cc-marker"}
              pathOptions={{
                color: selected ? "var(--primary)" : "var(--muted-foreground)",
                fillColor: selected ? "var(--primary)" : "var(--muted-foreground)",
                fillOpacity: selected ? 0.9 : 0.45,
                weight: 2,
              }}
              eventHandlers={{ click: () => onMarkerClick(m.id) }}
            >
              <Tooltip>{m.label}</Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export { MapView }

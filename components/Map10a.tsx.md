import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, Tooltip, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FeatureCollection, Feature, Geometry } from 'geojson';
import wellknown from 'wellknown';
import * as Papa from 'papaparse';
import { LayersControl } from 'react-leaflet';

export interface ProgressData {
    [region: number]: number;
}

interface MapProps {
    onProgressUpdate: (progressData: ProgressData) => void;
    progressData: ProgressData;
}

const MapContent: React.FC<{ geoJSONData: FeatureCollection }> = ({ geoJSONData }) => {
    const map = useMap();

    useEffect(() => {
        if (map && geoJSONData && geoJSONData.features.length > 0) {
            const geojsonLayer = L.geoJSON(geoJSONData);
            const bounds = geojsonLayer.getBounds();

            if (bounds.isValid()) {
                map.fitBounds(bounds);
            } else {
                console.warn('Invalid bounds:', bounds);
            }
        }
    }, [map, geoJSONData]);

    return null;
};

const getColorByProgress = (progress: number) => {
    switch (progress) {
        case 0: return 'red';
        case 1: return 'orange';
        case 2: return 'blue';
        case 3: return 'gray';
        default: return 'black';
    }
};

const parseWKT = (wkt: string): GeoJSON.Geometry | null => {
    try {
        const geojson = wellknown.parse(wkt);
        return geojson;
    } catch (error) {
        console.error('Error parsing WKT:', error);
        return null;
    }
};

const Map: React.FC<MapProps> = ({ onProgressUpdate, progressData }) => {
    const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null);
    const [markers, setMarkers] = useState<React.ReactNode[]>([]);
    const [currentPosition, setCurrentPosition] = useState<L.LatLng | null>(null);
    const [polygonPoints, setPolygonPoints] = useState<L.LatLng[]>([]);
    const [isCreatingPolygon, setIsCreatingPolygon] = useState<boolean>(false);
    const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
    const [region, setRegion] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        fetch('/Polygon.csv')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const features = results.data
                            .filter((row: any) => row.WKT && row.region)
                            .map((row: any) => {
                                const geometry = parseWKT(row.WKT);
                                if (!geometry) {
                                    console.warn('Failed to parse WKT:', row.WKT);
                                    return null;
                                }
                                return {
                                    type: 'Feature',
                                    geometry,
                                    properties: {
                                        region: row.region,
                                        description: row.description,
                                    },
                                };
                            })
                            .filter((feature: any) => feature !== null);

                        setGeoJSONData({
                            type: 'FeatureCollection',
                            features,
                        });
                    },
                });
            })
            .catch((error) => {
                console.error('Error fetching Polygon.csv:', error);
            });
    }, []);



    const addCenterMarker = (feature: Feature, latlngs: L.LatLng[]) => {
        if (latlngs.length === 0) return null;

        const bounds = L.latLngBounds(latlngs);
        const center = bounds.getCenter();
        const regionId = feature.properties?.region as string;

        return (
            <CircleMarker
                center={center}
                radius={0}
                key={`marker-${regionId}`}
            >
                <Tooltip permanent direction="center" className="region-label">
                    {regionId}
                </Tooltip>
            </CircleMarker>
        );
    };


    
    const onEachFeature = useCallback((feature: Feature, layer: L.Layer) => {
        const regionId = feature.properties?.region as string;

        const updateStyle = (progress: number) => {
            const color = getColorByProgress(progress);
            if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                layer.setStyle({
                    fillColor: color,
                    fillOpacity: 0.5,
                    weight: 2,
                    color: 'black',
                });
            }
        };

        updateStyle(progressData[regionId] !== undefined ? progressData[regionId] : 3);

        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
            // クリックイベントハンドラを削除

            const latlngs = layer.getLatLngs().flat();
            const centerMarker = addCenterMarker(feature, latlngs as L.LatLng[]);
            if (centerMarker) {
                setMarkers(prevMarkers => [...prevMarkers, centerMarker]);
            }
        } else {
            console.warn('Unexpected layer type:', layer);
        }
    }, [progressData, onProgressUpdate]);

    useEffect(() => {
        if (geoJSONData) {
            setGeoJSONData(prevData => {
                if (prevData === null) return null;
                return {
                    type: "FeatureCollection",
                    features: prevData.features.map(feature => ({
                        ...feature,
                        properties: {
                            ...feature.properties,
                            progress: progressData[feature.properties?.region as string] || 3
                        }
                    }))
                };
            });
        }
    }, [progressData]);

    const memoizedGeoJSON = useMemo(() => (
        geoJSONData && (
            <GeoJSON
                key={JSON.stringify(progressData)}
                data={geoJSONData}
                onEachFeature={onEachFeature}
            />
        )
    ), [geoJSONData, onEachFeature, progressData]);

    const showCurrentLocation = () => {
        if (mapRef.current) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const latLng = L.latLng(latitude, longitude);
                setCurrentPosition(latLng);
                mapRef.current?.setView(latLng, 15);
            }, (error) => {
                console.error("Error getting current location:", error);
            });
        }
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (isCreatingPolygon) {
            setPolygonPoints([...polygonPoints, e.latlng]);
        }
    };

    const startCreatingPolygon = () => {
        setIsCreatingPolygon(true);
        setPolygonPoints([]);
    };

    const savePolygon = () => {
        if (polygonPoints.length > 2) {
            setIsPopupVisible(true);
        } else {
            alert("ポリゴンを作成するには少なくとも3つのポイントが必要です。");
        }
    };

    const handleSave = () => {
        const wkt = `"POLYGON ((${polygonPoints.map(p => `${p.lng} ${p.lat}`).join(', ')}))"`;
        const polygonData = `${wkt},${region},${description}`;
        const blob = new Blob([polygonData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `polygon_${region}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        setIsPopupVisible(false);
        setIsCreatingPolygon(false);
        setPolygonPoints([]);
    };

    const MapEvents = () => {
        useMapEvents({
            click: handleMapClick,
        });
        return null;
    };

    return (
        <>
            <MapContainer
                style={{ height: '600px', width: '100%' }}
                center={[0, 0]}
                zoom={2}
                ref={mapRef}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer name="OpenStreetMap">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer checked name="航空写真">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                <MapEvents />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {memoizedGeoJSON}
                {markers}
                {currentPosition && (
                    <CircleMarker
                        center={currentPosition}
                        radius={8}
                        fillColor="blue"
                        fillOpacity={0.8}
                        stroke={false}
                    >
                        {/* <Tooltip permanent>Current Location</Tooltip> */}
                    </CircleMarker>
                )}

                {isCreatingPolygon && polygonPoints.length > 0 && (
                    <>
                        <Polygon positions={polygonPoints} />
                        {polygonPoints.map((point, index) => (
                            <CircleMarker
                                key={index}
                                center={point}
                                radius={5}
                                color="ADD8E6"
                                fillColor="blue"
                                weight={1}
                                opacity={1}
                                fillOpacity={0.6}
                            />
                        ))}
                    </>
                )}

                {geoJSONData && <MapContent geoJSONData={geoJSONData} />}
            </MapContainer>
            <div style={{
                position: 'fixed', bottom: '10px', left: '10px', zIndex: 1000,
                display: 'flex', flexDirection: 'column', gap: '10px',
                backgroundColor: 'white', padding: '10px', borderRadius: '5px'
            }}>
                <button onClick={showCurrentLocation}>Current Location</button>
                <button onClick={startCreatingPolygon}>Create Polygon</button>
                {isCreatingPolygon && (
                    <button onClick={savePolygon}>Save Polygon</button>
                )}
            </div>

            {isPopupVisible && (
                <div style={{
                    position: 'fixed',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'white',
                    padding: '20px',
                    zIndex: 2000,
                    border: '1px solid black',
                    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
                    borderRadius: '5px'
                }}>
                    <h2>Polygon Information</h2>
                    <div>
                        <label>
                            Region:
                            <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Description:
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </label>
                    </div>
                    <button onClick={handleSave}>Save</button>
                </div>
            )}
        </>
    );
};

export default Map;
import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';

// Leafletのアイコン問題を解決
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const CreatePolygon: React.FC = () => {
    const [polygons, setPolygons] = useState<any[]>([]);
    const mapRef = useRef<L.Map | null>(null);

    const handleCreated = (e: any) => {
        const { layer } = e;
        const newPolygon = layer.toGeoJSON();
        setPolygons([...polygons, newPolygon]);
        console.log('New polygon created:', newPolygon);
    };

    const handleSave = () => {
        // ここでポリゴンデータを保存または送信します
        console.log('Saving polygons:', polygons);
        // 例: APIにデータを送信
        // fetch('/api/save-polygons', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(polygons),
        // });
    };

    return (
        <div>
            <h1>Create New Polygons</h1>
            <MapContainer
                center={[35.6895, 139.6917]} // Tokyo coordinates
                zoom={13}
                style={{ height: '500px', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FeatureGroup>
                    <EditControl
                        position="topright"
                        onCreated={handleCreated}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                        }}
                    />
                </FeatureGroup>
            </MapContainer>
            <button onClick={handleSave} style={{ marginTop: '10px' }}>Save Polygons</button>
        </div>
    );
};

export default CreatePolygon;
import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ProgressData } from '../components/Map';
import InitialDataLoader from '../components/InitialDataLoader';
import * as Papa from 'papaparse';

const MapComponent = dynamic(() => import('../components/Map'), { ssr: false });

// プログレス状態のマッピングを定義
const progressMapping = {
    0: '未散布',
    1: '散布中',
    2: '散布済み',
    3: '散布中止'
};

// 色のマッピングを定義
const colorMapping = {
    0: 'red',
    1: 'orange',
    2: 'blue',
    3: 'gray'
};

const ProgressSelector: React.FC<{
    progressData: ProgressData,
    onProgressUpdate: (newProgressData: ProgressData) => void
}> = ({ progressData, onProgressUpdate }) => {
    const [selectedRegion, setSelectedRegion] = useState<string>('');

    const handleRegionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRegion(event.target.value);
    };

    const handleProgressSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newProgress = parseInt(event.target.value);
        if (selectedRegion) {
            const newProgressData = { ...progressData, [selectedRegion]: newProgress };
            onProgressUpdate(newProgressData);
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <select onChange={handleRegionSelect} value={selectedRegion}>
                <option value="">Select region</option>
                {Object.keys(progressData).map(region => (
                    <option key={region} value={region}>{region}</option>
                ))}
            </select>
            {selectedRegion && (
                <select
                    onChange={handleProgressSelect}
                    value={progressData[selectedRegion]}
                    style={{ marginLeft: '10px' }}
                >
                    {Object.entries(progressMapping).map(([value, label]) => (
                        <option
                            key={value}
                            value={value}
                            style={{ color: colorMapping[parseInt(value) as keyof typeof colorMapping] }}
                        >
                            {label}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

const IndexPage: React.FC = () => {
    const [progressData, setProgressData] = useState<ProgressData>({});

    const handleProgressUpdate = useCallback((newProgressData: ProgressData) => {
        setProgressData(newProgressData);
    }, []);

    const handleInitialDataLoad = useCallback((data: ProgressData) => {
        setProgressData(prevData => ({ ...prevData, ...data }));
    }, []);

    const handleSaveCSV = () => {
        const csvContent = Papa.unparse(
            Object.entries(progressData).map(([region, progress]) => ({
                region,
                progress,
            }))
        );

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const date = new Date().toISOString().replace(/[:.]/g, '-');
            link.setAttribute('download', `Progress_${date}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ width: '86%' }}>
                <h1>Farmland Map</h1>
                <MapComponent
                    onProgressUpdate={handleProgressUpdate}
                    progressData={progressData}
                />
            </div>
            <div style={{ width: '14%', padding: '8px' }}>
                <h2>Status</h2>

                <InitialDataLoader onDataLoaded={handleInitialDataLoad} />
                <button onClick={handleSaveCSV}>Save Progress</button>



{/*


//４種類のリンクボタン並びに
// 共有フォルダへのファイル送信システムを置きたい


共有ホルダ内の作業進捗入力ファイル	https://docs.google.com/spreadsheets/d/1oXpWOmPWHfdvuv4uBc0rFcsXBa-9ECWiczDoDFZkUu4/edit?usp=drive_link

共有ホルダ	https://drive.google.com/drive/u/0/folders/1Uuwfk6ujh2XpjBYOCJ20B-86UbcKNlSX

Download GAS	https://script.google.com/macros/s/AKfycbya8YAc00btWBEvhvFpdoNlm_L6IkjmWKhJbQ68EIeDcYEy_vtKVKJWvCGAQiSY0-3NRQ/exec

Upload GAS	https://script.google.com/macros/s/AKfycbwL3jKpmAxGUYqUoz8gQP0Zh-NBZQFgBxIKH7kOmYUPBXf3yVrpEr6LQ_TfUw_0qBvZAw/exec



<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSV Upload to Google Drive</title>
</head>

<body>
    <h1>CSV Upload to Google Drive</h1>
    <input type="file" id="fileInput" />
    <button id="uploadButton">Upload File to Google Drive</button>

    <script>
        document.getElementById('uploadButton').addEventListener('click', function () {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];

            if (!file) {
                alert('Please select a file first.');
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {
                const fileContent = event.target.result;
                const fileName = file.name;

                fetch('https://script.google.com/macros/s/AKfycbzTRUmakmdncy3WYFCFNX-y7biQNBs2nPfMNqAYfUI8RDxT7G-UUBBVM_E6tMRw1cF33Q/exec', {
                    method: 'POST',
                    body: JSON.stringify({ content: fileContent, fileName }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    mode: 'no-cors' // このオプションはレスポンスを取得できません
                })
                    .then(() => {
                        console.log('File uploaded successfully');
                    })
                    .catch(error => console.error('Error uploading file:', error));
            };

            reader.readAsText(file);
        });
    </script>
</body>

*/}


                <ProgressSelector
                    progressData={progressData}
                    onProgressUpdate={handleProgressUpdate}
                />

                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {Object.entries(progressData).map(([region, progress]) => (
                        <li key={region} style={{ marginBottom: '5px' }}>
                            <span style={{
                                color: colorMapping[progress as keyof typeof colorMapping],
                                fontWeight: 'bold'
                            }}>
                                {region}: {progressMapping[progress as keyof typeof progressMapping]}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default IndexPage;
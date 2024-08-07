```
2024-08-07 01:30
仕様変更 v2.1
コンテンツを地図の下に移動
ポリンゴンの中心の数値はタッチで反応する
polygonのcsvからのdownload/upload時の書式標準化

2024-08-04 02:45
仕様変更 v1.1
leafletの地図を航空写真をdefaultにして種類を選べるようにする
preogressの更新で、ポリゴンタッチでの進捗変更入力は無効にする
createPolygon時の点の大きさを調整

2024-08-03 02:00
index.tsxのreturnで規定されている地図の右側15%の領域に、
現在、map.tsxで規定されている２つのボタン
<button onClick={showCurrentLocation}>Show Current Location</button>
<button onClick={startCreatingPolygon}>Create Polygon</button>
を直接設置したいが可能か。

2024-08-02 19:30
popup修正を確認しました
pcで確認OKですがスマホではボタンが地図の下に隠れる
そこで、地図の外の右側の領域にcurrent locationとcreated polygonのボタンを配置したい
chatGPTに依頼
ボタン類の位置が地図の上で見れるのだが、依頼とは異なる

2024-08-02 19:10
素晴らしい、完成に近いです
polygon saveの時のpop up windowを
地図の真ん中でなく、左の方で開いてください

2024-08-02 19:00
現行のmap.tsxに、別のmap1.tsxの機能を全て追加したい
追加される機能は、現在地表示、polygon作成・保存
初め開いた時の表示位置は、東京でなく、現行のmap.tsxで良い
map1.tsxはこちら

2024-08-02 14:10
polygonの中心くらいにregion番号を表示する
map.tsx

```
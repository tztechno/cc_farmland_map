```
Fukaya様

複数人が現場で使用することを想定したアプリ修正版(v2.0)が、形になってきましたので、お知らせします。

https://coco-farmland-map.vercel.app/

### 

離れた場所にいる複数人が同時に進捗状況を確認したり進捗記入きるようにするためGoogleDriveを使うことしました。

GitHubにはこれまで通り、progress.csv、polygon.csvを置く、一方で、
所定Google Driveに、progress_update,polygon_masterという新たなスプレッドシートを置きます。
使用するシート、ホルダは共有設定をしているので、同時編集が可能です。
Gmailのアカウントで入リ使用することができます。スプレッドシートはGASを含むため初めて使用する場合は、各人の認証が発生します。

progress_updateが最新の進捗を確認したり、現場で作業する入が入力する場所になります。（PC、スマホ）
行った作業はpulldown列に入力します。自動（onEditのGASが常駐している）で名前（gmailの＠の前の部分）と操作日時が記入されます。（PC、スマホ）
progress_updateはPC上でGASを使ってGitHubとの間でdownload/uploadができます（PCのみ、スマホは不可）。

新たなpolygonを作成した場合、GoogleDriveに集約してファイルを送ることができます。（PC,スマホ）
polygon_masterは、polygonリストの追加や更新が必要になった場合の、編集場所になります。（編集はPC推奨）

polygon_masterはPC上でGASを使ってGitHubとの間でdownload/uploadができます（PCのみ、スマホは不可）。
なお、これらを可能にするために、Google Drive上のファイルとの連携、GAS設定にはファイルID、ホルダのID、さらに
ファイルをGitHubにGASでuploadするためにGitHubのAPI_TOKENのセッティングが必要になっています。

### 

アプリは、GitHub上の　polygonデータを使用して、地図にpolygonを示す。
進捗について、GitHubの情報由来（progress初期値）かGoogleDrive情報由来（realtime値）で表示するかをボタンで切り替えて、
色で進捗を表示できるようにしました。（PC,スマホ）
（スマホからで最新の進捗を地図でも確認できるので、スマホからGASのdownload/uploadを行う必要はなくなりました。）
端末で生成・保存したファイルを選んで所定のGoogleDriveに送信する機能も搭載しました。（PC,スマホ）
端末で新たにpolygonを作った場合、アプリを通じて作成したファイルは共有Driveに集約できます。
地図は航空写真をデフォルトで表示するようにしました。

progress_updateの記入は作業の都度必要ですが、GitHubへのupload/GitHubからのdownloadは、一日１回程度PCから実施すれば十分です。
polygon_masterはpolygonの新規追加や記載の修正が必要になった場合のみ使います。

### 

現在、私のGoogleDriveに設置したホルダを仮の設置場所にして共有可能な状態にしているので、
アプリ基本機能確認の他、SpreadSheetの記入、ファイルのupload/downloadのマクロ操作含めて色々お試しください。

これに合わせて、使用マニュアルv2も改訂を進めて行きます。
ご不明な点やご希望がございましたらお知らせください。

石井

```

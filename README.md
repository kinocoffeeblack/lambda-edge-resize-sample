# cf-img-optimizer-sample

↓記事のNode12.x(OriginResponse)とpython3.8(ViwerRequest)でのサンプル実装です  
https://aws.amazon.com/jp/blogs/news/resizing-images-with-amazon-cloudfront-lambdaedge-aws-cdn-blog/

# 仕様概要

元の画像
>  "https://xxxxxx/img/sample.png"

をベースに下記のようなリクエストをすると指定した横サイズにリサイズされた画像が自動で生成されます。

> "https://xxxxxx/img/sample.png?w=100"

w=100 とした場合は100pxにリサイズされます。

一度生成されたリサイズ画像はS3バケットに永続されるとともにCFのキャッシュに残ります。
S3バケット上のパスは img/w100/sample.png などになります。

CloudFront側の設定で"/img/*"のBehaviorを追加してViewerRequestとOriginResponseにそれぞれのLambdaをアタッチします。

# ビルドとデプロイ

```
chmod u+x ./*.sh
./sam-deploy.sh
```

# SAM local でのローカル動作確認方法

(SAMの環境があるCloud9環境にて)  
template.yamlファイルがあるディレクトリ上で...

## ViewerRequestの場合

> sam local invoke ViewerRequest -e ViewerRequest/tests/event-cf.json

## OriginResponseの場合

> sam local invoke OriginResponse -e OriginResponse/tests/event-cf.json

## 要変更箇所

OriginResponseのindex.jsに書かれている画像リソースを配置するS3バケット名 "XXXXXXXX" を各自の環境に合わせて変更する必要があります。  
Lambda@Edgeは環境変数をサポートしていないため、ここではソース内に直書きしています。
# cf-img-optimizer-sample

↓記事のNode10.xランタイムでのサンプル実装です
https://aws.amazon.com/jp/blogs/news/resizing-images-with-amazon-cloudfront-lambdaedge-aws-cdn-blog/

# 仕様概要

元の画像
>  "https://study.kinocoffeeblack.net/img/nomu01.png"

をベースに下記のようなリクエストをすると指定した横サイズにリサイズされた画像が自動で生成されます。

> "https://study.kinocoffeeblack.net/img/nomu01.png?w=100"

w=100 とした場合は100pxにリサイズされます。

一度生成されたリサイズ画像はS3バケットに永続されるとともにCFのキャッシュに残ります。
S3バケット上のパスは img/w100/nomu01.png などになります。

# ビルドとデプロイ

```
chmod u+x ./*.sh
./sam-build.sh
./sam-package.sh
./sam-deploy.sh
```

※ sam-package.shに書かれているLambdaアップロード用のS3バケット名は各自の環境に合わせて変更する必要があります。  
S3バケットは事前に作成しておく必要があります。

# SAM local でのローカル動作確認方法

(SAMの環境があるCloud9環境にて)  
template.yamlファイルがあるディレクトリ上で...

## ViewerRequestの場合

> sam local invoke ViewerRequest -e ViewerRequest/tests/event-cf.json

## OriginResponseの場合

> sam local invoke OriginResponse -e OriginResponse/tests/event-cf.json

## 要変更箇所

OriginResponseのindex.jsに書かれている画像リソースを配置するS3バケット名 "study-cf-origin-us-east-1-756298751873" を各自の環境に合わせて変更する必要があります。
Lambda@Edgeは環境変数をサポートしていないため、ここではソース内に直書きしています。
#!/bin/bash

##############################################
# build and deploy Script.
# 
# Cloud9環境で実行することを想定しています
# 
# --use-containerオプションを使用してsam buildしておりDockerが使われるので、Cloud9のdefaultのディスク容量では足りません。
# 初期状態の10Gのままの場合、20GB以上に拡張して下さい
# 参考: https://qiita.com/kinocoffeeblack/items/4daf1b6440cf3e1c25da
##############################################

#  Lambda@Edgeはバージニア北部リージョン固定です
REGION="us-east-1"
ACCOUNT_ID=`aws sts get-caller-identity | jq -r .Account`
BUCKET_NAME="temp-$REGION-$ACCOUNT_ID"

# Bucket存在チェックの参考元: https://stackoverflow.com/questions/31077593/how-do-i-use-shell-script-to-check-if-a-bucket-exists
BUCKET_EXISTS=$(aws s3api head-bucket --bucket $BUCKET_NAME 2>&1 || true)
if [ -z "$BUCKET_EXISTS" ]; then
  echo "Bucket exists"
else
  echo "Bucket does not exist. create new bucket ${BUCKET_NAME}."
  aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION
  aws s3api put-bucket-lifecycle-configuration --bucket ${BUCKET_NAME} --lifecycle-configuration file://temp-bucket-lifecycle.json
fi

sam build --region us-east-1 --use-container

if [ $? -ne 0 ]; then
  echo "[ERROR] build failure."
  exit 1
fi

sam package \
  --output-template-file packaged.yaml \
  --s3-bucket $BUCKET_NAME

if [ $? -ne 0 ]; then
  echo "[ERROR] package failure."
  exit 1
fi

sam deploy \
  --template-file packaged.yaml \
  --stack-name cf-img-optimizer-sample \
  --region ${REGION} \
  --capabilities CAPABILITY_NAMED_IAM

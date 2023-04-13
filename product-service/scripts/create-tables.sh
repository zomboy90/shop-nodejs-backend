#!/usr/bin/env bash

endpoint_url_parameter_name=${1:-''}
endpoint_url_parameter_value=${2:-''}

aws dynamodb create-table \
    --table-name $npm_package_config_table_products \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=title,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
        AttributeName=title,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=10 \
    $endpoint_url_parameter_name $endpoint_url_parameter_value && \

aws dynamodb create-table \
    --table-name $npm_package_config_table_stocks \
    --attribute-definitions \
        AttributeName=product_id,AttributeType=S \
        AttributeName=count,AttributeType=N \
    --key-schema \
        AttributeName=product_id,KeyType=HASH \
        AttributeName=count,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=10 \
    $endpoint_url_parameter_name $endpoint_url_parameter_value

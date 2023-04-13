#!/usr/bin/env bash

endpoint_url_parameter_name=${1:-''}
endpoint_url_parameter_value=${2:-''}

aws dynamodb batch-write-item \
    --request-items file://scripts/assets/products.json \
    --return-item-collection-metrics SIZE \
    $endpoint_url_parameter_name $endpoint_url_parameter_value && \
aws dynamodb batch-write-item \
    --request-items file://scripts/assets/stocks.json \
    --return-item-collection-metrics SIZE \
    $endpoint_url_parameter_name $endpoint_url_parameter_value

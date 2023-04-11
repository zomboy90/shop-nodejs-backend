#!/usr/bin/env bash

endpoint_url_parameter_name=${1:-''}
endpoint_url_parameter_value=${2:-''}

aws dynamodb delete-table --table-name $npm_package_config_table_products $endpoint_url_parameter_name $endpoint_url_parameter_value && \
aws dynamodb delete-table --table-name $npm_package_config_table_stocks $endpoint_url_parameter_name $endpoint_url_parameter_value
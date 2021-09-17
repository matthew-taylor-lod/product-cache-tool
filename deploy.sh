#!/bin/bash
set -x #echo on

scp -r build/*  matthew.taylor@testharness:/var/www/html/product-cache-tool

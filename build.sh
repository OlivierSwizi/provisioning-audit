#!/bin/bash

registry="162690609563.dkr.ecr.eu-west-3.amazonaws.com"
repo="$registry/swizi-$1"
image=$repo:admin.$1.$2
d=$(date +%y%m%d%H%M%S)

aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin $registry &&
    docker buildx build --platform linux/amd64 -t $image --build-arg client=$1 --build-arg env=$2 . &&
    docker tag $image $image.$d &&
    docker push $image && docker push $image.$d

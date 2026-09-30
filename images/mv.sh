#!/bin/bash

for I in $(seq 1 10); do
    echo "$(($I))"
    # pdfjam --landscape --angle 90 "$(($I))".pdf 
    # mv "ism$(($I)) (copy).jpg" "ism$(($I))c.jpg"
    mv "$(($I)).JPG" "pal$(($I)).jpg"
    cp "pal$(($I)).jpg" "pal$(($I))c.jpg"
done


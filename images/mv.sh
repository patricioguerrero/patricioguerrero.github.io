#!/bin/bash

for I in $(seq 1 9); do
    echo "$(($I))"
    # pdfjam --landscape --angle 90 "$(($I))".pdf 
    mv "ism$(($I)) (copy).jpg" "ism$(($I))c.jpg"
done


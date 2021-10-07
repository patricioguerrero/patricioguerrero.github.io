#!/bin/bash

for I in $(seq 16 22); do
    echo "$(($I))"
    # pdfjam --landscape --angle 90 "$(($I))".pdf 
    mv "cli$(($I))c (copy).pdf" "cli$(($I)).pdf"
done


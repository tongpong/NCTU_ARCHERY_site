import csv
import os
import qrcode
from PIL import Image
with open('verification.csv', newline='') as csvfile:
    rows = csv.reader(csvfile)
    target=1;
    for row in rows:
        #code=rows.split(',');
        if( row[0] != "ver_code"):
            cmd='http://archery.nctu.edu.tw/scoring/?varCode='+row[0];
            img = qrcode.make(cmd)
            #result = Image.fromarray(img)
            img.save(str(target)+'.png')
            target+=1;
            
call dir *.ts /b /s > ts-files.txt
call tsc --outDir distrib/ @ts-file.txt

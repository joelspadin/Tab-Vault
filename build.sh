source ~/.bash_profile

mkdir ./locales/en
cp locale-* ./locales/en/
cp help.html ./locales/en/

sed 's/LocalizedHelp: false/LocalizedHelp: true/' <./locales/en/locale-misc.js >./locales/en/temp.js
mv -f ./locales/en/temp.js ./locales/en/locale-misc.js

name="TabVault"

rm -f ./$name.oex
zip -r ./$name.zip ./config.xml ./includes/* ./js/* ./locales/* ./img/* ./popup/* ./help/* ./*.html ./*.css ./*.js
mv ./$name.zip ./$name.oex

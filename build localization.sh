source ~/.bash_profile

mkdir ./locales/en
cp locale-* ./locales/en/
cp help.html ./locales/en/

sed 's/LocalizedHelp: false/LocalizedHelp: true/' <./locales/en/locale-misc.js >./locales/en/temp.js
mv -f ./locales/en/temp.js ./locales/en/locale-misc.js

name="TabVault Localization"

rm -f "./$name.zip"
zip -r "./$name.zip" ./config.xml ./includes/* ./js/* ./locales/* ./img/* ./window/* ./help/* ./*.html ./*.css ./*.js ./_help\ images/*

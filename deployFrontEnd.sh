rsync -r src/ docs/
rsync build/contracts/* docs/
git add .
git commit -m "test"
git push -u origin master

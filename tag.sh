
git tag -a v$(cat package.json| jq -r '.version') -m "Release-$(cat package.json| jq -r '.version')"
git push origin master --tags
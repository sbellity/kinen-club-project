.PHONY: build-all
build-all:
	mkdir -p dist
	GOOS=darwin GOARCH=arm64 go build -o dist/kinen-darwin-arm64 ./cmd/kinen
	GOOS=darwin GOARCH=amd64 go build -o dist/kinen-darwin-amd64 ./cmd/kinen
	GOOS=linux GOARCH=amd64 go build -o dist/kinen-linux-amd64 ./cmd/kinen
	GOOS=darwin GOARCH=arm64 go build -o dist/kinen-daemon-darwin-arm64 ./cmd/kinen-daemon
	GOOS=darwin GOARCH=amd64 go build -o dist/kinen-daemon-darwin-amd64 ./cmd/kinen-daemon
	GOOS=linux GOARCH=amd64 go build -o dist/kinen-daemon-linux-amd64 ./cmd/kinen-daemon

.PHONY: package
package: build-all
	cd dist && tar -czf kinen-darwin-arm64.tar.gz kinen-darwin-arm64
	cd dist && tar -czf kinen-darwin-amd64.tar.gz kinen-darwin-amd64
	cd dist && tar -czf kinen-linux-amd64.tar.gz kinen-linux-amd64
	cd dist && tar -czf kinen-daemon-darwin-arm64.tar.gz kinen-daemon-darwin-arm64
	cd dist && tar -czf kinen-daemon-darwin-amd64.tar.gz kinen-daemon-darwin-amd64
	cd dist && tar -czf kinen-daemon-linux-amd64.tar.gz kinen-daemon-linux-amd64
	cd dist && shasum -a 256 *.tar.gz > checksums.txt



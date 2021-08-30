FROM golang:alpine AS builder
RUN apk update && apk add --no-cache gcc musl-dev
RUN mkdir /work
WORKDIR /work
COPY . .
RUN cd src && go get -d -v
RUN cd src && go build -o /work/server

FROM alpine
RUN apk update && apk add --no-cache musl
COPY --from=builder /work/server/ /bin/server
EXPOSE 8000
ENTRYPOINT ["/bin/server"]

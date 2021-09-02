FROM golang:alpine AS builder
RUN mkdir /work
WORKDIR /work
COPY . .
RUN cd src && go get -d -v
RUN cd src && go build -o /work/server

FROM alpine
COPY --from=builder /work/server/ /bin/server
EXPOSE 8000
ENTRYPOINT ["/bin/server"]

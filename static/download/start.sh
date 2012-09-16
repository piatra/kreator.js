#!/usr/bin/env python
import SimpleHTTPServer
import SocketServer

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
class MyTCPServer(SocketServer.TCPServer):
    allow_reuse_address = True
server = MyTCPServer(('0.0.0.0', 8080), Handler)

server.serve_forever()
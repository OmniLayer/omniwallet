#!/usr/bin/python
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep
import cgi

PORT_NUMBER = 8080
DATA_PATH = "/tmp/msc-webwallet/www"
LOCAL_PATH = curdir + "/www"

#This class will handles any incoming request from
#the browser 
class myHandler(BaseHTTPRequestHandler):
        
        #Handler for the GET requests
        def do_GET(self):
                print 'GET Request: ' + self.path
                if self.path=="/":
                        self.path="/index.html"
                if self.path.find('?') != -1:
                    self.query = self.path[self.path.find('?'):]
                    self.path = self.path[:self.path.find('?')]
                print 'PATH is: ' + self.path
                try:
                        #Check the file extension required and
                        #set the right mime type

                        sendReply = False
                        if self.path.endswith(".html"):
                                mimetype='text/html'
                                sendReply = True
                        if self.path.endswith(".jpg"):
                                mimetype='image/jpg'
                                sendReply = True
                        if self.path.endswith(".gif"):
                                mimetype='image/gif'
                                sendReply = True
                        if self.path.endswith(".png"):
                                mimetype='image/png'
                                sendReply = True
                        if self.path.endswith(".tgz"):
                                mimetype='application/x-gzip'
                                sendReply = True
                        if self.path.endswith(".js"):
                                mimetype='application/javascript'
                                sendReply = True
                        if self.path.endswith(".css"):
                                mimetype='text/css'
                                sendReply = True
                        if self.path.endswith(".json"):
                                mimetype='application/json'
                                sendReply = True

                        if sendReply == True:
                                #Open the static file requested and send it
                                if self.path.startswith( "/tx/" ) or self.path.startswith( "/addr/" ) or self.path.startswith( "/general/" ) or self.path == "/values.json" or self.path == "/revision.json":
                                        pathToServe = DATA_PATH + sep + self.path
                                else:
                                        pathToServe = LOCAL_PATH + sep + self.path
                                f = open( pathToServe ) 
                                self.send_response(200)
                                self.send_header('Content-type',mimetype)
                                self.end_headers()
                                self.wfile.write(f.read())
                                f.close()
                        return

                except IOError:
                        if self.path.startswith( "/addr/" ):
                            self.send_error(200, 'Address not found')
                        else:
                            self.send_error(404,'File Not Found: %s' % self.path)

        #Handler for the POST requests
        def do_POST(self):
                if self.path=="/send":
                        form = cgi.FieldStorage(
                                fp=self.rfile, 
                                headers=self.headers,
                                environ={'REQUEST_METHOD':'POST',
                                 'CONTENT_TYPE':self.headers['Content-Type'],
                        })

                        print "Your name is: %s" % form["your_name"].value
                        self.send_response(200)
                        self.end_headers()
                        self.wfile.write("Thanks %s !" % form["your_name"].value)
                        return                  
                        
                        
try:
        #Create a web server and define the handler to manage the
        #incoming request
        server = HTTPServer(('', PORT_NUMBER), myHandler)
        print 'Started httpserver on port ' , PORT_NUMBER
        
        #Wait forever for incoming htto requests
        server.serve_forever()

except KeyboardInterrupt:
        print '^C received, shutting down the web server'
        server.socket.close()
        

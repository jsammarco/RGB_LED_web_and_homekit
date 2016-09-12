import socket
import serial

data, HOST, PORT = '', '', 8888
color = ''

def find_between( s, first, last ):
    try:
        start = s.index( first ) + len( first )
        end = s.index( last, start )
        return s[start:end]
    except ValueError:
        return ""

serialport = serial.Serial("/dev/ttyACM0", 9600, timeout=2)

listen_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
listen_socket.bind((HOST, PORT))
listen_socket.listen(1)
print 'Serving HTTP on port %s ...' % PORT
while True:
    response = serialport.readline()
    data = response
    if not response:
	print "Haven't received input in 10s"
	data = ''
    print response

    client_connection, client_address = listen_socket.accept()
    request = client_connection.recv(1024)
    color = find_between(request, "START", "END")
    print request
    
    if color != '':
        serialport.write(color);
	serialport.write("\n");

    http_response = """\
HTTP/1.1 200 OK

DATA:"""+data
    client_connection.sendall(http_response)
    client_connection.close()
serialport.close()


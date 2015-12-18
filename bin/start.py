#!/usr/bin/env python
# -*-python-*-

import os
import sys
import logging
import subprocess
import signal
import time
import shutil

# please rewrite me in go (so it can be cross-compiled) ... maybe?

if __name__ == '__main__':

    import optparse
    opt_parser = optparse.OptionParser()

    opt_parser.add_option('-v', '--verbose', dest='verbose', action='store_true', default=False, help='Be chatty (default is false)')

    # things you probably don't need to worry about (but some do)

    opt_parser.add_option('--search-host', dest='search_host', action='store', default='localhost', help='The host to run the Airport City search server on (default is localhost)')
    opt_parser.add_option('--search-port', dest='search_port', action='store', default='3333', help='The port to run the Airport City search server on (default is 9999)')

    # TO DO: allow custom search db path

    opt_parser.add_option('--www-host', dest='www_host', action='store', default='localhost', help='The host to run the Airport City web server on (default is localhost)')
    opt_parser.add_option('--www-port', dest='www_port', action='store', default='2222', help='The port to run the Airport City web server on (default is localhost)')

    options, args = opt_parser.parse_args()

    if options.verbose:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    # Paths

    whatami = sys.platform

    whoami = os.path.abspath(sys.argv[0])
    bin = os.path.dirname(whoami)
    root = os.path.dirname(bin)

    bin = os.path.join(root, "bin")
    data = os.path.join(root, "data")
    www = os.path.join(root, "www")

    # Ensure config file

    js = os.path.join(www, "javascript")
    cfg = os.path.join(js, "mapzen.whosonfirst.config.js")

    if not os.path.exists(cfg):

        example = cfg + ".example"
        shutil.copy(example, cfg)

        if not os.path.exists(cfg):

            logging.error("failed to copy %s to %s!" % (example, cfg))
            sys.exit()

    # Figure out where binaries live

    if whatami == 'darwin':
        bin = os.path.join(bin, "osx")
    elif whatami == 'windows':
        bin = os.path.join(bin, "win32")
    elif whatami == 'linux' or whatami == 'linux2':	# what is linux2???
        bin = os.path.join(bin, "linux")        
    else:
        logging.error("unknown or unsupported platform: %s" % whatami)
        sys.exit()

    search_server = os.path.join(bin, "wof-airportcity-server")
    file_server = os.path.join(bin, "wof-fileserver")

    search_db = os.path.join(data, "airportcity")

    # Start the various background servers

    search_cmd = [search_server, "-cors", "-host", options.search_host, "-port", options.search_port, "-db", search_db]
    search_cmd.extend(args)

    www_cmd = [file_server, "-host", options.www_host, "-port", options.www_port, "-path", www]

    logging.debug(" ".join(search_cmd))
    logging.debug(" ".join(www_cmd))

    data = subprocess.Popen(search_cmd)
    www = subprocess.Popen(www_cmd)

    # Watch for ctrl-C

    def signal_handler(signal, frame):

        search.terminate()
        www.terminate()

        raise Exception, "all done"

    signal.signal(signal.SIGINT, signal_handler)

    # Spin spin sping...

    try:
        while True:
            time.sleep(.5)
    except Exception, e:
        pass

    logging.info("all done")
    sys.exit()
    

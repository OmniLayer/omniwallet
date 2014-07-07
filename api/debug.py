import os, sys, commands

data_dir_root = os.environ.get('DATADIR')
debug_level = int(os.environ.get('DEBUGLEVEL'))

#print the message to debug log if debug variable is set
#add  'from debug import *' to header
# call with  print_debug("my message",5)
# outputs to Datadir/debug.log  if the number above is > than the number in Datadir/debug.level

def print_debug( msg, verbose ):


  if int(verbose) > debug_level:
    commands.getoutput('echo '+msg+' >> '+data_dir_root+'/debug.log')
    return 1
   
  return 0


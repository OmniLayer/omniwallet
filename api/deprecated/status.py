#!/usr/bin/python
import sys, commands, json, getopt

def main(argv):
    try:
    	opts, args = getopt.getopt(argv,"ho:d:",["odir=","ddir="])
    except getopt.GetoptError:
    	print 'gen_status.py -o <omniwallet directory> -d <data directory>'
	sys.exit(2)
    for opt, arg in opts:
    	if opt == '-h':
            print 'gen_status.py -o <omniwallet directory> -d <data directory>'
            sys.exit()
    	elif opt in ("-o", "--odir"):
            APPDIR = arg
    	elif opt in ("-d", "--ddir"):
            DDIR = arg

    owlog=commands.getoutput('git --git-dir='+APPDIR+'/.git log --pretty=tformat:"%cd | %h | %H | %s" --date=short -n 12 --no-merges')
    mclog=commands.getoutput('git --git-dir='+APPDIR+'/node_modules/mastercoin-tools/.git log --pretty=tformat:"%cd | %h | %H | %s" --date=short -n 12 --no-merges')
    #lblock='Unknown'
    #lblock=commands.getoutput('cat '+DDIR+'/www/revision.json | cut -b 102-109')
    #time=commands.getoutput('TZ="America/Chicago" date')
    time=commands.getoutput('TZ="UTC" date')


    #STATUSSTREAM="""<h4>Omniwallet Change Log</h4>
    #             <table class="table"><tr>
    #		 <th>Date</th><th>Hash</th><th>Description</th></tr>\n"""

    STATUSSTREAM="""<div><div class="block-tx">
		 <span style=""><strong>Omniwallet Change Log</strong></span><br/>"""
		 
 
    for x in owlog.split('\n'):
        y=x.split('|', 3)
	#STATUSSTREAM+=('<tr><td>['+str(y[0])+']</td> <td>(<a href="http://github.com/mastercoin-MSC/omniwallet/commit/'+str(y[2].strip())+'\">'+str(y[1])+'</a>)</td> <td>'+str(y[3])+'</td></tr>\n')
	STATUSSTREAM+=('<span style="width:95%;float:left;padding-left:1%;padding-top:0px;font-size:85%;">['+str(y[0])+'] (<a href="http://github.com/mastercoin-MSC/omniwallet/commit/'+str(y[2].strip())+'\">'+str(y[1].strip())+'</a>) '+str(y[3])+'</span><br/>\n')

    STATUSSTREAM+=('</div>')

    STATUSSTREAM+="""<div class="block-tx">
                 <span style=""><strong>OMNI-Tools Change Log</strong></span><br/>"""

    for x in mclog.split('\n'):
        y=x.split('|', 3)
        #STATUSSTREAM+=('<tr><td>['+str(y[0])+']</td> <td>(<a href="http://github.com/mastercoin-MSC/omniwallet/commit/'+str(y[2].strip())+'\">'+str(y[1])+'</a>)</td> <td>'+str(y[3])+'</td></tr>\n')
        STATUSSTREAM+=('<span style="width:95%;float:left;padding-left:1%;padding-top:0px;font-size:85%;">['+str(y[0])+'] (<a href="http://github.com/mastercoin-MSC/mastercoin-tools/commit/'+str(y[2].strip())+'\">'+str(y[1].strip())+'</a>) '+str(y[3])+'</span><br/>\n')


    #STATUSSTREAM+=('</table>\n')
    STATUSSTREAM+=('</div></div>')

    STATUSSTREAM+="""<div class="block-tx" ng-controller="RevisionController" ng-init="getData()">
                 <span style=""><strong>Instance Statistics</strong></span><br/>"""

    STATUSSTREAM+=('\n<br/><span style="width:95%;float:left;padding-left:1%;padding-top:0px;font-size:85%;">This page last updated: '+time+'</span><br/>\n\n')
    STATUSSTREAM+=('\n<br/><span style="width:95%;float:left;padding-left:1%;padding-top:0px;font-size:85%;">Last Block Processed: {{rev.last_block}}</span><br/>\n')
    STATUSSTREAM+=('<ng-include src="\'stats.html\'">')

    STATUSSTREAM+=('</div>')
    #print STATUSSTREAM
    
    f=open(DDIR+'/www/status.html', 'w')
    f.write(STATUSSTREAM)
    f.close()


if __name__ == "__main__":
   main(sys.argv[1:])

import psycopg2, psycopg2.extras
import sys
import getpass

def sql_connect():
    global con
    USER=getpass.getuser()
    try:
      with open('/home/'+USER+'/.omni/sql.conf') as fp:
        DBPORT="5432"
        for line in fp:
          #print line
          if line.split('=')[0] == "sqluser":
            DBUSER=line.split('=')[1].strip()
          elif line.split('=')[0] == "sqlpassword":
            DBPASS=line.split('=')[1].strip()
          elif line.split('=')[0] == "sqlconnect":
            DBHOST=line.split('=')[1].strip()
          elif line.split('=')[0] == "sqlport":
            DBPORT=line.split('=')[1].strip()
          elif line.split('=')[0] == "sqldatabase":
            DBNAME=line.split('=')[1].strip()
    except IOError as e:
      response='{"error": "Unable to load sql config file. Please Notify Site Administrator"}'
      return response
    try:     
        con = psycopg2.connect(database=DBNAME, user=DBUSER, password=DBPASS, host=DBHOST, port=DBPORT)
        return con
    except psycopg2.DatabaseError, e:
        print 'Error %s' % e    
        sys.exit(1)

def dbInit():
    #Prime the DB Connection, it can be restarted in the select/execute statement if it gets closed prematurely. 
    global con
    global dbc

    try:
      if con.closed:
        con=sql_connect()
    except NameError:
      con=sql_connect()

    try:
      if dbc.closed:
        dbc=con.cursor(cursor_factory=psycopg2.extras.DictCursor)
    except NameError:
      dbc=con.cursor(cursor_factory=psycopg2.extras.DictCursor)

def dbSelect(statement, values=None):
    dbInit()
    try:
        dbc.execute(statement, values)
        ROWS = dbc.fetchall()
        dbc.close()
        con.commit()
        con.close()
        return ROWS
    except psycopg2.DatabaseError, e:
        print 'Error', e, 'Rollback returned: ', dbRollback()
        sys.exit(1)

def dbExecute(statement, values=None):
    dbInit()
    try:
        dbc.execute(statement, values)
    except psycopg2.DatabaseError, e:
        print 'Error', e, 'Rollback returned: ', dbRollback()
        sys.exit(1)

def dbCommit():
    try:
        con.commit()
        con.close()
    except psycopg2.DatabaseError, e:
        print 'Error', e, 'Rollback returned: ', dbRollback()
        sys.exit(1)

def dbRollback():
    if con:
       con.rollback()
       con.close()
       return 1
    else:
       return 0

def decimal_default(obj):
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError

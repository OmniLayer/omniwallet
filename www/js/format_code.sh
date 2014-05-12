
if [[ "$1" == "-h" || ! "$1" || ! "$2" ]]
then
echo -e "\nUSAGE: format_code.sh path-to-jsfmt extension-to-format \nEXAMPLE: /bin/sh format_code.sh /usr/local/jsfmt js";
echo -e "HELP: This formats all the code in the current directory";
else
mkdir -p unformatted_code
touch temp
for f in *; do
  TYP=(${f//./ })
  TEST_JSTYPE=$( test $( test "$2" == "${TYP[1]}"; echo $?); echo $?) 
  TEST_NEWTYPE=$(test $(test "$2" = "${TYP[1]}";echo $?) -eq $(test "${TYP[2]}" = "new";echo $?); echo $?)
  if [[ $TEST_JSTYPE -ne $TEST_NEWTYPE ]]
  then
    echo Running case "$f"
    JSFMT_RUN=$($1 -f=true $f 2> temp 1> $f.new; cat temp | grep Error > /dev/null; echo $?)
    echo -n $(cat temp)
    if [[ $JSFMT_RUN -eq 1 ]]
    then
      JSFMT_RUN_REDUX=$($1 -f=true $f.new 1> /dev/null 2> temp; cat temp | grep Error > /dev/null; echo $?)
      echo -n $(cat temp)
      if [[ $JSFMT_RUN_REDUX -eq 1 ]]
      then
        echo -n ''

        mv $f unformatted_code/$f.old.$(date +%s)
        mv $f.new $f
        rm $f.new
        git add $f
        git commit -m "Format commit for $f , no errors found."
      else
        echo -e "\nERROR: Code contains formatting bugs, please fix and commit manually, or revert and contact a upstream developer"
      fi
    else
      echo -e "\nERROR: Code contains bugs, not formatting and committing"
    fi
    rm temp -f
  fi
done
fi

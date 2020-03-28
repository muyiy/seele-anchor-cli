dirname='testchain'

# initiate a project
anc init -n $dirname
cp -fr ./test/conf.json ./.subchain/$dirname

# deploy
cd .subchain/$dirname/
anc show

#

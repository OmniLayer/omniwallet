import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/model/backup_wallet.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/main_page.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class BackupWalletWordsOrder extends StatefulWidget {
  @override
  _BackupWalletWordsOrderState createState() => _BackupWalletWordsOrderState();
}

class _BackupWalletWordsOrderState extends State<BackupWalletWordsOrder> {
  List<WordInfo> words=null;
  MainStateModel stateModel = null;

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context) ;
    if(words==null){
      words = stateModel.randomSortMnemonicPhrases;
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).backup_words_order_title),
      ),
      backgroundColor: AppCustomColor.themeBackgroudColor,
      body: Builder(builder: (BuildContext context) { return pageCentent(context);}),
    );
  }

  List<WordInfo> resultWords=[];
  List<Widget> resultWordBulid(){
    List<Widget> results= [];
    for(var item in this.resultWords){
      results.add(
          InkWell(
            onTap: (){
              setState(() {
                resultWords.remove(item);
                item.visible=true;
                checkFinish();
              });
            },
            child: Container(
              decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(5)
              ),
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(item.content,style: TextStyle(color: AppCustomColor.themeBackgroudColor),),
              )
            ),
          )
      );
    }
    return results;
  }


  Function checkFinish(){
    checkResult();
    if(showErrorTips==false&&this.resultWords.length==this.words.length){
      return (){
        Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => MainPage()),
                (route) => route == null
        );
      };
    }
    return null;
  }

  bool showErrorTips = false;
  void checkResult(){
    showErrorTips =false;
    for(var i=0;i<this.resultWords.length;i++){
      var node = this.resultWords[i];
      if(node.seqNum!=i){
        showErrorTips = true;
        break;
      }
    }
  }

  Widget pageCentent(BuildContext context){
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Container(
              margin: EdgeInsets.only(left: 20,right: 20,top: 30,bottom: 40),
              child: Text(WalletLocalizations.of(context).backup_words_order_content,style: TextStyle(fontSize: 15,color: Colors.grey),)
          ),
          AnimatedOpacity(
            duration: Duration(milliseconds: 0),
            opacity: showErrorTips?1:0,
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(WalletLocalizations.of(context).backup_words_order_error,style: TextStyle(color: Colors.red),),
            ),
          ),
          Container(
            margin: EdgeInsets.only(bottom: 40),
            decoration: BoxDecoration(
              color: Color(0xFFF8F8F8),
              borderRadius: BorderRadius.circular(5)
            ),
            width: MediaQuery.of(context).size.width,
            height: 150,
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 6,
                    runSpacing: 6,
                    children: resultWordBulid()),
              )
          ),


          createWords(),
          Expanded(child: Container()),
          Padding(
            padding: const EdgeInsets.only(bottom: 20,left: 20,right: 20),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: RaisedButton(
                    color: AppCustomColor.btnConfirm,
                    onPressed: checkFinish(),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Text(WalletLocalizations.of(context).backup_words_order_finish,style: TextStyle(color: Colors.white),),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget createWords(){
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Wrap(
        alignment: WrapAlignment.center,
        spacing: 5,
        runSpacing: 5,
        children: wrapChildren(),
      ),
    );
  }

  Function onClickSelctableWord(int index){
    if(this.words[index].visible){
      return (){
        setState(() {
          this.words[index].visible=false;
          this.resultWords.add(this.words[index]);
          checkFinish();
        });
      };
    }else{
      return null;
    }
  }

  List<Widget> wrapChildren(){
    List<Widget> list = [];
    for(int i=0;i<this.words.length;i++){
      list.add(
          InkWell(
            onTap: onClickSelctableWord(i),
            child: Container(
                decoration: BoxDecoration(
                    border: Border.all(color: this.words[i].visible?Colors.grey:Colors.grey[200]),
                    borderRadius: BorderRadius.circular(4)
                ),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: AnimatedOpacity(
                    duration: Duration(milliseconds: 0),
                    opacity: this.words[i].visible?1:0,
                    child: Text(
                      '${this.words[i].content}',
                      style: TextStyle(color: AppCustomColor.themeFrontColor),
                    ),
                  ),
                )
            ),
          )
      );
    }
    print(list.length);
    return list;
  }
}

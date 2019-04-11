import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/model/backup_wallet.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/backupwallet/backup_wallet_word_order.dart';
import 'package:wallet_app/view_model/state_lib.dart';


class BackupWalletWords extends StatefulWidget {
  static String  tag = 'BackupWalletWords';
  @override
  _BackupWalletWordsState createState() => _BackupWalletWordsState();
}

class _BackupWalletWordsState extends State<BackupWalletWords> {

  List<WordInfo> words=null;
  MainStateModel stateModel = null;

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context) ;
    words = stateModel.mnemonicPhrases;
    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).backup_words_title),
      ),
      backgroundColor: AppCustomColor.themeBackgroudColor,
      body: Builder(builder: (BuildContext context) { return pageCentent(context);}),
    );
  }

  showTipsBar(){
    Scaffold.of(context).showSnackBar(SnackBar(content: Text('success')));
  }

  List<Widget> wrapChildren(){
    List<Widget> list = [];
    for(int i=0;i<this.words.length;i++){
      list.add(
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(4)
            ),
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: RichText(
                  text: TextSpan(
                    text: '${i+1} ',
                    style: TextStyle(color: Colors.grey),
                    children: <TextSpan>[
                      TextSpan(
                        text: '${this.words[i].content}',
                        style: TextStyle(color: AppCustomColor.themeFrontColor),
                      )
                    ]
                  ),
                ),
              )
          )
      );
    }
    print(list.length);
    return list;
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

  Widget pageCentent(BuildContext context){
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Container(
            margin: EdgeInsets.only(left: 20,right: 20,top: 30,bottom: 40),
            child: Text(WalletLocalizations.of(context).backup_words_content,style: TextStyle(fontSize: 15,color: Colors.grey),)
          ),
          createWords(),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: FlatButton(
                onPressed: (){
                  var str = stateModel.mnemonicPhraseString;
                  Tools.copyToClipboard(str);
                  print(str);
                  Scaffold.of(context).showSnackBar(SnackBar(content: Text('success'),duration: Duration(seconds: 2),));
                },
                child: Text(WalletLocalizations.of(context).common_btn_copy,style: TextStyle(color: Colors.blue,fontSize: 16),)
            ),
          ),
          Expanded(child: Container()),
          Container(
            margin: EdgeInsets.only(top: 20,left: 20,right: 20,bottom: 30),
            decoration: BoxDecoration(
              color: Color(0xffE4ECFF),
              borderRadius: BorderRadius.circular(4)
            ),
            child: Column(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Icon(Icons.error,color: Colors.blue,size: 40,),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 10,right: 10,top: 2,bottom: 20),
                  child: Text(WalletLocalizations.of(context).backup_words_warn,style: TextStyle(color: Colors.blue,fontSize: 16),),
                )
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(bottom: 20,left: 20,right: 20),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: RaisedButton(
                    color: AppCustomColor.btnConfirm,
                    onPressed: (){
                      Navigator.push(context, MaterialPageRoute(builder: (BuildContext context) => BackupWalletWordsOrder()));
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Text(WalletLocalizations.of(context).backup_words_next,style: TextStyle(color: Colors.white),),
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
}

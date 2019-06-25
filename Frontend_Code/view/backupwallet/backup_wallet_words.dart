import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/model/backup_wallet.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/backupwallet/backup_wallet_word_order.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
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

    if(stateModel==null){
      stateModel = MainStateModel().of(context) ;
    }
    return ScopedModelDescendant<MainStateModel>(
      builder: (context, child, model) {
        print("BackupWalletWords");
        words = model.mnemonicPhrases;
        return Scaffold(
          backgroundColor: AppCustomColor.themeBackgroudColor,
          appBar: AppBar(
            title: Text(WalletLocalizations.of(context).backup_words_title),
          ),

          // update by Cheng
          body: SafeArea(
            child: SingleChildScrollView(
              child: pageCentent(context),
            ),
          ),
        );
      }
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
                  Tools.showToast('copy success');
                },
                child: Text(WalletLocalizations.of(context).common_btn_copy,style: TextStyle(color: Colors.blue,fontSize: 16),)
            ),
          ),

          // update by Cheng
          // Expanded(child: Container()),

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
            child:CustomRaiseButton(
              context: context,
              hasRow: false,
              title: WalletLocalizations.of(context).backup_words_next,
              titleColor: Colors.white,
              color: AppCustomColor.btnConfirm,
              callback: () {
                Navigator.push(context, MaterialPageRoute(builder: (BuildContext context) => BackupWalletWordsOrder()));
              },
            )
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

  List<Widget> wrapChildren(){
    if(this.words==null) return [];
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
    return list;
  }

  showTipsBar(){
    Scaffold.of(context).showSnackBar(SnackBar(content: Text('success')));
  }
}

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/model/backup_wallet.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/main_page.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class BackupWalletWordsOrder extends StatefulWidget {
  @override
  _BackupWalletWordsOrderState createState() => _BackupWalletWordsOrderState();
}

class _BackupWalletWordsOrderState extends State<BackupWalletWordsOrder> {
  List<WordInfo> words=null;
  MainStateModel stateModel = null;

  int backParentId = null;

  @override
  void initState() {
    super.initState();
    Future<SharedPreferences> prefs = SharedPreferences.getInstance();
    prefs.then((share){
      this.backParentId = share.getInt(KeyConfig.backParentId);
    });
  }

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context) ;
    if(words==null){
      words = stateModel.randomSortMnemonicPhrases;
    }
    return Scaffold(
      backgroundColor: AppCustomColor.themeBackgroudColor,

      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).backup_words_order_title),
      ),
      
      // body: Builder(builder: (BuildContext context) { return pageCentent(context);}),

      // update by Cheng
      body: SafeArea(
        child: pageCentent(context)
      ),
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
                child: Text(item.content,style: TextStyle(color: AppCustomColor.themeFrontColor),),
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
        Future<SharedPreferences> prefs = SharedPreferences.getInstance();
        prefs.then((share){
          share.remove(KeyConfig.backParentId);

          // User have finished to back up mnimonic.
          share.setBool(KeyConfig.is_backup, true);
        });

        if(this.backParentId !=null&&this.backParentId==1){
          Navigator.pop(context);
          Navigator.pop(context);
          Navigator.pop(context);
        }else{
          Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (context) => MainPage()),
                  (route) => route == null
          );
        }
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
          Expanded(child: Container()),
          Container(
            // update by Cheng
            margin: EdgeInsets.only(left: 30, right: 30, top: 10, bottom: 20),
            child: Text(
              WalletLocalizations.of(context).backup_words_order_content,
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey,
              ),
            ),
          ),

          AnimatedOpacity(
            duration: Duration(milliseconds: 0),
            opacity: showErrorTips?1:0,
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                WalletLocalizations.of(context).backup_words_order_error,
                style: TextStyle(color: Colors.red),
              ),
            ),
          ),

          Container(
            margin: EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: Color(0xFFF8F8F8),
              borderRadius: BorderRadius.circular(5)
            ),
            width: MediaQuery.of(context).size.width,
            height: 140,
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
            // update by Cheng
            padding: EdgeInsets.only(top: 30, bottom: 20, left: 30, right: 30),
            child:CustomRaiseButton(
              context: context,
              hasRow: false,
              title: WalletLocalizations.of(context).backup_words_order_finish,
              titleColor: Colors.white,
              color: AppCustomColor.btnConfirm,
              callback: checkFinish(),
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

  Function onClickSelectableWord(int index){
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
            onTap: onClickSelectableWord(i),
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

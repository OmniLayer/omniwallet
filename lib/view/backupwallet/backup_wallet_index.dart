import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/backupwallet/backup_wallet_words.dart';
import 'package:wallet_app/view/main_view/main_page.dart';

class BackupWalletIndex extends StatelessWidget {
  Object param;
  BackupWalletIndex({Key key,this.param}):super(key:key);

  static String tag = "BackupWallet";
  void onTouchBtn(BuildContext context){
    Navigator.pushNamed(context, BackupWalletWords.tag);
  }

  @override
  Widget build(BuildContext context) {
    Widget pageContent(){
      return Column(
        mainAxisSize: MainAxisSize.max,
        children: <Widget>[
          Container(
            margin: EdgeInsets.only(top: 30,left: 20,right: 20),
            child:
                Image.asset("assets/LunarX_Logo.jpg",scale: 0.5,),
          ),
          Expanded(
              child: Align(
                  alignment: Alignment(0, -0.5),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40.0),
                    child: Column(
                      children: <Widget>[
                        Padding(
                          padding: const EdgeInsets.only(top:40,bottom: 20),
                          child: Text(
                              WalletLocalizations.of(context).backup_index_tips_title,
                            style: TextStyle(fontSize: 20,fontWeight: FontWeight.bold),
                          ),
                        ),
                        Text(
                          WalletLocalizations.of(context).backup_index_tips,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.grey,
//                        letterSpacing: 2,
                            fontWeight: FontWeight.bold

//                        fontWeight: FontWeight.normal
                          ),
                        ),
                      ],
                    ),
                  ),
              )
          ),
          Padding(
            padding: const EdgeInsets.only(bottom: 20 ),
            child: Row(
              mainAxisSize: MainAxisSize.max,
              children: <Widget>[
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20 ),
                    child: RaisedButton(
                      color: AppCustomColor.btnConfirm,
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Text(
                              WalletLocalizations.of(context).backup_index_btn,
                            style: TextStyle(color: Colors.white),
                              ),
                      onPressed: (){
                            this.onTouchBtn(context);
                          }
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).backup_index_title),
        actions: this.getActions(context),
      ),
      backgroundColor: AppCustomColor.themeBackgroudColor,
      body: pageContent(),
    );
  }

  List<Widget> getActions(BuildContext context){
    if(this.param!=null&&this.param==1){
      List<Widget> list = [];
      list.add(FlatButton(
        onPressed: (){
          Navigator.of(context).pushNamedAndRemoveUntil(MainPage.tag,(route) => route == null);
        },
        child: Text(WalletLocalizations.of(context).backup_index_laterbackup,style: TextStyle(color: AppCustomColor.btnConfirm),),
      ));
      return list;
    }
    return null;
  }

}

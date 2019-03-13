import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/main.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/view/backupwallet/backup_wallet_words.dart';
import 'package:wallet_app/view/main_view/main_page.dart';

class BackupWalletIndex extends StatelessWidget {



  Widget buildDialogWindow(BuildContext context){
    return SimpleDialog(
      contentPadding: const EdgeInsets.all(0.0),
      children: <Widget>[
        Center(
          child:Column(
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Icon(
                  Icons.camera_enhance,
                  size: 60,
                ),

              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 5),
                child: Text(
                    WalletLocalizations.of(context).backup_index_prompt_title,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 12,right: 12,top: 10,bottom: 20),
                child: Text(WalletLocalizations.of(context).backup_index_prompt_tips,textAlign: TextAlign.center,),
              ),
              InkWell(
                radius: MediaQuery.of(context).size.width*0.5,
                splashColor:Colors.blue,
                onTap: (){
                  Navigator.of(context).pop();
                  Navigator.push(context, MaterialPageRoute(builder: (BuildContext context) => BackupWalletWords()));
                },
                child: Container(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 10,bottom: 10),
                    child: Text(WalletLocalizations.of(context).backup_index_prompt_btn,textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 20,
                        color: Colors.white
                    ),),
                  ),
                  width: double.infinity,
                  decoration: BoxDecoration(color: Colors.red),
                ),
              ),
            ],
          )
        )
      ],
    );
  }
  void onTouchBtn(BuildContext context){
    showDialog(
      context: context,
      builder:buildDialogWindow,
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget pageContent(){
      return Column(
        children: <Widget>[
          Container(
            margin: EdgeInsets.only(top: 30,left: 20,right: 20),
            child: CachedNetworkImage(
              placeholder: (context, url) => new CircularProgressIndicator(),
              errorWidget: (context, url, error) => new Icon(Icons.error),
              imageUrl: 'http://www.pptbz.com/pptpic/UploadFiles_6909/201203/2012031220134655.jpg',
            ),
          ),
          Expanded(
              child: Align(
                  alignment: Alignment(0, -0.5),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40.0),
                    child: Text(
                      WalletLocalizations.of(context).backup_index_tips,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.red[400],
                        letterSpacing: 2,
                        fontWeight: FontWeight.normal
                      ),
                    ),
                  ),
              )
          ),
          Container(
            margin: EdgeInsets.only(bottom: 80),
            child: RaisedButton(
              child: Text(WalletLocalizations.of(context).backup_index_btn),
                onPressed: (){
                  this.onTouchBtn(context);
                }
            ),
          ),
          Container(
            margin: EdgeInsets.only(bottom: 80),
            child: RaisedButton(
              child: Text('切换语言'),
                onPressed: (){
                  this.onTouchLang(context);
                }
            ),
          ),
        ],
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).backup_index_title),
        actions: <Widget>[
          FlatButton(
            onPressed: (){
              Navigator.of(context).pop();
              Navigator.push(context, MaterialPageRoute(builder: (BuildContext context) => MainPage()));
            },
            child: Text(WalletLocalizations.of(context).backup_index_laterbackup),
          )
        ],
      ),
      body: Scaffold(
        body: pageContent(),
      ),
    );
  }
  void onTouchLang(BuildContext context) async  {
//    SharedPreferences prefs = await SharedPreferences.getInstance();
//    bool flag = prefs.getBool('langSwitch');
    Locale locale =  Localizations.localeOf(context);
    if(locale.languageCode=='zh'){
      locale = Locale('en',"US");
    }else {
      locale = Locale('zh',"CH");
    }
    MyApp.setLocale(context,locale);
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/home/send_page.dart';
import 'package:wallet_app/view_model/main_model.dart';
import 'package:qr_flutter/qr_flutter.dart';

//收款页面
class ReceivePage extends StatefulWidget {
  @override
  _ReceivePageState createState() => _ReceivePageState();
}

class _ReceivePageState extends State<ReceivePage> {
  MainStateModel stateModel = null;
  WalletInfo walletInfo;
  AccountInfo accountInfo;

  final key = new GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context);
    walletInfo = stateModel.currWalletInfo;
    accountInfo = stateModel.currAccountInfo;
    return Scaffold(
      key: this.key,
      backgroundColor: AppCustomColor.themeBackgroudColor,
      appBar: AppBar(title: Text(accountInfo.name+WalletLocalizations.of(context).wallet_detail_content_receive),),
      body: this.body()
    );
  }

  Widget body(){
    return Column(
      children: <Widget>[
        Container(height: 100,),
        Container(
          margin: EdgeInsets.only(bottom: 10),
          child: QrImage(
            data: walletInfo.address,
            size: 200.0,
            foregroundColor: Colors.blue,
          ),
        ),
        Container(
            margin: EdgeInsets.only(top: 10,bottom: 60),
            child: Text(walletInfo.address)
        ),
        Container(
          margin: EdgeInsets.only(top: 2,bottom: 6,left: 10,right: 10),
          child:Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: <Widget>[
              Expanded(
                child: RaisedButton(
                  onPressed: (){
                    Clipboard.setData(new ClipboardData(text: walletInfo.address));
                    this.showTips(WalletLocalizations.of(context).wallet_receive_page_tips_copy);
                  },
                  child: Text(WalletLocalizations.of(context).wallet_receive_page_copy,style: TextStyle(fontSize: 18,color: Colors.blue),),
                  color: AppCustomColor.btnCancel,
                  padding: EdgeInsets.symmetric(vertical:12),
                ),
              ),
              SizedBox(width: 30,),
              Expanded(
                child: RaisedButton(
                  onPressed: (){
                    print('share');
                    this.showTips(WalletLocalizations.of(context).wallet_receive_page_tips_share);
                  },
                  child: Text(WalletLocalizations.of(context).wallet_receive_page_share,style: TextStyle(fontSize: 18, color: Colors.white)),
                  padding: EdgeInsets.symmetric(vertical:12),
                  color: AppCustomColor.btnConfirm,
                ),
              ),
            ],
          ),
        )
      ],
    );
  }

  showTips(String content){
    this.key.currentState.hideCurrentSnackBar();
    this.key.currentState.showSnackBar(
        SnackBar(
          content: Text(content),
          duration: Duration(seconds: 1,milliseconds: 200),
        ),
    );
  }
}
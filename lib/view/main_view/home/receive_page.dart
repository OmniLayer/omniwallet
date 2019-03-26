import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:wallet_app/model/wallet_info.dart';
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
      appBar: AppBar(title: Text(accountInfo.name+"收款"),),
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
          ),
        ),
        Container(
            margin: EdgeInsets.only(top: 10,bottom: 60),
            child: Text(walletInfo.address)
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: <Widget>[
            RaisedButton(
              onPressed: (){
                Clipboard.setData(new ClipboardData(text: walletInfo.address));
                this.showTips('复制地址成功');
              },
              child: Text('复制地址'),
            ),
            RaisedButton(
              onPressed: (){
                print('share');
                this.showTips('分享地址');
              },
              child: Text('分享地址'),
            ),
          ],
        ),
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
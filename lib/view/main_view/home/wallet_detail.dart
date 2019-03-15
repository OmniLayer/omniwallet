
import 'package:flutter/material.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/view_model/main_model.dart';

class WalletDetail extends StatefulWidget {
  static String  rounte = "WalletDetail";

  @override
  _WalletDetailState createState() => _WalletDetailState();
}

class _WalletDetailState extends State<WalletDetail> {

  MainStateModel stateModel = null;
  WalletInfo walletInfo;
  AccountInfo accountInfo;

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context);
    walletInfo = stateModel.currWalletInfo;
    accountInfo = stateModel.currAccountInfo;
    return Scaffold(
      appBar: AppBar(
        title: Text(walletInfo.name+" "+accountInfo.name),
      ),
      body: Text(accountInfo.name),
    );
  }
}

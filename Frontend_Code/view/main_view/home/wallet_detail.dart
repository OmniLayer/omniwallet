import 'package:flutter/material.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/home/wallet_detail_content.dart';
import 'package:wallet_app/view_model/main_model.dart';

import 'package:wallet_app/view_model/state_lib.dart';

/**
 * wallet detial page
 */
class WalletDetail extends StatefulWidget {
  static String  tag = "WalletDetail";

  @override
  _WalletDetailState createState() => _WalletDetailState();
}

class _WalletDetailState extends State<WalletDetail> {

  MainStateModel stateModel = null;
  WalletInfo walletInfo;
  AccountInfo accountInfo;

  @override void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context);
    accountInfo = stateModel.currAccountInfo;
    return Stack(
      children: <Widget>[
        Container(color: AppCustomColor.themeBackgroudColor,),
        Image.asset(Tools.imagePath('title_bg1'),fit: BoxFit.cover,height: 240,width: MediaQuery.of(context).size.width,),
        Scaffold(
          backgroundColor: Colors.transparent,
          appBar: AppBar(
            brightness: Brightness.dark,
            iconTheme: IconThemeData(color: Colors.white),
            backgroundColor: Colors.transparent,
            title: Text(accountInfo.name,style: TextStyle(color: Colors.white),),
          ),
          body: WalletDetailContent(),
        ),
      ],
    );
  }
}
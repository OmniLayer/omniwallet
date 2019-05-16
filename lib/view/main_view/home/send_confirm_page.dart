import 'dart:async';

import 'package:auto_size_text/auto_size_text.dart';
import 'package:bitcoin_flutter/bitcoin_flutter.dart';
import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/main.dart';
import 'package:wallet_app/model/global_model.dart';
import 'package:wallet_app/model/mnemonic_phrase_model.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/tools/net_config.dart';
import 'package:wallet_app/view/main_view/unlock.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
import 'package:wallet_app/view_model/main_model.dart';


class SendConfirm extends StatelessWidget {
  static String tag = "Send Confirm";
  MainStateModel stateModel = null;
  AccountInfo accountInfo = null;
  WalletInfo walletInfo = null;
  SendInfo _sendInfo ;
  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context);
    this._sendInfo = stateModel.sendInfo;
    walletInfo =  stateModel.currWalletInfo;
    accountInfo = stateModel.currAccountInfo;

    return Scaffold(
      backgroundColor: AppCustomColor.themeBackgroudColor,
      appBar: AppBar(
        title: Text(SendConfirm.tag),
      ),
      body: this.body(context),
    );
  }
  Widget body(BuildContext context){
    return Container(
      margin: EdgeInsets.only(top: 10,left: 20,right: 20),
      child: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: Row(
              children: <Widget>[
                AutoSizeText(
                  WalletLocalizations.of(context).wallet_send_page_to,
                  style: TextStyle(color: Colors.grey),
                  minFontSize: 9,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Expanded(child: Container()),
                Text('${_sendInfo.toAddress==null?'':_sendInfo.toAddress}',style: TextStyle(fontWeight: FontWeight.w500),)
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 15),
            child: Row(
              children: <Widget>[
                Text(
                  WalletLocalizations.of(context).wallet_send_page_title_amount,
                  style: TextStyle(color: Colors.grey),
                ),
                Expanded(child: Container()),
                Text("${_sendInfo.amount==null?0:_sendInfo.amount} "+accountInfo.name,style: TextStyle(fontWeight: FontWeight.w500),)
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 15),
            child: Row(
              children: <Widget>[
                Text(
                  WalletLocalizations.of(context).wallet_send_page_title_minerFee_input_title,
                  style: TextStyle(color: Colors.grey),
                ),
                Expanded(child: Container()),
                Text("${_sendInfo.minerFee==null?0:_sendInfo.minerFee} BTC",style: TextStyle(fontWeight: FontWeight.w500),)
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 15),
            child: Row(
              children: <Widget>[
                Text(
                  WalletLocalizations.of(context).wallet_send_page_title_note,
                  style: TextStyle(color: Colors.grey),
                ),
                Expanded(child: Container()),
                Text("${_sendInfo.note==null?'':_sendInfo.note}",style: TextStyle(fontWeight: FontWeight.w500),)
              ],
            ),
          ),
          Expanded(child: Container()),
          Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: CustomRaiseButton(
              hasRow: false,
              context: context,
              callback: (){
                routeObserver.navigator.push(
                  MaterialPageRoute(
                      builder: (BuildContext context) {
                        return Unlock(parentID: 12,callback: (){
                          Navigator.of(context).pop();
                          this.transfer(context);
                        },);
                      }
                  ),
                );
              },
              title: WalletLocalizations.of(context).common_btn_confirm,
              titleColor: Colors.white,
              color: AppCustomColor.btnConfirm,
            ),
          ),
        ],
      ),
    );
  }
  transfer(BuildContext context){
    print(accountInfo.propertyId);
    HDWallet wallet = MnemonicPhrase.getInstance().createAddress(GlobalInfo.userInfo.mnemonic,index: walletInfo.addressIndex);
    //btc send
    if(accountInfo.propertyId==0){
      Future future = NetConfig.post(
         context,
         NetConfig.btcSend, {
          'fromBitCoinAddress':wallet.address,
          'privkey':Tools.encryptAes(wallet.wif),
          'toBitCoinAddress':_sendInfo.toAddress,
          'amount':_sendInfo.amount.toString(),
          'minerFee':_sendInfo.minerFee.toString(),
      });
      future.then((data){
        print(data);
        if(data!=null){
          Navigator.of(context).pop();
          Navigator.of(context).pop();
        }
      });
    }else{
      Future future = NetConfig.post(
          context,
          NetConfig.omniRawTransaction, {
            'propertyId':accountInfo.propertyId.toString(),
            'fromBitCoinAddress':wallet.address,
            'privkey':Tools.encryptAes(wallet.wif),
            'toBitCoinAddress':_sendInfo.toAddress,
            'amount':_sendInfo.amount.toString(),
            'minerFee':_sendInfo.minerFee.toString(),
      });
      future.then((data){
        if(data!=null){
          Navigator.of(context).pop();
          Navigator.of(context).pop();
        }
      });
    }
  }
}

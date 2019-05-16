import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:wallet_app/model/global_model.dart';
import 'package:wallet_app/tools/net_config.dart';

class UserInfo{
  String userId;
  String _mnemonic;
  Uint8List _mnemonicSeed;
  String pinCode;
  String loginToken;
  String faceUrl;
  String nickname;
  UserInfo({
    this.userId,
    this.faceUrl,
    this.nickname
  });

  String get mnemonic{
    return this._mnemonic;
  }

  void set mnemonic(String val) {
    this._mnemonic=val;
  }
  Uint8List get mnemonicSeed{
    return this._mnemonicSeed;
  }

  void set mnemonicSeed(Uint8List val) {
    this._mnemonicSeed=val;
  }

  void init(BuildContext context,Function callback) async{
    if(GlobalInfo.bip39Seed==null){
      GlobalInfo.initBipSeed(this._mnemonic,callback: callback);
    }

    Future future = NetConfig.get(context,NetConfig.btcAndUsdtExchangeRate);
    future.then((data){
      if(data!=null){
        AssetToUSDRateInfo info = AssetToUSDRateInfo();
        info.btcs[0] = data[0]['rate'];
        info.btcs[1] = data[1]['rate'];
        GlobalInfo.usdRateInfo = info;
      }
    });
    Future futureAsset = NetConfig.get(context,NetConfig.getDefautAssetList);
    futureAsset.then((data){
      if(data!=null){
        List list = data;
        GlobalInfo.defaultAssetInfoes.clear();
        for(int i=0;i<list.length;i++){
          DefaultAssetInfo info = DefaultAssetInfo();
          info.name = list[i]['assetName'];
          info.url = list[i]['imageUrl'];
          info.assetId = list[i]['assetId'];
          GlobalInfo.defaultAssetInfoes.add(info);
        }
      }
    });
  }
}
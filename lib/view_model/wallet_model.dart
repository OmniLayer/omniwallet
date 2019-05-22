import 'dart:async';

import 'package:bitcoin_flutter/bitcoin_flutter.dart';
import 'package:flutter/material.dart';
import 'package:scoped_model/scoped_model.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class WalletModel extends Model{

  List<WalletInfo> _walletInfoes;

  WalletInfo _currWalletInfo;
  set currWalletInfo(WalletInfo info){
    this._currWalletInfo = info;
  }
  WalletInfo get currWalletInfo{
    return _currWalletInfo;
  }

  AccountInfo _currAccountInfo;
  set currAccountInfo(AccountInfo info){
    this._currAccountInfo = info;
    notifyListeners();
  }
  AccountInfo get currAccountInfo{
    return _currAccountInfo;
  }


  TradeInfo _currTradeInfo;
  set currTradeInfo(TradeInfo info){
    this._currTradeInfo = info;
    notifyListeners();
  }
  TradeInfo get currTradeInfo{
    return _currTradeInfo;
  }

  setWalletInfoes(List<WalletInfo> info,{bool rightNow = false}){
    if(rightNow){
      this._walletInfoes = info;
    }else{
      if(info==null&&_loadLastTime!=null){
        var now = DateTime.now();
        var duration = now.difference(_loadLastTime);
        if(duration.inSeconds>15){
          this._walletInfoes = null;
        }
      }else{
        this._walletInfoes = info;
      }
    }
  }

  DateTime _loadLastTime  = null;
  List<WalletInfo> getWalletInfoes(BuildContext context) {
    if(this._walletInfoes==null){
      Future future = NetConfig.get(context,NetConfig.addressList,timeOut: 10);
      future.then((data){
        if(NetConfig.checkData(data)){
          this._walletInfoes = [];
          _loadLastTime = DateTime.now();

          double btcRate = GlobalInfo.usdRateInfo.btcs[0];
          if(GlobalInfo.currencyUnit==KeyConfig.usd){
            btcRate = GlobalInfo.usdRateInfo.btcs[0];
          }else{
            btcRate = GlobalInfo.usdRateInfo.btcs[1];
          }
          this._walletInfoes = [];
          List list = data['data'] ;
          for(int i=0;i<list.length;i++){
            var node = list[i];
            List assets = node['assets'];
            num totalMoney = 0;
            List<AccountInfo> accountInfo = [];
            for(int j=0;j<assets.length;j++){
              var asset = assets[j];
              double amount = double.parse(asset['balance'].toString());

              double money = amount* btcRate;
              var  propertyId = asset['propertyid'];
              if(propertyId>0){
                money = 0;
              }
              accountInfo.add(AccountInfo(
                  name: asset['name'],
                  amount:amount,
                  iconUrl: _configAssetLogoUrl(propertyId),
                  legalTender:money,
                  jsonData: asset,
                  visible: asset['visible'],
                  propertyId: propertyId
              ));
              totalMoney+=money;
            }
            totalMoney = totalMoney;
            WalletInfo info = WalletInfo(
                name: node['addressName'],
                address:node['address'],
                addressIndex: node['addressIndex'],
                visible: node['visible'],
                totalLegalTender: totalMoney,
                note: '',
                accountInfoes: accountInfo);
            _walletInfoes.add(info);
          }
          if(_walletInfoes.length==0){
            int addressIndex = 0;
            String defaultName = 'name0';
            HDWallet wallet = MnemonicPhrase.getInstance().createAddress(GlobalInfo.userInfo.mnemonic,index: addressIndex);
            WalletInfo info = WalletInfo(
                name: defaultName,
                address: wallet.address,
                addressIndex: addressIndex,
                visible: true,
                totalLegalTender: 0,
                note: '',
                accountInfoes: []
            );
            Future result = NetConfig.post(context,NetConfig.createAddress, {'address':wallet.address,'addressName':defaultName,'addressIndex':addressIndex.toString()});
            result.then((data){
              if(NetConfig.checkData(data)){
                this.addWalletInfo(info);
                notifyListeners();
              }
            });
          }else{
            notifyListeners();
          }
        }else {
          this._walletInfoes = [];
          notifyListeners();
        }
      });
    }
    return this._walletInfoes;
  }

  addWalletInfo(WalletInfo info) {
    List<AccountInfo> accountInfo = [];

    for(int i=0;i<GlobalInfo.defaultAssetInfoes.length;i++){
      var info = GlobalInfo.defaultAssetInfoes[i];
      accountInfo.add(AccountInfo(
          name: info.name,
          amount:0,
          iconUrl: _configAssetLogoUrl(info.assetId),
          legalTender:0,
          visible: true,
          propertyId: info.assetId
      ));
    }
    info.accountInfoes = accountInfo;
    _walletInfoes.insert(0,info);
    notifyListeners();
  }

  List<TradeInfo> tradeInfoes = null;
  List<TradeInfo> getTradeInfoes(BuildContext context, String address,{int propertyId=0}){
    print('getTradeInfoes1111');
    if(tradeInfoes==null){
      String url  = NetConfig.getTransactionsByAddress+'?address='+address;
      if(propertyId>0){
        url  = NetConfig.getOmniTransactionsByAddress+'?address='+address+'&assetId='+propertyId.toString();
      }

      Future future = NetConfig.get(context,url);
      future.then((data){
        if(NetConfig.checkData(data)){
          tradeInfoes = [];
          List dataList = data['list'];
          for(int i=0;i<dataList.length;i++){
            var currData = dataList[i];
            bool isSend = currData['isSend'];
            double txValue = 0;
            if(propertyId==0){
               txValue = currData['txValue'];
            }else{
                txValue = double.parse(currData['txValue']);
             }

            int time = currData['time']*1000;
            int confirmAmount = currData['confirmAmount'];
            if(isSend){
              txValue = 0-txValue;
            }
            tradeInfoes.add(
                TradeInfo(
                    amount: txValue,
                    note: '',
                    tradeType: isSend,
                    objAddress: currData['targetAddress'],
                    tradeDate:DateTime.fromMillisecondsSinceEpoch(time),
                    state: confirmAmount>0?1:0,
                    confirmAmount: confirmAmount,
                    txId: currData['txId'],
                    blockId: currData['blockHeight']
                )
            );
          }
          notifyListeners();
          return tradeInfoes;
        }else if(data>400){
          tradeInfoes = [];
          notifyListeners();
          return tradeInfoes;
        }
      });
    }

//    if(tradeInfoes==null) tradeInfoes=[];
    return tradeInfoes;
  }

  /**
   * 转账信息
   */
  SendInfo _sendInfo = null ;
  set sendInfo(SendInfo info){
    this._sendInfo = info;
  }
  SendInfo get sendInfo{
    if(this._sendInfo==null){
      this._sendInfo = SendInfo();
    }
    return _sendInfo;
  }


  String _configAssetLogoUrl(int assetId){
    switch(assetId){
      case 0:
        return 'coin_logo_BTC';
      case 1:
        return 'coin_logo_OMN';
      case 31:
        return 'coin_logo_USDT';
      case 361:
        return 'coin_logo_LUNARX';
      default:
        return 'coin_logo_OMN';
    }
  }
}
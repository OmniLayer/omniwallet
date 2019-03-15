import 'package:scoped_model/scoped_model.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'dart:math';

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

  List<WalletInfo> get  walletInfoes {
    if(this._walletInfoes==null){
      this._walletInfoes = [];
      int walletCount = 1+Random().nextInt(10);
      for(int i=0;i<walletCount;i++){
        List<AccountInfo> accountInfo = [];
        int accountCount = 1+Random().nextInt(10);
        num totalMoney = 0;
        for(int j=0;j<accountCount;j++){
          num money = Random().nextDouble();
          accountInfo.add(AccountInfo(name: '币种${j+1}',amount:Random().nextDouble(),legalTender:money ));
          totalMoney+=money;
        }
        WalletInfo info = WalletInfo(name: '钱包${i+1}',address: "address${i+1}",totalLegalTender: totalMoney,note: "note${i+1}",accountInfoes: accountInfo);
        _walletInfoes.add(info);
      }
    }

    notifyListeners();
    return this._walletInfoes;
  }




}
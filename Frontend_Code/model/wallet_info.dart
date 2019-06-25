
import 'package:meta/meta.dart';

class WalletInfo extends BaseInfo{

  String note;

  //图标路径
  String iconUrl;
  //钱包帐号地址
  String address;

  int addressIndex;
  //总体价值法币金额
  double totalLegalTender;

  /// wallet address whether visible, default is visible.
  bool visible = true;

  List<AccountInfo> accountInfoes;

  WalletInfo({
    String name,
    @required this.address,
    @required this.addressIndex,
    this.note,
    this.visible,
    this.iconUrl,this.totalLegalTender=0,this.accountInfoes
  }):super(name:name);

}

class BaseInfo{
  //名称
  String name;
  BaseInfo({this.name});
}


class AccountInfo extends BaseInfo{
  //图标路径
  String iconUrl;
  //数量
  double amount;
  //法币
  double legalTender;
  //服务器传递过来的信息
  Map jsonData;

  int propertyId;

  /// Asset 是否可见
  bool visible;

  AccountInfo({String name, this.iconUrl,this.amount,this.legalTender,this.jsonData,this.propertyId,this.visible}):super(name:name);
}


class TradeInfo extends BaseInfo{
  //交易额度
  num amount;
  //交易类型，转出 转入
  bool tradeType;
  //交易的目标地址
  String objAddress;
  //交易id
  String txId;
  //当前的状态  进行中，已完成
  num state;
  //交易时间
  DateTime tradeDate;
  //备注
  String note;
  //Block层数
  num blockId;
  //最终确认数量
  num confirmAmount;
  TradeInfo({
    this.amount,
    this.note,
    this.confirmAmount,
    this.txId,
    this.objAddress,
    this.state,
    this.tradeDate,
    this.blockId,
    this.tradeType
  });
}
class SendInfo{
  String toAddress='';
  num amount=0;
  String note='';
  num minerFee=0;

  SendInfo({
      this.toAddress,
      this.amount,
      this.note,
      this.minerFee
  });
}
/**
 * 用户常用地址
 */
class UsualAddressInfo extends BaseInfo{
  int id;
  String address;
  String note;
  UsualAddressInfo({this.id, String name, this.address,this.note}):super(name:name);
}


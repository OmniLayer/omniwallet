
class WalletInfo extends BaseInfo{

  String note;

  //图标路径
  String iconUrl;
  //钱包帐号地址
  String address;
  //总体价值法币金额
  double totalLegalTender;

  List<AccountInfo> accountInfoes;

  WalletInfo({
    String name,
    this.note,
    this.iconUrl,this.address,this.totalLegalTender=0,this.accountInfoes
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
  AccountInfo({String name, this.iconUrl,this.amount,this.legalTender}):super(name:name);
}


class TradeInfo extends BaseInfo{
  //交易额度
  num amount;
  //交易类型，转出 转入
  num tradeType;
  //交易的目标地址
  String objAddress;
  //交易id
  String txId;
  //当前的状态  进行中，已完成
  num state;
  //交易时间
  DateTime tradeDate;
  //被尊
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
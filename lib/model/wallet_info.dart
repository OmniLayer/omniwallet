
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
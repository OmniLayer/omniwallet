import 'package:wallet_app/view_model/state_lib.dart';

/**
 * 用户常用地址管理
 */
class UserUsualAddressModel extends Model{

  List<UsualAddressInfo> _usualAddressList=[];

  int _currSelectedIndex=-1;
  get currSelectedUsualAddressIndex{
    return this._currSelectedIndex;
  }
  set currSelectedUsualAddressIndex(int index){
    notifyListeners();
    this._currSelectedIndex = index;
  }

  UsualAddressInfo get currSelectedUsualAddress{
    if(this._usualAddressList.length>0&&_currSelectedIndex>-1){
      return this._usualAddressList[this._currSelectedIndex];
    }else{
      print("get nothing0");
      return null;
    }
  }

  get usualAddressList{
    if(this._usualAddressList==null){
      this._usualAddressList = [];
    }
    return this._usualAddressList;
  }

  addAddress(UsualAddressInfo info){
    if(info!=null){
      this._usualAddressList.insert(0, info);
      notifyListeners();
    }
  }

  delAddress(int index){
    this._usualAddressList.removeAt(index);
    notifyListeners();
  }

}
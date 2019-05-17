import 'dart:async';

import 'package:flutter/material.dart';
import 'package:wallet_app/view_model/state_lib.dart';

/**
 * 用户常用地址管理
 */
class UserUsualAddressModel extends Model{

  List<UsualAddressInfo> _usualAddressList;

  int _currSelectedIndex=-1;
  get currSelectedUsualAddressIndex{
    return this._currSelectedIndex;
  }
  set currSelectedUsualAddressIndex(int index){
    this._currSelectedIndex = index;
    notifyListeners();
  }

  UsualAddressInfo get currSelectedUsualAddress{
    if(this._usualAddressList!=null&&this._usualAddressList.length>0&&_currSelectedIndex>-1){
      return this._usualAddressList[this._currSelectedIndex];
    }else{
      return null;
    }
  }

  set usualAddressList(List<UsualAddressInfo> list){
    _usualAddressList = list;
  }

  getUsualAddressList(BuildContext context){
    if(_usualAddressList==null){
      Future future = NetConfig.get(context,NetConfig.transferAddressList);
      future.then((data){
        if(data!=null){
          _usualAddressList = [];
          List list = data ;
          for(int i=0;i<list.length;i++){
            _usualAddressList.add(UsualAddressInfo(id:list[i]['id'], name: list[i]['nickname'],address:list[i]['address'],note: list[i]['note']));
          }
        }
        notifyListeners();
        return this._usualAddressList;
      });
    }
    return this._usualAddressList;
  }

  addAddress(BuildContext context,UsualAddressInfo info){
    if(info!=null){
      Future future = NetConfig.post(context,NetConfig.createTransferAddress,{'id':info.id==null?'':info.id.toString(),'address':info.address,'note':info.note,'nickname':info.name});
      future.then((data){
        _usualAddressList = null;
        notifyListeners();
      });
    }
  }

  delAddress(BuildContext context, int index){
    Future future = NetConfig.get(context,NetConfig.delAddress+'?id='+index.toString());
    future.then((data){
      _usualAddressList = null;
      notifyListeners();
    });
  }

}
import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:async/async.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';
import 'package:path/path.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/view/welcome/welcome_page_1.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class NetConfig{
//  static String apiHost='http://192.168.0.103:8080/api/';
//  static String apiHost='http://172.21.100.248:8080/api/';

//  static String apiHost='http://62.234.169.68:8080/walletClient/api/';
  static String apiHost='http://62.234.169.68:8080/walletClientTest/api/';
  static String imageHost='http://62.234.169.68:8080';

  /// 创建新用户
  static String createUser='common/createUser';
  /// 根据助记词恢复用户
  static String restoreUser= 'common/restoreUser';
  /// 图片上传
  static String uploadImage='common/uploadImage';
  /// 获取最新的版本信息
  static String getNewestVersion='common/getNewestVersion';
  /// 获取默认资产列表
  static String getDefautAssetList='common/getDefautAssetList';

  /// user/updateUserFace   更新用户头像
  static String updateUserFace='user/updateUserFace';
  /// 比特币、Usdt和欧元的对美元的实时汇率
  static String btcAndUsdtExchangeRate='common/btcAndUsdtExchangeRate';


  /// 获取用户信息
  static String getUserInfo='user/getUserInfo';

  /// 更新用户pin
  static String updateUserPassword= 'user/updateUserPassword';


  /// wallet/address/getNewestAddressIndex  获取最新的地址索引
  static String getNewestAddressIndex='wallet/address/getNewestAddressIndex';
  /// wallet/address/create  创建新地址
  static String createAddress='wallet/address/create';
  /// wallet/address/list  地址列表
  static String addressList ='wallet/address/list';

  /**
   * wallet/address/getTransactionsByAddress 根据address获取交易记录
   * wallet/address/getTransactionsByAddress?address=1JiSZQDAZ16Qm8BDmNRBWa6AVsJWWeLC2U
  */
  static String getTransactionsByAddress ='wallet/address/getTransactionsByAddress';

  /// wallet/address/getOmniTransactionsByAddress 根据address获取omni交易记录
  static String getOmniTransactionsByAddress ='wallet/address/getOmniTransactionsByAddress';

  /// user/transferAddress/create  创建新的常用转账地址
  static String createTransferAddress='user/transferAddress/edit';
  /// user/transferAddress/list  转账地址列表
  static String transferAddressList ='user/transferAddress/list';
  /// user/transferAddress/delAddress  删除常用转账地址
  static String delAddress ='user/transferAddress/delAddress';

  /// blockChain/sendCmd  发送omni命令
  static String sendCmd ='blockChain/sendCmd';

  /// 获取用户公钥
  static String getUserRSAEncrypt ='user/getUserRSAEncrypt';

  /// Get Popular Asset List
  static String getPopularAssetList ='wallet/asset/getPopularAssetList';

  /// blockChain/btcSend  btc转账
  static String btcSend ='blockChain/btcSend';

  /// blockChain/omniRawTransaction omni原生转账
  static String omniRawTransaction ='blockChain/omniRawTransaction';

  ///
  static String setAddressVisible ='wallet/address/setVisible';

  ///
  static String setAssetVisible ='wallet/asset/setAssetVisible';

  ///
  static String changeAddressName ='wallet/address/changeAddressName';

  ///
  static String updateUserNickname ='user/updateUserNickname';

  /// Add a asset to a wallet address.
  static String addAsset = 'wallet/address/addAsset';

  /// feedback/submit 用户反馈
  static String feedback ='feedback/submit';
  /// common/getVersionList app版本历史
  static String appVersionList ='common/getVersionList';


  static post(BuildContext context,String url,Map<String, String> data,{Function errorCallback=null,int timeOut=30}) async{
    return _sendData(context,"post", url, data,errorCallback: errorCallback,timeOut: timeOut);
  }

  static get(BuildContext context,String url,{Function errorCallback,int timeOut=30}) async{
    return _sendData(context,"get", url,null,errorCallback: errorCallback,timeOut: timeOut);
  }

  static _sendData(BuildContext context,String reqType, String url,Map<String, String> data,{Function errorCallback=null,int timeOut=30}) async{

    Map<String, String> header = new Map();
    if(url.startsWith('common')==false){
      if(GlobalInfo.userInfo.loginToken==null){
        Tools.showToast('user have not login');
        return null;
      }
      header['authorization']='Bearer '+GlobalInfo.userInfo.loginToken;
    }

    url = apiHost + url;
    print(url);
    print('seed to server data: $data');
//    showToast('begin get data from server ',toastLength:Toast.LENGTH_LONG);
    Response response = null;
    try{
      if(reqType=="get"){
        response = await http.get(url,headers: header).timeout(Duration(seconds: timeOut));
      }else{
        var dataStr = json.encode(data);
        var dataMD5 = Tools.convertMD5Str(dataStr+GlobalInfo.dataEncodeString);
        data['dataStr']=dataStr;
        data['dataMD5']=dataMD5;
        response =  await http.post(url,headers: header, body: data).timeout(Duration(seconds: timeOut));
      }
    } on TimeoutException{
      print('TimeoutException');
      return 408;
    } on Exception {
      Tools.showToast('check your network');
      if(errorCallback!=null){
        errorCallback();
      }
      return 600;
    }

//    Fluttertoast.cancel();
    print(response.statusCode);
    bool isError = true;
    String msg;
    if(response.statusCode==200){
      var result = json.decode(response.body);
      int status = result['status'];
      print(result);
      if(status==1){
        var data = result['data'];
        isError = false;
        return data;
      }
      if(status==0){
        msg = result['msg'];
        if(msg!=null&&msg.length>0){
          Tools.showToast(msg,toastLength:Toast.LENGTH_LONG);
        }
      }
      if(status==403){

      }
    }else if(response.statusCode==403){
      GlobalInfo.clear();
      Future<SharedPreferences> prefs = SharedPreferences.getInstance();
      prefs.then((share) {
        share.clear();
        if(context!=null){
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => WelcomePageOne()),
                (route) => route == null,
          );
        }
      });
      Tools.showToast('user not exist',toastLength: Toast.LENGTH_LONG);

    } else{
      Tools.showToast('server is sleep, please wait');
    }
    if(errorCallback!=null&&isError){
      errorCallback(msg);
    }
  }

  static uploadImageFunc(File imageFile,{@required Function callback,Function errorCallback}) async{
    String url = apiHost + uploadImage;
    var stream = http.ByteStream(DelegatingStream.typed(imageFile.openRead()));
    var length = await imageFile.length();
    var uri = Uri.parse(url);
    var request = http.MultipartRequest("POST", uri);
    var multipartFile = new http.MultipartFile('file', stream, length,filename: basename(imageFile.path));
    request.files.add(multipartFile);
    var response = await request.send();
    bool flag = true;

    if(response.statusCode==200){
      await response.stream.transform(utf8.decoder).listen((data){
        var result = json.decode(data);
        print(data);
        callback(result['data']);
        flag = false;
      });
    }
    if(flag==true && errorCallback!=null){
      errorCallback();
    }
  }

  ///更新用户头像
  static changeUserFace(File imageFile,{@required Function callback,Function errorCallback}) async{
    String url = apiHost + updateUserFace;
    var stream = http.ByteStream(DelegatingStream.typed(imageFile.openRead()));
    var length = await imageFile.length();
    var uri = Uri.parse(url);
    var request = http.MultipartRequest("POST", uri);
    Map<String, String> header = new Map();
    header['authorization']='Bearer '+GlobalInfo.userInfo.loginToken;
    request.headers.addAll(header);
    var multipartFile = new http.MultipartFile('faceFile', stream, length,filename: basename(imageFile.path));
    request.files.add(multipartFile);

    var response = await request.send();

    bool flag = true;
    if(response.statusCode==200){
      await response.stream.transform(utf8.decoder).listen((data){
        var result = json.decode(data);
        callback(result['data']['faceUrl']);
        flag = false;
      });
    }
    if(flag==true && errorCallback!=null){
      errorCallback();
    }
  }
}
import 'dart:convert';
import 'dart:isolate';
import 'dart:typed_data';

import 'package:bip39/bip39.dart' as bip39;
import 'package:crypto/crypto.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/model/user_info.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/key_config.dart';
/**
 * Global data
 */
class  GlobalInfo{

  static Uint8List bip39Seed;

//  static String dataEncodeString= md5.convert(Utf8Encoder().convert('P@ssw)2d!UPRETSCLIENT')).toString();
  static String dataEncodeString= 'P@ssw)2d!UPRETSCLIENT';

  ///当前版本号
  static int currVersionCode = 5;

  static AssetToUSDRateInfo usdRateInfo = AssetToUSDRateInfo();

  static String currLanguage = KeyConfig.languageEn;

  ///
  static String currencyUnit = KeyConfig.usd;

  ///
  static String colorTheme = KeyConfig.light;

  /// Is Unlock Successfully
  static bool isUnlockSuccessfully = true;

  /// need auto lock?
  static bool isNeedLock = true;
  /// Check currently status if be locked. - False: not be locked.
  static bool isLocked = false;

  /// 1: Splash 2:Background 11:Backup 12:Send
  static int fromParent = null;

  /// From where - 0: reload  1: background.
  static int fromWhere;

  /// Will be lock how many seconds when app enter background. Default is 5 mins.
  static int sleepTime = 5;

  /// userInfo
  static UserInfo userInfo = UserInfo();

  static List<DefaultAssetInfo> defaultAssetInfoes=[];


  static clear(){
    bip39Seed = null;
    userInfo = UserInfo();
  }

  static initBipSeed(String _mnemonic,{Function callback}) async {
    Future<SharedPreferences> prefs = SharedPreferences.getInstance();
    prefs.then((share) async {
      var seed = share.get(KeyConfig.user_mnemonicSeed);
      if(seed!=null){
        var seedStr = seed.toString();
        //兼容没有加密的之前的种子
        if(seedStr.startsWith('[')==false&&seedStr.endsWith(']')==false){
          seedStr = Tools.decryptAes(seedStr);
        }
        seedStr = seedStr.substring(1,seedStr.length-1);
        List<String> seedStrArr = seedStr.split(',');
        List<int> seedArr = [];
        for(int i=0;i<seedStrArr.length;i++){
          seedArr.add(int.parse(seedStrArr[i]));
        }
        GlobalInfo.bip39Seed = Uint8List.fromList(seedArr);
      }
      if(GlobalInfo.bip39Seed == null){
//        Tools.showToast('data is initing,please wait',toastLength: Toast.LENGTH_LONG);
        print('seed init begin ${DateTime.now()}');
        GlobalInfo.bip39Seed = await getSeed(_mnemonic);
        share.setString(KeyConfig.user_mnemonicSeed,Tools.encryptAes(GlobalInfo.bip39Seed.toString()));

        print('seed init finish ${DateTime.now()}');
        callback();
      }
    });
  }

  static getSeed(String mnemonic) async{
    final request = ReceivePort();

    await Isolate.spawn(_isolate ,request.sendPort);
    //获取sendPort来发送数据
    final sendPort = await request.first as SendPort;
    //接收消息的ReceivePort
    final answer = ReceivePort();
    //发送数据
    sendPort.send([mnemonic,answer.sendPort]);
    //获得数据并返回
    return answer.first;
  }

  //创建isolate必须要的参数
  static void _isolate(SendPort initialReplyTo){
    final port = ReceivePort();
    //绑定
    initialReplyTo.send(port.sendPort);
    //监听
    port.listen((message){
      //获取数据并解析
      final data = message[0] as String;
      final send = message[1] as SendPort;
      //返回结果
      var seed = bip39.mnemonicToSeed(data.toString());

      send.send(seed);
    });
  }
}

class AssetToUSDRateInfo {
  List<double> btcs = [5000,35000];
  AssetToUSDRateInfo();
}

class DefaultAssetInfo{
  String name;
  String url;
  int assetId;
}
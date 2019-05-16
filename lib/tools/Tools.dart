import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:crypto/crypto.dart';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/model/global_model.dart';
import 'package:wallet_app/tools/key_config.dart';
import 'package:wallet_app/tools/net_config.dart';

class Tools{

  /** 返回当前时间戳 */
  static bool getCurrRunningMode() {
    return bool.fromEnvironment("dart.vm.product");
  }

  static String getCurrMoneyFlag(){
    if(GlobalInfo.currencyUnit==KeyConfig.usd){
      return '\$ ';
    }else{
      return '\￥ ';
    }
  }


  ///
  static Future<File> compressImage(File file, String targetPath,{int minWidth = 100,int minHeight = 100}) async {
    var result = await FlutterImageCompress.compressAndGetFile(
      file.absolute.path,
      targetPath,
      minWidth: minWidth,
      minHeight: minHeight,
    );
    return result;
  }

  ///生成md5
  static String convertMD5Str(String data){
    return md5.convert(Utf8Encoder().convert(md5.convert(Utf8Encoder().convert(data)).toString())).toString();
  }

  /** 返回当前时间戳 */
  static int currentTimeMillis() {
    return new DateTime.now().millisecondsSinceEpoch;
  }

  /** 复制到剪粘板 */
  static copyToClipboard(final String text) {
    if (text == null) return;
    Clipboard.setData(new ClipboardData(text: text));
  }

  static showToast(String msg,{Toast toastLength = Toast.LENGTH_SHORT}){
    Fluttertoast.cancel();
    Fluttertoast.showToast(
      msg: msg,
      toastLength: toastLength,
      gravity: ToastGravity.CENTER,
      timeInSecForIos: 1,
    );
  }

  /// get image path
  static String imagePath(final String text,{String scaleType="@2x",String suffix="png"}) {
    scaleType = scaleType==null?'':scaleType;
    suffix = suffix==null?'png':suffix;
    return 'assets/' + text + scaleType+'.'+suffix;
  }

  ///
  static void saveStringKeyValue(String key, String value) async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString(key, value);
  }

  ///
  static Future<String> getStringKeyValue(String key) async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }

  /// loading Animation
  static void loadingAnimation(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,  // user must tap button to dismiss dialog.
      builder: (BuildContext context) {
        return Container(
          child: SpinKitFadingCircle(
            itemBuilder: (context, int index) {
              return DecoratedBox(
                decoration: BoxDecoration(
                  color: index.isEven ? Colors.red : Colors.green,
                ),
              );
            },
          ),
        );

        // return Center(child:CircularProgressIndicator());
      }
    );
  }

  /// Get image from network.
  static Widget networkImage(String url,
    {String defaultImage = 'assets/omni-logo.png', double width = 90, double height = 90} ) {

    if (url == null) {
      return Image.asset(defaultImage, width: width, height: height,);
    } else {
      return CachedNetworkImage(
        placeholder: (BuildContext context, String url) {
          CircularProgressIndicator();
        },
        imageUrl: NetConfig.imageHost + url,
        width:  width,
        height: height,
        fit: BoxFit.fill,
      );
    }
  }

  static encryptAes(String content) {
    final key = encrypt.Key.fromUtf8(GlobalInfo.userInfo.pinCode);
    final iv = encrypt.IV.fromUtf8(GlobalInfo.userInfo.userId.substring(0,16));
    final encrypter = encrypt.Encrypter(encrypt.AES(key,mode:encrypt.AESMode.cbc));
    final encrypted = encrypter.encrypt(content, iv: iv);
    return encrypted.base64;
  }

  static decryptAes(String encryptedString) {
    final key = encrypt.Key.fromUtf8(GlobalInfo.userInfo.pinCode);
    final iv = encrypt.IV.fromUtf8(GlobalInfo.userInfo.userId.substring(0,16));
    final encrypter = encrypt.Encrypter(encrypt.AES(key,mode:encrypt.AESMode.cbc));
    final decrypted = encrypter.decrypt64(encryptedString, iv: iv);
    return decrypted;
  }




}
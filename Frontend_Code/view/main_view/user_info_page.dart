import 'dart:async';
/// User Info page.
/// [author] Kevin Zhang
/// [time] 2019-3-29

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart' as path_provider;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/update_nick_name.dart';
import 'package:wallet_app/view/main_view/update_pin.dart';
import 'package:wallet_app/view/welcome/welcome_page_1.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class UserInfoPage extends StatefulWidget {
  static String tag = "UserInfoPage";
  @override
  _UserInfoPageState createState() => _UserInfoPageState();
}

class _UserInfoPageState extends State<UserInfoPage> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(WalletLocalizations.of(context).userInfoPageAppBarTitle),
      ),

      body: SafeArea(
        child: Column(
          children: <Widget>[
            SizedBox(height: 10),

            Ink( // Avatar
              color: AppCustomColor.themeBackgroudColor,
              child: ListTile(
                title: Text(WalletLocalizations.of(context).userInfoPageItem_1_Title),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    _avatar(),
                    SizedBox(width: 15),
                    Icon(Icons.keyboard_arrow_right),
                  ],
                ),

                onTap: () { _bottomSheet(); },
              ),
            ),
            
            Divider(height: 0, indent: 15),

            Ink( // nick name
              color: AppCustomColor.themeBackgroudColor,
              child: ListTile(
                title: Text(WalletLocalizations.of(context).userInfoPageItem_2_Title),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text(
                      GlobalInfo.userInfo.nickname,
                      style: TextStyle(color: Colors.grey),
                    ),
                    SizedBox(width: 15),
                    Icon(Icons.keyboard_arrow_right),
                  ],
                ),

                onTap: () {
                  Navigator.of(context).pushNamed(UpdateNickName.tag);
                },
              ),
            ),
            
            Divider(height: 0, indent: 15),
            
            Ink( // Update PIN Code
              color: AppCustomColor.themeBackgroudColor,
              child: ListTile(
                title: Text(WalletLocalizations.of(context).userInfoPageItem_3_Title),
                trailing: Icon(Icons.keyboard_arrow_right),
                onTap: () { Navigator.of(context).pushNamed(UpdatePIN.tag); },
              ),
            ),

            SizedBox(height: 10),
            
            Ink( // delete account button
              color: AppCustomColor.themeBackgroudColor,
              child: ListTile(
                title: Text(
                  WalletLocalizations.of(context).userInfoPageButton,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.red),
                ),

                onTap: () { _deleteUser(); },
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Delete current user
  void _deleteUser() {
    showDialog(
      context: context,
      // barrierDismissible: false,  // user must tap button!
      builder:  (BuildContext context) {
        return AlertDialog(
          title: Text(WalletLocalizations.of(context).userInfoPageButton),
          content: Text(WalletLocalizations.of(context).userInfoPageDeleteMsg),
          actions: <Widget>[
            FlatButton(
              child: Text(WalletLocalizations.of(context).createNewAddress_Cancel),
              onPressed: () { Navigator.of(context).pop(); },
            ),

            FlatButton(
              child: Text(WalletLocalizations.of(context).common_btn_confirm),
              onPressed: () {
                GlobalInfo.clear();
                Future<SharedPreferences> prefs = SharedPreferences.getInstance();
                prefs.then((share) {
                  share.clear();
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => WelcomePageOne()), 
                    (route) => route == null,
                  );
                });
              },
            )
          ],
        );
      }
    );
  }
  
  ///
  void _bottomSheet() {
    showModalBottomSheet(
      context: context, 
      builder: (BuildContext context) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            ListTile(
              leading: Icon(Icons.photo_library),
              title: Text(WalletLocalizations.of(context).imagePickerBottomSheet_1),
              onTap: () {
                _getImage(ImageSource.gallery);
              },
            ),

            ListTile(
              leading: Icon(Icons.photo_camera),
              title: Text(WalletLocalizations.of(context).imagePickerBottomSheet_2),
              onTap: () {
                _getImage(ImageSource.camera);
              },
            ),
          ],
        );
      }
    );
  }
  
  ///
  _getImage(ImageSource myImageSource) async {
    var image = await ImagePicker.pickImage(source: myImageSource);

    // compress image
    var dir = await path_provider.getTemporaryDirectory();
    var targetPath = dir.absolute.path + "/temp.png";

    Future response = Tools.compressImage(image, targetPath);
    response.then((imgCompressed) {
      print('==> GET FILE = $imgCompressed');

      NetConfig.changeUserFace(
        imgCompressed,
        errorCallback: () {
          Tools.showToast('Update avatar fail!');
        },
        callback: (data) {
          if (data != null) {
            GlobalInfo.userInfo.faceUrl = data; // change locally data.
            setState(() {});
          }
        }
      );
    });

    Navigator.pop(context);
  }

  /// Show user avatar
  Widget _avatar() {
    return ClipRRect(
      borderRadius: BorderRadius.all(Radius.circular(5.0)),
      child: Tools.networkImage(
        GlobalInfo.userInfo.faceUrl, width: 35, height: 35),
    );
  }
}
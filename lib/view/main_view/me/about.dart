/// About US page.
/// [author] Kevin Zhang
/// [time] 2019-3-29

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class About extends StatefulWidget {
  static String tag = "About";

  @override
  _AboutState createState() => _AboutState();
}

class _AboutState extends State<About> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).aboutPageAppBarTitle),
        elevation: 0,
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: <Widget>[
              _bannerArea(),
              _contentArea(),
              _updateVersionButton(),
            ],
          ),
        ),
      )
    );
  }

  // AppBar Title
  Widget _bannerArea() {
    return Container(
      // color: AppCustomColor.aboutPageBannerBGColor,
      color: AppCustomColor.themeBackgroudColor,
      padding: EdgeInsets.symmetric(vertical: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Column(
            children: <Widget>[
              Image.asset('assets/omni-logo.png', width: 80, height: 80),
              SizedBox(height: 20),
              Text(
                WalletLocalizations.of(context).aboutPageAppName,
                style: TextStyle(
                  fontSize: 18,
                  // fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 10),
              Text(
                'v1.0.0 Beta 4',
                style: TextStyle(
                  color: Colors.grey,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  //
  Widget _contentArea() {
    return ListView(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      children: _buildMenuList(),
    );
  }

  // Build menu list
  List<Widget> _buildMenuList() {
    // list tile
    List<Widget> _list = List();

    // item content
    List<String> items = <String> [
      WalletLocalizations.of(context).aboutPageItem_1,
      WalletLocalizations.of(context).aboutPageItem_2,
      WalletLocalizations.of(context).aboutPageItem_3,
      WalletLocalizations.of(context).aboutPageItem_4,
      WalletLocalizations.of(context).aboutPageItem_5,
    ];

    // item content
    List<String> values = <String> [
      '', 
      'https://omniwallet.org', 
      '@twitter_name',
      '@wechat_name',
      '@tele_name',
    ];

    // Page routes
    List<String> routes = <String> [
      'AppUpgradeLogPage','','','',''
    ];

    for (int i = 0; i < items.length; i++) {
      _list.add(_menuItem(items[i], values[i], routes[i]));
      _list.add(Divider(height: 0, indent: 15));
    }

    return _list;
  }

  //
  Widget _menuItem(String strTitle, String strValue, String route) {
    return Ink(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        title: Text(strTitle),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(
              strValue,
              style: TextStyle(
                color: Colors.grey,
              ),
            ),
            SizedBox(width: 15),
            Icon(Icons.keyboard_arrow_right),
          ],
        ),

        onTap: () {Navigator.of(context).pushNamed(route);},
      ),
    );
  }

  /// Update version button
  Widget _updateVersionButton() {
    return Padding(
      padding: const EdgeInsets.all(30),
      child: CustomRaiseButton(
        context: context,
        hasRow: false,
        title: WalletLocalizations.of(context).aboutPageButton,
        titleColor: Colors.white,
        color: AppCustomColor.btnConfirm,
        callback: () {
          _checkVersion();
        },
      ),
    );
  }

  /// Check if has a newer version
  void _checkVersion() async {

    // Invoke api.
    var data = await NetConfig.get(
      context,
      NetConfig.getNewestVersion,
      errorCallback: () {  // No newer version.
        _isLatestVersion();
      }
    );

    if (data != null) {
      // If has a newer version, then show dialog.
      if (data['code'] > GlobalInfo.currVersionCode) {
        _hasNewerVersion(data);
      } else { // If has not a newer, just show promt.
        // Tools.showToast(
        //   WalletLocalizations.of(context).appVersionNoNewerVersion,
        //   toastLength: Toast.LENGTH_LONG
        // );
        _isLatestVersion();
      }
    }
  }

  /// Has a newer version.
  void _hasNewerVersion(data) {
    showDialog(
      context: context,
      barrierDismissible: false,  // user must tap button!
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(WalletLocalizations.of(context).appVersionTitle),
          content: Text(WalletLocalizations.of(context).appVersionContent1),
          actions: _actions(data),
        );
      }
    );
  }

  /// Currently is latest version.
  void _isLatestVersion() {
    showDialog(
      context: context,
      // barrierDismissible: false,  // user must tap button!
      builder: (BuildContext context) {
        return AlertDialog(
          // title: Text(WalletLocalizations.of(context).appVersionTitle),
          content: Text(WalletLocalizations.of(context).appVersionNoNewerVersion),
          actions: <Widget>[
            FlatButton(
              child: Text(WalletLocalizations.of(context).appVersionBtn2),
              onPressed: () { Navigator.of(context).pop(); },
            ),
          ]
        );
      }
    );
  }

  /// Actions for update version
  List<Widget> _actions(data) {

    bool isForce = data['isForce'];

    List<Widget> btns = [];

    // The version can be ignored.
    if (isForce == false) {
      btns.add(FlatButton(
        child: Text(WalletLocalizations.of(context).appVersionBtn1),
        onPressed: () {
          Navigator.of(context).pop();
        },
      ));
    }

    // The version must be upgraded.
    btns.add(FlatButton(
      child: Text(WalletLocalizations.of(context).appVersionBtn2),
      onPressed: () {
        Navigator.of(context).pop();
        _upgradeNewerVersion(data);
      },
    ));

    return btns;
  }

  /// Upgrade to newer version
  void _upgradeNewerVersion(data) async {

    // APK install file download url for Android.
    var url = NetConfig.imageHost + data['path'];

    // Go to App Store for iOS.
    if (Platform.isIOS) {
      url = 'https://www.baidu.com/'; // temp code
    }

    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }
}
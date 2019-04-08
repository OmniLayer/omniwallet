/// About page.
/// [author] Kevin Zhang
/// [time] 2019-3-29

import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';

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
      color: AppCustomColor.aboutPageBannerBGColor,
      padding: EdgeInsets.symmetric(vertical: 30),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Column(
            children: <Widget>[
              Image.asset('assets/logo-png.png', width: 80, height: 80),
              SizedBox(height: 10),
              Text(
                WalletLocalizations.of(context).aboutPageAppName,
                style: TextStyle(
                  fontSize: 18,
                  // fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 10),
              Text(
                'v0.01 Beta',
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
      '','','','',''
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

  // Update version button
  Widget _updateVersionButton() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 30, horizontal: 30),
      child: Row(
        children: <Widget>[
          Expanded(
            child: RaisedButton(
              child: Text(
                WalletLocalizations.of(context).aboutPageButton,
              ),

              color: AppCustomColor.btnConfirm,
              textColor: Colors.white,
              padding: EdgeInsets.symmetric(vertical: 15),
              elevation: 0,
              onPressed: () {
                // print(_btnWidth - 27);
              },
            ),
          ),
        ],
      ),
    );
  }

}
/// My profile page.
/// [author] Kevin Zhang
/// [time] 2019-3-21

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/backupwallet/backup_wallet_index.dart';
import 'package:wallet_app/view/main_view/Help.dart';
import 'package:wallet_app/view/main_view/about.dart';
import 'package:wallet_app/view/main_view/service_terms.dart';
import 'package:wallet_app/view/main_view/settings.dart';
import 'package:wallet_app/view/main_view/user_info.dart';
import 'package:wallet_app/view/main_view/wallet_address_book.dart';

class UserCenter extends StatefulWidget {

  @override
  _UserCenterState createState() => _UserCenterState();
}

class _UserCenterState extends State<UserCenter> {

  @override
  Widget build(BuildContext context) {
    return Stack(
      // decoration: BoxDecoration(
      //   image: DecorationImage(
      //     image: AssetImage('assets/img1.jpg'),
      //     fit: BoxFit.fitHeight,
      //   )
      // ),
      children: <Widget>[
        Image.asset(
          'assets/img1.jpg',
          fit: BoxFit.cover,
          height: 220,
          width: MediaQuery.of(context).size.width,
        ),

        Scaffold(
          backgroundColor: Colors.transparent,

          appBar: PreferredSize(
            child: AppBar(
              backgroundColor: Colors.transparent,
              brightness: Brightness.dark,
            ),
            preferredSize: Size.fromHeight(0),
          ),
          
          body: SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: <Widget>[
                  _bannerArea(),
                  _menuArea(),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  //
  Widget _menuArea() {
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

    // Icons
    List<Icon> leading_icons = <Icon> [
      Icon(Icons.settings),
      Icon(Icons.book),
      Icon(Icons.help),
      Icon(Icons.terrain),
      Icon(Icons.backup),
      Icon(Icons.info),
    ];

    // item content
    List<String> items = <String> [
      WalletLocalizations.of(context).myProfilePageMenu1,
      WalletLocalizations.of(context).myProfilePageMenu2,
      WalletLocalizations.of(context).myProfilePageMenu3,
      WalletLocalizations.of(context).myProfilePageMenu4,
      WalletLocalizations.of(context).myProfilePageMenu5,
      WalletLocalizations.of(context).myProfilePageMenu6,
    ];

    // Page routes
    List<String> routes = <String> [
      Settings.tag, 
      AddressBook.tag, 
      Help.tag, 
      ServiceTerms.tag,
      BackupWalletIndex.tag,
      About.tag,
    ];

    for (int i = 0; i < items.length; i++) {
      _list.add(_menuItem(leading_icons[i], items[i], routes[i]));
      _list.add(Divider(height: 0, indent: 15));
    }

    // var divideList = ListTile.divideTiles(context: context, tiles: _list).toList();

    return _list;
  }

  // AppBar Title
  Widget _bannerArea() {
    return InkWell(
      onTap: () {
        Navigator.of(context).pushNamed(UserInfo.tag);
      },

      child: Container(
        height: 200,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            // user avatar.
            Image.asset('assets/logo-png.png', width: 70, height: 70),
            SizedBox(height: 10),
            
            Text(  // user nick name
              'Nick Name',
              style: TextStyle(color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  //
  Widget _menuItem(Icon icon, String item, String route) {
    return Ink(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        leading: icon,
        title: Text(item),
        trailing: Icon(Icons.keyboard_arrow_right),
        onTap: () {Navigator.of(context).pushNamed(route);},
      ),
    );
  }

}

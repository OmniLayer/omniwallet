/// My profile page.
/// [author] Kevin Zhang
/// [time] 2019-3-21

import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';

class UserCenter extends StatefulWidget {
  @override
  _UserCenterState createState() => _UserCenterState();
}

class _UserCenterState extends State<UserCenter> {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/img1.jpg'),
          fit: BoxFit.cover,
        )
      ),

      child: Scaffold(
        // appBar: AppBar(
        //   title: Text('data'),
        //   backgroundColor: Colors.transparent,
        //   elevation: 0,  // shadow
        // ),
        
        backgroundColor: Colors.transparent,
        
        body: SafeArea(
          child: ListView(
            children: <Widget>[
              _bannerArea(),
              _menuArea(),
            ],
          ),
        )
      ),
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
  
    for (int i = 0; i < items.length; i++) {
      _list.add(_menuItem(leading_icons[i], items[i]));
    }

    var divideList = ListTile.divideTiles(context: context, tiles: _list).toList();

    return divideList;
  }

  // AppBar Title
  Widget _bannerArea() {
    return Container(
      height: 200,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          // user avatar.
          Image.asset('assets/logo-png.png', width: 70, height: 70),
          SizedBox(height: 20),
          // user nick name
          Text(
            'Nick Name',
            style: TextStyle(color: Colors.white),
          ),
        ],
      ),
    );
  }

  //
  Widget _menuItem(Icon icon, String item) {
    return Material(
      child: ListTile(
        leading: icon,
        title: Text(item),
        trailing: Icon(Icons.chevron_right),
        onTap: () { 
          // TODO: show next page.
          print('menu list');
        },
      ),
    );
  }

}

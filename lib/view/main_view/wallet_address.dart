import 'package:auto_size_text/auto_size_text.dart';
/// Wallet Addresses List page.
/// [author] Kevin Zhang
/// [time] 2019-4-25

import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/address_manage.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class WalletAddress extends StatefulWidget {
  static String tag = "WalletAddress";

  @override
  _WalletAddressState createState() => _WalletAddressState();
}

class _WalletAddressState extends State<WalletAddress> {

  List<WalletInfo> _walletInfoes;
  MainStateModel stateModel = null;

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(WalletLocalizations.of(context).walletAddressPageAppBarTitle),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.only(top: 10),
          child: ListView(
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            children: _addressList(),
          ),
        ),
      ),
    );
  }

  /// wallet address list
  List<Widget> _addressList() {

    if (stateModel == null) {
      stateModel = MainStateModel().of(context);
      _walletInfoes = stateModel.getWalletInfoes(context);
    }
    print('==> address amount = ${_walletInfoes.length}');

    // list tile
    List<Widget> _list = List();

    // title
    _list.add(_addressListTitle());

    for (int i = 0; i < _walletInfoes.length; i++) {
      _list.add(_addressItem(_walletInfoes[i]));
      _list.add(Divider(height: 0, indent: 15));
    }

    return _list;
  }

  ///
  Widget _addressListTitle() {
    return Padding(
      padding: const EdgeInsets.only(left: 15, top: 20, bottom: 10),
      child: AutoSizeText(
        WalletLocalizations.of(context).walletAddressPageListTitle,
        style: TextStyle(color: Colors.grey),
        minFontSize: 10,
        maxLines: 1,
      ),
    );
  }

  ///
  Widget _addressItem(WalletInfo walletData) {
    return Ink(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        title: Text( // address name
          walletData.name,
          style: walletData.visible ? null : TextStyle(color: Colors.grey),
        ),

        subtitle: walletData.visible ? null : Text( // Is hiddened display
          WalletLocalizations.of(context).walletAddressPageHidden,
          style: TextStyle(
            color: Colors.red,
            fontSize: 12,
            fontStyle: FontStyle.italic,
          ),
        ),

        trailing: Row( // address
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(
              walletData.address.replaceRange(6, walletData.address.length - 6, '...'),
              style: TextStyle(
                color: Colors.grey,
              ),
            ),
            SizedBox(width: 15),
            Icon(Icons.keyboard_arrow_right),
          ],
        ),

        // onTap: () { Navigator.of(context).pushNamed(AddressManage.tag); },
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => AddressManage(data: walletData),
            ),
          );
        },
      ),
    );
  }
}
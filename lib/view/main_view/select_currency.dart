/// Switch currency for assets display.
/// [author] Kevin Zhang
/// [time] 2019-5-7

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view_model/main_model.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class SelectCurrency extends StatefulWidget {
  static String tag = "SelectCurrency";
  @override
  _SelectCurrencyState createState() => _SelectCurrencyState();
}

class _SelectCurrencyState extends State<SelectCurrency> {
  
  String strClickItem = '';
  
  @override
  Widget build(BuildContext context) {
    //
    final model = MainStateModel().of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).currencyPageAppBarTitle),
        actions: <Widget>[
          FlatButton(  // save button
            child: Text(WalletLocalizations.of(context).languagePageSaveButton),
            textColor: Colors.blue,
            onPressed: () {
              _actionSaveButton(model, context);
            },
          ),
        ],
      ),

      body: SafeArea(
        child: ListView(
          children: _currencyList(model),
        ),
      )
    );
  }

  // 
  void _actionSaveButton(MainStateModel model, BuildContext context) {
    print('strClickItem = $strClickItem');
    if (strClickItem != '') {
      model.setCurrencyUnit(strClickItem);
      model.setWalletInfoes(null,rightNow: true);
    
      // change Currency Unit.
      if (strClickItem == KeyConfig.usd) {
      } else {
      }
    
      // MyApp.setLocale(context, locale);
    
      // save selected value to local storage
      _saveCurrencyUnit(strClickItem);
    }
                 
    Navigator.pop(context);
  }

  /// Build list data.
  /// [item] is list tile content.
  /// [setCurrencyUnit] is currently selected Currency Unit.
  Widget _oneItem(BuildContext context, String item, String setCurrencyUnit) {

    bool isSelected;
    if (item == setCurrencyUnit) {
      isSelected = true;
    } else {
      isSelected = false;
    }

    return Ink(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        // leading: _iconLanguage(item),
        title: Text(item),
        trailing: Icon(
          isSelected ? Icons.check : null,
          color: Colors.blue,
        ),
        onTap: () { 
          setState(() {
            strClickItem = item;
          });
        },
      ),
    );
  }

  // Build Currency Unit list
  List<Widget> _currencyList(MainStateModel model) {
    
    String setCurrencyUnit = model.getCurrencyUnit;
    
    // List content.
    List<Widget> _list = List();
    List<String> items = <String> [
      KeyConfig.usd, KeyConfig.cny,
    ];

    if (strClickItem != '') {
      setCurrencyUnit = strClickItem;
    }

    for (int i = 0; i < items.length; i++) {
      _list.add(_oneItem(context, items[i], setCurrencyUnit));
      _list.add(Divider(height: 0, indent: 15));
    }

    return _list;
  }

  //
  void _saveCurrencyUnit(String value) async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString(KeyConfig.set_currency_unit, value);
  }

  //
  // Widget _iconLanguage(String item) {
  //   if (item == 'English') {
  //     return Image.asset(Tools.imagePath('icon_english'), width: 24, height: 24);
  //   } else {
  //     return Image.asset(Tools.imagePath('icon_chinese'), width: 24, height: 24);
  //   }
  // }
}
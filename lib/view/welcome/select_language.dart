/// Switch language display of app page.
/// [author] Kevin Zhang
/// [time] 2019-3-5

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/main.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view_model/main_model.dart';

class SelectLanguage extends StatefulWidget {
  @override
  _SelectLanguageState createState() => _SelectLanguageState();
}

class _SelectLanguageState extends State<SelectLanguage> {
  
  String strClickItem = '';
  
  @override
  Widget build(BuildContext context) {
    //
    final langModel = MainStateModel().of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).languagePageAppBarTitle),
        actions: <Widget>[
          FlatButton(  // save button
            child: Text(WalletLocalizations.of(context).languagePageSaveButton),
            textColor: Colors.blue,
            onPressed: () {
              _actionSaveButton(langModel, context);
            },
          ),
        ],
      ),

      body: SafeArea(
        child: ListView(
          children: _languageList(langModel),
        ),
      )
    );
  }

  // 
  void _actionSaveButton(MainStateModel langModel, BuildContext context) {
    print('strClickItem = $strClickItem');
    if (strClickItem != '') {
      langModel.setSelectedLanguage(strClickItem);
    
      // change app language.
      Locale locale;
      if (strClickItem == 'English') {
        locale = Locale('en',"US");
      } else {
        locale = Locale('zh',"CH");
      }
    
      MyApp.setLocale(context, locale);
    
      // save selected value to local storage
      _saveSelectedLanguage(strClickItem);
    }
                 
    Navigator.pop(context);
  }

  /// Build list data.
  /// [item] is list tile content.
  /// [setLanguage] is currently selected language.
  Widget _oneItem(BuildContext context, String item, String setLanguage) {

    bool isSelected;
    if (item == setLanguage) {
      isSelected = true;
    } else {
      isSelected = false;
    }

    return Ink(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
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

  // Build language list
  List<Widget> _languageList(MainStateModel langModel) {
    
    String setLanguage = langModel.getSelectedLanguage;
    
    // List content.
    List<Widget> _list = List();
    List<String> items = <String> [
      'English', '简体中文',
    ];

    if (strClickItem != '') {
      setLanguage = strClickItem;
    }

    // _list.clear();
    for (int i = 0; i < items.length; i++) {
      _list.add(_oneItem(context, items[i], setLanguage));
      _list.add(Divider(height: 0, indent: 15));
    }

    return _list;
  }

  //
  void _saveSelectedLanguage(String value) async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString('set_language', value);
  }
}
/// Switch language display of app page.
/// [author] Kevin Zhang
/// [time] 2019-3-5

import 'package:flutter/material.dart';
import 'package:wallet_app/main.dart';
import 'package:wallet_app/view_model/main_model.dart';

class SelectLanguage extends StatefulWidget {
  @override
  _SelectLanguageState createState() => _SelectLanguageState();
}

class _SelectLanguageState extends State<SelectLanguage> {
  
  String strClickItem = '';

  // List content.
  List<Widget> _list = List();
  List<String> items = <String> [
    'English', '简体中文',
  ];

  /// Build list data.
  /// [item] is list tile content.
  /// [setLanguage] is current selected item.
  Widget _buildListData(BuildContext context, String item, String setLanguage) {

    bool isSelected;
    if (item == setLanguage) {
      isSelected = true;
    } else {
      isSelected = false;
    }

    return ListTile(
      title: Text(item),
      trailing: Icon( isSelected ? Icons.check : null ),
      onTap: () { 
        setState(() {
          strClickItem = item;
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    
    final langModel = MainStateModel().of(context);
    String setLanguage = langModel.getSelectedLanguage;
    
    if (strClickItem != '') {
      setLanguage = strClickItem;
    }

    _list.clear();
    for (int i = 0; i < items.length; i++) {
      _list.add(_buildListData(context, items[i], setLanguage));
    }

    var divideList = ListTile.divideTiles(context: context, tiles: _list).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text('Language'),
        actions: <Widget>[
          IconButton(
            icon: Icon(Icons.save),
            onPressed: () {
              print('strClickItem = $strClickItem');
              if (strClickItem != '') {
                langModel.setSelectedLanguage(strClickItem);

                // Set language.
                Locale locale =  Localizations.localeOf(context);
                if (strClickItem == 'English') {
                  locale = Locale('en',"US");
                } else {
                  locale = Locale('zh',"CH");
                }
                MyApp.setLocale(context,locale);
              }
             
              Navigator.pop(context);
            },
          ),
        ],
      ),

      body: SafeArea(
        child: ListView(
          children: divideList,
        ),
      )
    );
  }
}
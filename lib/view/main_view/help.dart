/// Help and Feedback page.
/// [author] Kevin Zhang
/// [time] 2019-3-25

import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/feedback.dart';

class Help extends StatefulWidget {
  static String tag = "Help";

  @override
  _HelpState createState() => _HelpState();
}

class _HelpState extends State<Help> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(WalletLocalizations.of(context).helpPageTitle),
        actions: <Widget>[
          FlatButton(  // feedback button
            child: Text(WalletLocalizations.of(context).helpPageFeedback),
            textColor: Colors.blue,
            onPressed: () {
              // TODO: submit feedback
              Navigator.of(context).pushNamed(SubmitFeedback.tag);
            },
          ),
        ],
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container( // Title
                padding: EdgeInsets.symmetric(horizontal: 15, vertical: 20),
                child: Text(
                  'FAQ',
                  style: TextStyle(
                    fontSize: 18,
                    // fontWeight: FontWeight.bold,
                  ),
                ),
              ),

              ListView(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                children: _buildFAQList(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Build FAQ list
  List<Widget> _buildFAQList() {
    // list tile
    List<Widget> _list = List();

    // FAQ list
    List<String> faqList = <String> [
      'Q-1','Q-2','Q-3',
    ];

    for (int i = 0; i < faqList.length; i++) {
      _list.add(_faqItem(faqList[i]));
      _list.add(Divider(height: 0, indent: 15));
    }

    // var divideList = ListTile.divideTiles(context: context, tiles: _list).toList();

    return _list;
  }

  //
  Widget _faqItem(String item) {
    return Ink(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        title: Text(item),
        trailing: Icon(Icons.keyboard_arrow_right),
        onTap: () { 
          // TODO: show next page.
          print('menu list');
          // Navigator.of(context).pushNamed('routeName');
        },
      ),
    );
  }
}
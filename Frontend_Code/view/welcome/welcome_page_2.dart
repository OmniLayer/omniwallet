import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/welcome/welcome_page_3.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';

class WelcomePageTwo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: AppCustomColor.themeBackgroudColor,

        appBar: PreferredSize(
          child: AppBar(
            backgroundColor: Colors.transparent,
            // brightness: Theme.of(context).brightness ==
            //   Brightness.dark ? Brightness.light : Brightness.dark,
          ),
          preferredSize: Size.fromHeight(0),
        ),

        body: SafeArea(
          child: ListView(
              padding: EdgeInsets.symmetric(horizontal: 30, vertical: 30),
              children: _content(context)
          ),
        )
    );
  }

  /// Title
  Widget _title(BuildContext context) {
    return Text(
      WalletLocalizations.of(context).welcomePageTwoTitle,
      textAlign: TextAlign.center,
      style: TextStyle(
        fontSize: 20.0,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  /// Introduction content
  Widget _firstPart(BuildContext context) {
    return Text(
      WalletLocalizations.of(context).welcomePageTwoContentOne,
      style: TextStyle(
        color: AppCustomColor.fontGreyColor,
        height: 1.3,
      ),
    );
  }

  ///
  List<Widget> _content(BuildContext context) {

    List<Widget> _list = List();

    List<String> _icons = <String> [
      'icon_wel1', 'icon_wel2', 'icon_wel3', 'icon_wel4'
    ];

    List<String> _text = <String> [
      WalletLocalizations.of(context).welcomePageTwoContentTwo,
      WalletLocalizations.of(context).welcomePageTwoContentThree,
      WalletLocalizations.of(context).welcomePageTwoContentFour,
      WalletLocalizations.of(context).welcomePageTwoContentFive,
    ];

    _list.add(_title(context));
    _list.add(SizedBox(height: 30));
    _list.add(_firstPart(context));
    _list.add(SizedBox(height: 30));

    for (int i = 0; i < _icons.length; i++) {
      _list.add(_listContent(Tools.imagePath(_icons[i]), _text[i]));
      _list.add(SizedBox(height: 30));
    }

    _list.add(_bottomButton(context));

    return _list;
  }

  ///
  Widget _listContent(String img, String txt) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        Image.asset(img, width: 24, height: 28),
        SizedBox(width: 30),
        Expanded(
          child: Text(
            txt,
            style: TextStyle(
              color: AppCustomColor.fontGreyColor,
              height: 1.3,
            ),
          ),
        ),
      ],
    );
  }

  /// Buttons
  Widget _bottomButton(BuildContext context) {
    return Row(
      children: <Widget>[
        CustomRaiseButton( // Back button.
          context: context,
          flex: 2,
          title: WalletLocalizations.of(context).welcomePageTwoButtonBack,
          leftIconName: 'icon_back',
          callback: () {
            Navigator.pop(context);
          },
        ),

        SizedBox(width: 10),
        CustomRaiseButton( // Next button.
          context: context,
          flex: 3,
          title: WalletLocalizations.of(context).welcomePageTwoButtonNext,
          titleColor: Colors.white,
          rightIconName: 'icon_next',
          color: AppCustomColor.btnConfirm,
          callback: () {
            Navigator.push(context,
                MaterialPageRoute(builder: (context) => WelcomePageThree()));
          },
        ),
      ],
    );
  }
}
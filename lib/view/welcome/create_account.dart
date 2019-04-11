///  Create a New Account.
/// [author] Kevin Zhang
/// [time] 2019-3-5

import 'package:flutter/material.dart';
import 'package:keyboard_actions/keyboard_actions.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/backupwallet/backup_wallet_index.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';

class CreateAccount extends StatefulWidget {
  @override
  _CreateAccountState createState() => _CreateAccountState();
}

class _CreateAccountState extends State<CreateAccount> {

  //
  FocusNode _nodeText1 = FocusNode();
  FocusNode _nodeText2 = FocusNode();
  FocusNode _nodeText3 = FocusNode();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(WalletLocalizations.of(context).createAccountPageAppBarTitle),
      ),

      body: FormKeyboardActions(
        actions: _keyboardActions(),
        child: SafeArea(
          child: _content(),
        ),
      ),
    );
  }

  // Keyboard Actions
  List<KeyboardAction> _keyboardActions() {

    List<KeyboardAction> actions = <KeyboardAction> [
      KeyboardAction(
        focusNode: _nodeText1,
        closeWidget: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Icon(Icons.close),
        )
      ),

      KeyboardAction(
        focusNode: _nodeText2,
        closeWidget: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Icon(Icons.close),
        )
      ),

      KeyboardAction(
        focusNode: _nodeText3,
        closeWidget: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Icon(Icons.close),
        )
      ),
    ];

    return actions;
  }
  
  // TextField - Account Name
  Widget _inputAccountName() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 25, vertical: 10),
      child: Row(
        children: <Widget>[
          Image.asset('assets/logo-png.png', width: 26, height: 26),
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                border: InputBorder.none,
                filled: true, 
                fillColor: AppCustomColor.themeBackgroudColor,
                hintText: WalletLocalizations.of(context).createAccountPageTooltip_1,
              ),

              focusNode: _nodeText1,
            ),
          ),
        ],
      ),
    );
  }

  // TextField - Password
  Widget _inputPassword() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 25, vertical: 10),
      child: Row(
        children: <Widget>[
          Image.asset('assets/logo-png.png', width: 26, height: 26),
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                border: InputBorder.none,
                filled: true, 
                fillColor: AppCustomColor.themeBackgroudColor,
                hintText: WalletLocalizations.of(context).createAccountPageTooltip_2,
              ),

              focusNode: _nodeText2,
            ),
          ),
        ],
      ),
    );
  }

  // TextField - Repeat Password
  Widget _inputRepeatPassword() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 25, vertical: 10),
      child: Row(
        children: <Widget>[
          Image.asset('assets/logo-png.png', width: 26, height: 26),
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                border: InputBorder.none,
                filled: true, 
                fillColor: AppCustomColor.themeBackgroudColor,
                hintText: WalletLocalizations.of(context).createAccountPageTooltip_3,
              ),

              focusNode: _nodeText3,
            ),
          ),
        ],
      ),
    );
  }

  //
  Widget _content() {
    return SingleChildScrollView(
      child: Container(
        padding: EdgeInsets.only(top: 30),
        color: AppCustomColor.themeBackgroudColor,
        child: Column(
          children: <Widget>[
            Image.asset('assets/logo-png.png', width: 80, height: 80),
            SizedBox(height: 50.0),
            _inputAccountName(),
            Divider(height: 0, indent: 25),
            _inputPassword(),
            Divider(height: 0, indent: 25),
            _inputRepeatPassword(),
            Divider(height: 0, indent: 25),

            // Button - Create wallet
            SizedBox(height: 50.0),
            _createButton(),
          ],
        ),
      ),
    );
  }

  // Update version button
  Widget _createButton() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 30, horizontal: 30),
      child: Row(
        children: <Widget>[
          Expanded(
            child: RaisedButton(
              child: Text(
                WalletLocalizations.of(context).createAccountPageButton,
              ),

              color: AppCustomColor.btnConfirm,
              textColor: Colors.white,
              padding: EdgeInsets.symmetric(vertical: 15),
              elevation: 0,
              onPressed: () {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(
                      builder: (BuildContext context){
                        return BackupWalletIndex(param: 1,);
                      }),
                      (route) => route == null);
              },
            ),
          ),
        ],
      ),
    );
  }
}
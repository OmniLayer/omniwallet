import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/view/main_view/main_page.dart';
import 'package:wallet_app/view/welcome/welcome_page_2.dart';

class WelcomePageOne extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        child: AppBar(
          backgroundColor: Colors.transparent,
        ),
        preferredSize: Size.fromHeight(0),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 30, vertical: 30),
          child: _childColumn(context),
        ),
      )
    );
  }

  // Child content.
  Widget _childColumn(BuildContext context) {
    return ListView(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      children: <Widget>[
        // Title
        Text(
          WalletLocalizations.of(context).welcomePageOneTitle,
          style: TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
          ),
        ),

        // Image for welcome.
        SizedBox(height: 30),
        Image.asset('assets/logo-png.png', width: 120, height: 120),

        // Introduction content.
        SizedBox(height: 30),
        Text(
          WalletLocalizations.of(context).welcomePageOneContent,
          textAlign: TextAlign.left,
          // style: TextStyle(color: Colors.grey[700]),
        ),

        // Next button.
        SizedBox(height: 30),
        RaisedButton(
          child: Text(WalletLocalizations.of(context).welcomePageOneButton),
          color: Colors.blue,
          textColor: Colors.white,
          onPressed: () {
            // Show the welcome page two.
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => WelcomePageTwo()
              )
            );
          },
        ),

        FlatButton(
          child: Text(WalletLocalizations.of(context).common_btn_skip),
          textColor: Colors.grey,
          onPressed: () {
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (context) => MainPage()), 
              (route) => route == null
            );
          },
        ),
      ],
    );
  }
}

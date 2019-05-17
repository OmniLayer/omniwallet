///  Welcome Page-1 
/// [author] Kevin Zhang
/// [time] 2019-3-1

import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/main_page.dart';
import 'package:wallet_app/view/welcome/welcome_page_2.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class WelcomePageOne extends StatelessWidget {
  /**
   *  curr mode debug  or product
   */
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppCustomColor.themeBackgroudColor,
      
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
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
          ),
        ),

        // Image for welcome.
        SizedBox(height: 30),
        // Image.asset('assets/image_welcome@2x.png', width: 120, height: 120),
        Image.asset(Tools.imagePath('image_welcome')),

        // Introduction content.
        SizedBox(height: 30),
        Text(
          WalletLocalizations.of(context).welcomePageOneContent,
          // textAlign: TextAlign.left,
          style: TextStyle(
            // fontFamily: AppCustomColor.fontFamily,
            // fontSize: 16,
            // fontWeight: FontWeight.bold,
            color: AppCustomColor.fontGreyColor,
            height: 1.3,
          ),
        ),

        SizedBox(height: 30),
        RaisedButton( // Next button.
          elevation: 0,
          highlightElevation: 0,
          color: AppCustomColor.btnConfirm,
          padding: EdgeInsets.symmetric(vertical: 12),
          child: AutoSizeText(
            WalletLocalizations.of(context).welcomePageOneButton,
            minFontSize: 9,
            maxLines: 1,
            style: TextStyle(color: Colors.white),
          ),

          onPressed: (){
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => WelcomePageTwo()
              )
            );
          },
        ),

        /* 
        CustomRaiseButton( // Next button.
          context: context,
          hasRow: false,
          title: WalletLocalizations.of(context).welcomePageOneButton,
          titleColor: Colors.white,
          color: AppCustomColor.btnConfirm,
          callback: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => WelcomePageTwo()
              )
            );
          },
        ), */

        /// TEMP CODE
//        AnimatedOpacity(
//          duration: Duration(milliseconds: 1000),
//          opacity:Tools.getCurrRunningMode()?0:1,
//          child: FlatButton(
//            child: Text(WalletLocalizations.of(context).common_btn_skip),
//            textColor: Colors.grey,
//            onPressed: this.onClickSkip(context),
//          ),
//        ),
      ],
    );
  }

  Function onClickSkip(BuildContext context){
    if(Tools.getCurrRunningMode()==false){
        return () {
        Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => MainPage()),
                (route) => route == null
        );
      };
    }
    return null;
  }

}

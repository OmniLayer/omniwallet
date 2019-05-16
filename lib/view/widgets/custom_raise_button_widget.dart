import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:wallet_app/tools/Tools.dart';

class CustomRaiseButton extends StatelessWidget {
  const CustomRaiseButton({
    Key key,
    @required this.context,
    this.callback,
    @required this.title,
    this.hasRow=true,
    this.titleSize=15.0,
    this.titleColor= Colors.black,
    this.leftIconName,
    this.rightIconName,
    this.color = Colors.transparent,
    this.height = 15.0,
    this.flex = 1
  }) : super(key: key);

  final BuildContext context;
  final bool hasRow;
  final Function callback;
  final String title;
  final num titleSize;
  final Color titleColor;
  final String leftIconName;
  final String rightIconName;

  /**
   * background color
   */
  final Color color;
  final num height;
  final int flex;

  @override
  Widget build(BuildContext context) {
    if(this.hasRow==false){
      return Row(
        children: <Widget>[
          this.bulidWidet()
        ],
      );
    }else{
      return this.bulidWidet();
    }
  }

  Widget bulidWidet(){
    return Expanded(
      flex: this.flex,
      child: RaisedButton(
        elevation: 0,
        highlightElevation: 0,
        onPressed: callback==null?null:(){
          callback();
        },
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: this.createChildren(),
        ),
        color: color,
        padding: EdgeInsets.symmetric(vertical:height),
      ),
    );
  }

  List<Widget> createChildren(){
    List<Widget> list = [];
    if(this.leftIconName!=null){
      list.add(Padding(
        padding: const EdgeInsets.only(right: 10),
        child: Image.asset(Tools.imagePath(this.leftIconName),width: 15,height: 15,),
      ));
    }

//    list.add(
//      Text(
//        this.title,
//        maxLines: 1,
//        style: TextStyle(
//          fontSize: titleSize,
//          // fontSize: 12,
//          color:    titleColor,
//        )
//      )
//    );
    list.add(
      AutoSizeText(
        this.title,
        minFontSize: 9,
        maxLines: 1,
        style: TextStyle(
          fontSize: titleSize,
          // fontSize: 12,
          color:    titleColor,
        )
      )
    );

    if(this.rightIconName!=null){
      list.add(Padding(
        padding: const EdgeInsets.only(left: 10),
        child: Image.asset(Tools.imagePath(this.rightIconName),width: 15,height: 15,),
      ));
    }
    return list;
  }
}
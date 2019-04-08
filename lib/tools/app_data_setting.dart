import 'package:flutter/material.dart';

/**
 * app的颜色配置文件
 */
class AppCustomColor{
  /**
   * 确认按钮
   */
  static Color btnConfirm = Color(0xFF6690F9);

  /**
   * 取消按钮
   */
  static Color btnCancel =  Color(0xFFE4ECFF);

  /**
   * 主题前景颜色
   */
  static Color themeFrontColor =  Colors.black;

  /**
   * 主题背景颜色
   */
  static Color themeBackgroudColor =  Colors.white;

  /**
   * About Page Banner Area Backgroud Color
   */
  static Color aboutPageBannerBGColor =  Colors.blue[50];

  static setColors(Brightness brightness){
    AppCustomColor.themeFrontColor =
      brightness == Brightness.dark ? Colors.white : Colors.black;

    AppCustomColor.themeBackgroudColor =
      brightness == Brightness.dark ? Colors.black : Colors.white;

    AppCustomColor.aboutPageBannerBGColor =
      brightness == Brightness.dark ? Colors.black45 : Colors.blue[50];
  }

}
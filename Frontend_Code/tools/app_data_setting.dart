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


  static Color navBgColor =  Color(0xFF191E32);

  /**
   * 主题背景颜色
   */
  static Color themeBackgroudColor =  Colors.white;

  /// About Page Banner Area Backgroud Color
  static Color aboutPageBannerBGColor =  Colors.blue[50];

  /// font color - grey
  static Color fontGreyColor =  Colors.grey[600];

  /// Set theme colors
  static setColors(Brightness brightness){
    AppCustomColor.themeFrontColor =
    brightness == Brightness.dark ? Colors.white : Color(0xFF1F253B);

    AppCustomColor.themeBackgroudColor =
    brightness == Brightness.dark ? Colors.black : Colors.white;

    AppCustomColor.aboutPageBannerBGColor =
    brightness == Brightness.dark ? Colors.black45 : Colors.blue[50];

    AppCustomColor.navBgColor =
    brightness == Brightness.dark ? Color(0xFF191E32) : Colors.white;
  }

  /// 
  static String fontFamily = 'OpenSansCondensed';
}
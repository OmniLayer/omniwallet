import 'package:scoped_model/scoped_model.dart';
import 'package:wallet_app/model/wallet_info.dart';

class SelectLanguageModel extends Model {
  String _selectedLanguage = '';
  get getSelectedLanguage => _selectedLanguage;

  WalletInfo _currWalletInfo;
  set currWalletInfo(WalletInfo info){
    this._currWalletInfo = info;
  }
  WalletInfo get currWalletInfo{
    return _currWalletInfo;
  }

  void setSelectedLanguage(String setLanguage) {
    _selectedLanguage = setLanguage;
    notifyListeners();
  }


}
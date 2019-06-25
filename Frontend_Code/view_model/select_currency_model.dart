/// Model for Select Currency.
/// [author] Kevin Zhang
/// [time] 2019-5-7

import 'package:scoped_model/scoped_model.dart';
import 'package:wallet_app/model/global_model.dart';

class SelectCurrencyModel extends Model {
  String _selectedCurrency = '';
  get getCurrencyUnit => _selectedCurrency;

  ///
  void setCurrencyUnit(String setCurrencyUnit) {
    _selectedCurrency = setCurrencyUnit;
    GlobalInfo.currencyUnit = setCurrencyUnit;
    notifyListeners();
  }
}
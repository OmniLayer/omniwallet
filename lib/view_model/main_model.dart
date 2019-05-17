
import 'package:wallet_app/view_model/state_lib.dart';

class MainStateModel extends Model with 
    SelectLanguageModel, WalletModel, UserUsualAddressModel,
    BackupMnemonicPhrase, SelectCurrencyModel, SelectThemeModel

{
  MainStateModel of(context) =>
      ScopedModel.of<MainStateModel>(context, rebuildOnChange: false);
}

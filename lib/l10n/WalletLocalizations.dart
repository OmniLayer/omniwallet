import 'package:flutter/material.dart';

class WalletLocalizations{
  
  final Locale locale;
  WalletLocalizations(this.locale);

  static Map<String, Map<String, String>> _localizedValues = {

    'zh': {
      'main_index_title': 'Omni Wallet',
      'backup_index_prompt_btn': '知道了',
      'backup_index_title': '备份钱包',
      'backup_index_laterbackup': '稍后备份',
      'backup_index_btn': '立即备份',
      'backup_index_tips_title': '请立即备份您的钱包!',
      'backup_index_tips': '注意：请备份你的钱包账户，Omniwallet 不会访问你的账户、不能恢复私钥、'
        '重置密码。你自己控制自己的钱包和资产安全。',
      'backup_index_prompt_tips': '任何人得到你的助记词将能获得你的资产。\n请抄写在纸上妥善保管。',
      'backup_index_prompt_title': '不要截屏',
      'backup_words_title': '备份助记词',
      'backup_words_next': '继续',
      'backup_words_content': '请仔细抄写下方助记词，我们将在\n下一步验证。',
      'backup_words_warn': "不要和他人分享你的助记词，保护好他们",
      'backup_words_order_title': '确认助记词',
      'backup_words_order_content': '请按顺序点击助记词，以确认您\n正确备份。',
      'backup_words_order_error': '顺序错误，重试一次！',
      'backup_words_order_finish': '完成',

      'restore_account_title': '恢复已有帐号',
      'restore_account_phrase_title': '请输入助记词',
      'restore_account_tips': '注意：使用助记词导入账号后，你可以重置PIN码。',
      'restore_account_resetPIN': '重置PIN码',
      'restore_account_tip_pin': '新的PIN码',
      'restore_account_tip_OldPin': '原有PIN码',
      'restore_account_tip_confirmPin': '确认PIN码',
      'restore_account_btn_restore': '恢复',
      'restore_account_tip_error': '错误PIN码',
      'restore_account_tip_error2': '旧PIN码错误',
      'restore_account_tip_error3': '两个新PIN码不一致',
      'restore_account_tip_error1': '错误助记词',

      'welcomePageOneTitle' : '欢迎加入 Omni 平台！',
      'welcomePageOneContent' : "为了您的安全，请您抽时间来了解一些重要信息。\n\n"
          "如果您访问了钓鱼网站或丢失备份的助记词，我们无法恢复您的资金或冻结您的帐户。\n\n"
          "如您愿意继续使用我们的平台，您同意接受与您助记词损失相关的所有风险。如果您丢失了助记词，"
          "您同意并承认 Omni 平台不会对此造成的负面后果承担责任。",
      'welcomePageOneButton' : '您需要知道的关于助记词的信息',

      'welcomePageTwoTitle' : '您需要知道的关于助记词的信息',
      'welcomePageTwoContentOne' : "注册您的账户时，您要保存您的助记词并使用助记词来保护您的账户。"
          "在普通的中央服务器上，您特别注意密码, 而且您可以通过电子邮件更改和重置密码。然而，Omni 与众不同 — "
          "该钱包安全地储存在您使用的设备上 ：",
      'welcomePageTwoContentTwo' : "您匿名地使用您的钱包，指的是您的账户未连接到电子邮件账户或任何其他识别数据。",
      'welcomePageTwoContentThree' : "用某个设备或浏览器时，您的助记词可以保护您的账户，"
          "为了确保您的助记词不被保存在存储器中。",
      'welcomePageTwoContentFour' : "如果您忘记了PIN码，可以联系我们的客服人员。"
          "但是，如果遗失了助记词，将无法访问您的帐户。",
      'welcomePageTwoContentFive' : "你不能改变你的助记词。如果您不小心将其发送给某人或怀疑诈骗者已将"
          "其移交给他人，请立即创建一个新的 Omni 钱包并将资金转入其中。",
      'welcomePageTwoButtonBack' : '返回',
      'welcomePageTwoButtonNext' : '保护自己',

      'welcomePageThreeTitle' : '如何防止网络钓鱼攻击',
      'welcomePageThreeContentOne' : "诈骗最常见的攻击方式之一是网络钓鱼，一般钓鱼者在Facebook或其他类"
          "似于真实的网站上创建假社群。",
      'welcomePageThreeContentTwo' : "请总是检查URL: https://www.omnilayer.org",
      'welcomePageThreeContentThree' : "访问您的账户时请不要使用具有扩展程序或插件的浏览器。",
      'welcomePageThreeContentFour' : "请不要打开来自未知发件人的电子邮件或链接。",
      'welcomePageThreeContentFive' : "请您定期更新您的浏览器和操作系统。",
      'welcomePageThreeContentSix' : "请您使用官方安全软件。请不要安装会被黑客攻击的未知软件。",
      'welcomePageThreeContentSeven' : "使用公共Wi-Fi或其他人的设备时请勿访问您的钱包。",
      'welcomePageThreeButtonBack' : '返回',
      'welcomePageThreeButtonNext' : '我了解',

      'startPageAppBarTitle' : 'Omni Wallet',
      'startPageButtonFirst' : '开始使用',
      'startPageButtonSecond' : '恢复钱包',
      'startPageLanguageBarTitle' : '多语言',

      'main_page_title' : '钱包',
      'common_btn_skip' : '跳过',
      'common_btn_copy' : '复制',
      'common_btn_save': '保存',
      'common_btn_confirm': '确定',
      'common_tips_input': '请输入',
      'common_tips_finish': '提交成功',
      'common_tips_refresh': '刷新',

      'marketPageAppBarTitle' : '行情',
      'marketPageFav' : '自选',
      'marketPageAll' : '全部',
      'marketPagePrice' : '价格',
      'marketPageChange' : '涨跌幅',

      'myProfilePageMenu1' : '设置',
      'myProfilePageMenu2' : '常用地址管理',
      'myProfilePageMenu3' : '帮助和反馈',
      'myProfilePageMenu4' : '服务条款',
      'myProfilePageMenu5' : '备份钱包',
      'myProfilePageMenu6' : '关于我们',
      'myProfilePageMenu7' : '钱包地址管理',

      'settingsPageTitle' : '设置',
      'settingsPageItem_1_Title' : '多语言',
      'settingsPageItem_2_Title' : '货币单位',
      'settingsPageItem_3_Title' : '颜色主题',

      'helpPageTitle' : '帮助',
      'helpPageItemTitle' : '常见问题',
      'helpPageFeedback' : '提交反馈',

      'feedbackPageTitle' : '提交反馈',
      'feedbackPageInputTitleTooltip' : '标题',
      'feedbackPageContentTooltip' : '内容',
      'feedbackPageEmailTooltip' : '电子邮件',
      'feedbackPageUploadPicTitle' : '上传图片',
      'feedbackPageSubmitButton' : '提交',

      "createNewAddress_title":"创建新的地址",
      "createNewAddress_hint1":"地址名称",
      "createNewAddress_Add":"添加",
      "createNewAddress_Cancel":"取消",
      "createNewAddress_WrongAddress":"请输入地址名称",
      "address_book_title":"地址簿",

      'serviceTermsPageAppBarTitle' : '服务条款',

      'aboutPageAppBarTitle' : '关于我们',
      'aboutPageAppName' : 'Omni 钱包',
      'aboutPageItem_1' : '版本日志',
      'aboutPageItem_2' : '官方网站',
      'aboutPageItem_3' : '推特',
      'aboutPageItem_4' : '微信',
      'aboutPageItem_5' : '电报群',
      'aboutPageButton' : '版本更新',

      'userInfoPageAppBarTitle' : '我的身份',
      'userInfoPageItem_1_Title' : '头像',
      'userInfoPageItem_2_Title' : '昵称',
      'userInfoPageItem_3_Title' : '更新PIN码',
      'userInfoPageButton' : '退出当前身份',
      'userInfoPageDeleteMsg' : '即将移除所有钱包数据，请确保所有数据已经备份！',


      'appVersionTitle' : '新版本',
      'appVersionContent1' : '有新的版本了，更新吧',
      'appVersionBtn1' : '以后再说',
      'appVersionBtn2' : '好的',
      'appVersionNoNewerVersion' : '已经是最新的版本',

      'buttom_tab1_name' : '钱包',
      'buttom_tab2_name' : '市场',
      'buttom_tab3_name' : 'Flash Pay',
      'buttom_tab4_name' : '我的',

      'wallet_detail_content_send' : '转账',
      'wallet_detail_content_receive' : '收款',
      'wallet_receive_page_copy' : '复制',
      'wallet_receive_page_share' : '分享',
      'wallet_receive_page_tips_copy' : '复制成功',
      'wallet_receive_page_tips_share' : '分享成功',
      'wallet_send_page_to' : '转到',
      'wallet_send_page_input_address_hint' : '请输入地址',
      'wallet_send_page_input_address_error' : '地址为空',
      'wallet_send_page_title_amount' : '数量',
      'wallet_send_page_title_balance' : '余额',
      'wallet_send_page_input_amount' : '请输入数量',
      'wallet_send_page_input_amount_error' : '数量不对',
      'wallet_send_page_title_note' : '备注',
      'wallet_send_page_input_note' : '选填',
      'wallet_send_page_title_minerFee' : '矿工费用',
      'wallet_send_page_title_minerFee_input_title' : '自定义',

      'wallet_trade_info_detail_title' : '交易记录详情',
      'wallet_trade_info_detail_title2' : '转账',
      'wallet_trade_info_detail_finish_state1' : '确认中',
      'wallet_trade_info_detail_finish_state2' : '已完成',

      'wallet_trade_info_detail_item_To' : '转到',
      'wallet_trade_info_detail_item_From' : '来自',
      'wallet_trade_info_detail_item_Memo' : '备注',
      'wallet_trade_info_detail_item_Date' : '时间',
      'wallet_trade_info_detail_item_txid' : '交易ID',
      'wallet_trade_info_detail_item_confirmIndex' : '确认Block',
      'wallet_trade_info_detail_item_confirmCount' : '确认数',

      'languagePageAppBarTitle' : '多语言',
      'languagePageSaveButton' : '保存',
      
      'createAccountPageAppBarTitle' : '创建新账号',
      'createAccountPageTooltip_1' : '昵称',
      'createAccountPageTooltip_2' : 'PIN码',
      'createAccountPageTooltip_3' : '确认PIN码',
      'createAccountPageTooltip_4' : '输入6位数字保护资产',
      'createAccountPageButton' : '创建',
      'createAccountPageErrMsgEmpty' : '不能为空',
      'createAccountPageErrMsgLength' : '长度不够',
      'createAccountPageErrMsgInconsistent' : '两个PIN码不一致',

      'imagePickerBottomSheet_1' : '从手机相册选择',
      'imagePickerBottomSheet_2' : '拍照',

      'walletAddressPageAppBarTitle' : '钱包地址',
      'walletAddressPageListTitle' : '修改钱包地址名，显示或隐藏钱包地址和资产。',
      'walletAddressPageHidden' : '已隐藏',

      'addressManagePageAppBarTitle' : '钱包地址管理',
      'addressManagePageEditTips' : '新名字',
      'addressManagePageEditButton' : '编辑',
      'addressManagePageDoneButton' : '完成',
      'addressManagePageAddressNameTitle' : '地址名字',
      'addressManagePageAddressDisplayTitle' : '地址显示 / 隐藏',
      'addressManagePageAddressDisplay' : '地址显示',
      'addressManagePageAssetsDisplay' : '资产显示',

      'displayedAssetsPageAppBarTitle' : '资产显示',
      'displayedAssetsPageTitle_1' : '热门资产',
      'displayedAssetsPageTitle_2' : '其它资产',

      'updateNickNamePageAppBarTitle' : '更新昵称',
      'updateNickNamePageEditTips' : '请输入新昵称',

      'currencyPageAppBarTitle' : '货币单位',

      'themePageAppBarTitle' : '颜色主题',
      'themePageItem_1' : '亮色',
      'themePageItem_2' : '暗色',

      'unlockPageAppBarTitle' : '解锁',
      'unlockPageAppTips' : 'PIN码不正确',

      'me_about_app_upgrade_log_title' : '版本日志',
    },

    'en': {
      'main_index_title': 'Omni Wallet',
      'backup_index_prompt_btn': 'I got it',
      'backup_index_title': 'Back Up Wallet',
      'backup_index_laterbackup': 'Later',
      'backup_index_btn': 'Back Up Now!',
      'backup_index_tips_title': 'Back up your wallet now!',
      'backup_index_tips': 'Notice: please back up your wallet, Omni will never visit your '
        'account, can not restore your private key or reset your password. You will manage '
        'your wallet on your own, and make sure the safety of your asset.',
      'backup_index_prompt_tips': 'Anyone who gets access to your Mnemonic Phrase will have '
        'access to your assets. Please copy it onto paper and store securely for safekeeping.',
      'backup_index_prompt_title': "Do Not Use Screenshots!",
      'backup_words_title': 'Back Up Mnemonic Phrase',
      'backup_words_next': 'Next',
      'backup_words_content': "Write down or copy these words in the right order and save "
        "them somewhere safe.",
      'backup_words_warn': "Never share recovery phrase with anyone, store it securely!",

      'backup_words_order_title': 'Confirm mnemonic words',
      'backup_words_order_content': 'Click the following 12-word phrase in exact sequence, '
        'to make sure you have a correct backup.',
      'backup_words_order_error': 'Invalid order. Try again!',
      'backup_words_order_finish': 'Finish',

      'restore_account_title': 'Restore Account',
      'restore_account_tips': 'Notice: after importing account by Mnemonic Phrase, you can '
        'reset PIN for safety concerns.',
      'restore_account_phrase_title': 'Input Mnemonic words',
      'restore_account_resetPIN': 'Reset PIN',
      'restore_account_tip_pin': 'New PIN',
      'restore_account_tip_OldPin': 'Old PIN',
      'restore_account_tip_confirmPin': 'Confirm PIN',
      'restore_account_btn_restore': 'Restore',
      'restore_account_tip_error': 'Wrong PIN input',
      'restore_account_tip_error1': 'Wrong Mnemonic',
      'restore_account_tip_error2': 'Wrong Old PIN input',
      'restore_account_tip_error3': 'New pin and comfirm pin is not same',



      'welcomePageOneTitle' : 'Welcome to the Omni Platform!',
      'welcomePageOneContent' : "Please take some time to understand some "
          "important things for your own safety. \n\nWe cannot recover your "
          "funds or freeze your account if you visit a phishing site or lose "
          "your backup mnemonic phrase.  \n\nBy continuing to use our "
          "platform, you agree to accept all risks associated with the loss of "
          "your mnemonic phrase, including but not limited to the inability to obtain your "
          "funds and dispose of them. In case you lose your mnemonic phrase, you agree and "
          "acknowledge that the Omni Platform would not be responsible for the "
          "negative consequences of this.",
      'welcomePageOneButton' : 'About Mnemonic Phrase',

      'welcomePageTwoTitle' : 'What you need to know \nabout your Mnemonic Phrase',
      'welcomePageTwoContentOne' : "When registering your account, you will be asked "
          "to save your mnemonic phrase and to protect your account with a PIN code. "
          "On normal centralized servers, special attention is paid to the password, which "
          "can be changed and reset via email, if the need arises. However, on decentralized "
          "platforms such as Omni, everything is arranged differently:",
      'welcomePageTwoContentTwo' : "You use your wallet anonymously, meaning your account "
          "is not connected to an email account or any other identifying data.",
      'welcomePageTwoContentThree' : "Your password protects your account when working on "
          "a certain device or browser. It is needed in order to ensure that your secret "
          "mnemonic phrase is not saved in storage.",
      'welcomePageTwoContentFour' : "If you forget your PIN code, you can contact our customer "
        "service staff. If you lose your mnemonic phrase, however, you will have no way to access "
        "your account.",
      'welcomePageTwoContentFive' : "You cannot change your mnemonic phrase. If you "
          "accidentally sent it to someone or suspect that scammers have taken it over, "
          "then create a new Omniwallet immediately and transfer your funds to it.",
      'welcomePageTwoButtonBack' : 'Go Back',
      'welcomePageTwoButtonNext' : 'Protect Yourself',

      'welcomePageThreeTitle' : 'How To Protect Yourself from Phishers',
      'welcomePageThreeContentOne' : "One of the most common forms of scamming is "
          "phishing, which is when scammers create fake communities on Facebook or "
          "other websites that look similar to the authentic ones.",
      'welcomePageThreeContentTwo' : "Always check the URL: https://www.omnilayer.org",
      'welcomePageThreeContentThree' : "Do not use browsers that have extensions or "
          "plugins to access your account.",
      'welcomePageThreeContentFour' : "Do not open emails or links from unknown senders.",
      'welcomePageThreeContentFive' : "Regularly update your browser and operating system.",
      'welcomePageThreeContentSix' : "Use official security software. Do not install "
          "unknown software which could be hacked.",
      'welcomePageThreeContentSeven' : "Do not access your wallet when using public "
          "Wi-Fi or someone else’s device.",
      'welcomePageThreeButtonBack' : 'Go Back',
      'welcomePageThreeButtonNext' : 'I Understand',

      'startPageAppBarTitle' : 'Omni Wallet',
      'startPageButtonFirst' : 'Get Started',
      'startPageButtonSecond' : 'Restore wallet',
      'startPageLanguageBarTitle' : 'Language',

      'main_page_title' : 'My Wallet',
      'common_btn_skip' : 'Skip',
      'common_btn_copy' : 'Copy',
      'common_btn_save' : 'Save',
      'common_btn_confirm' : 'Confirm',
      'common_tips_input' : 'please input ',
      'common_tips_finish' : 'submit succuess ',
      'common_tips_refresh' : 'Refresh',

      'marketPageAppBarTitle' : 'Quotation',
      'marketPageFav' : 'Favorites',
      'marketPageAll' : 'All',
      'marketPagePrice' : 'Price',
      'marketPageChange' : 'Change',

      'myProfilePageMenu1' : 'Settings',
      'myProfilePageMenu2' : 'Address Book',
      'myProfilePageMenu3' : 'Help and Feedback',
      'myProfilePageMenu4' : 'Service Terms',
      'myProfilePageMenu5' : 'Back Up Wallet',
      'myProfilePageMenu6' : 'About US',
      'myProfilePageMenu7' : 'Wallet Address',

      'settingsPageTitle' : 'Settings',
      'settingsPageItem_1_Title' : 'Languages',
      'settingsPageItem_2_Title' : 'Currency Unit',
      'settingsPageItem_3_Title' : 'Color Theme',

      'helpPageTitle' : 'Help',
      'helpPageItemTitle' : 'FAQ',
      'helpPageFeedback' : 'Feedback',

      'feedbackPageTitle' : 'Submit Feedback',
      'feedbackPageInputTitleTooltip' : 'Title',
      'feedbackPageContentTooltip' : 'Content',
      'feedbackPageEmailTooltip' : 'E-mail',
      'feedbackPageUploadPicTitle' : 'Upload Picture',
      'feedbackPageSubmitButton' : 'Submit',

      "createNewAddress_title":"Create New Address",
      "createNewAddress_hint1":"Address Name",
      "createNewAddress_Add":"Add",
      "createNewAddress_Cancel":"Cancel",
      "createNewAddress_WrongAddress":"Please input address name",
      "address_book_title":"Address Book",

      'serviceTermsPageAppBarTitle' : 'Service Terms',

      'aboutPageAppBarTitle' : 'About US',
      'aboutPageAppName' : 'Omni Wallet',
      'aboutPageItem_1' : 'Version History',
      'aboutPageItem_2' : 'Website',
      'aboutPageItem_3' : 'Twitter',
      'aboutPageItem_4' : 'Wechat',
      'aboutPageItem_5' : 'Telegram',
      'aboutPageButton' : 'Version Update',

      'userInfoPageAppBarTitle' : 'My Identity',
      'userInfoPageItem_1_Title' : 'Avatar',
      'userInfoPageItem_2_Title' : 'Nick Name',
      'userInfoPageItem_3_Title' : 'Update PIN Code',
      'userInfoPageButton' : 'Logout Current Identity',

      'userInfoPageDeleteMsg' : "All wallet data will be removed, "
        "make sure all data have been backed up already!",

      'appVersionTitle' : 'New version',
      'appVersionContent1' : 'Has a newer version, you should update.',
      'appVersionBtn1' : 'Later',
      'appVersionBtn2' : 'OK',
      'appVersionNoNewerVersion' : 'The version already is latest.',

      'buttom_tab1_name' : 'Wallet',
      'buttom_tab2_name' : 'Market',
      'buttom_tab3_name' : 'Flash Pay',
      'buttom_tab4_name' : 'Me',

      'wallet_detail_content_send' : 'Send',
      'wallet_detail_content_receive' : 'Receive',
      'wallet_receive_page_copy' : 'Copy',
      'wallet_receive_page_share' : 'Share',
      'wallet_receive_page_tips_copy' : 'copy success',
      'wallet_receive_page_tips_share' : 'share success',

      'wallet_send_page_to' : 'To',
      'wallet_send_page_input_address_hint' : 'please input address',
      'wallet_send_page_input_address_error' : 'empty address',

      'wallet_send_page_title_amount' : 'Amount',
      'wallet_send_page_title_balance' : 'Balance',
      'wallet_send_page_input_amount' : 'please input amount',
      'wallet_send_page_input_amount_error' : 'wrong amount',
      'wallet_send_page_title_note' : 'Memo',
      'wallet_send_page_input_note' : 'Optional',
      'wallet_send_page_title_minerFee' : 'Miner Fee',
      'wallet_send_page_title_minerFee_input_title' : 'Custom',

      'wallet_trade_info_detail_title' : 'Transaction Details',
      'wallet_trade_info_detail_title2' : 'Sent',
      'wallet_trade_info_detail_finish_state1' : 'Unconfirmed',
      'wallet_trade_info_detail_finish_state2' : 'Finish',

      'wallet_trade_info_detail_item_To' : 'To',
      'wallet_trade_info_detail_item_From' : 'From',
      'wallet_trade_info_detail_item_Memo' : 'Memo',
      'wallet_trade_info_detail_item_Date' : 'Date',
      'wallet_trade_info_detail_item_txid' : 'Transaction Id',
      'wallet_trade_info_detail_item_confirmIndex' : 'Confirmed In Block',
      'wallet_trade_info_detail_item_confirmCount' : 'Confirmations',

      'languagePageAppBarTitle' : 'Languages',
      'languagePageSaveButton' : 'Save',

      'createAccountPageAppBarTitle' : 'Create New Account',
      'createAccountPageTooltip_1' : 'Nick Name',
      'createAccountPageTooltip_2' : 'PIN Code',
      'createAccountPageTooltip_3' : 'Confirm PIN Code',
      'createAccountPageTooltip_4' : '6 numbers to protect your assets.',
      'createAccountPageButton' : 'Create',
      'createAccountPageErrMsgEmpty' : 'Should not be empty',
      'createAccountPageErrMsgLength' : 'Length is not enough',
      'createAccountPageErrMsgInconsistent' : '2 pin codes are inconsistent',

      'imagePickerBottomSheet_1' : 'Choose from Album',
      'imagePickerBottomSheet_2' : 'Take Photo',

      'walletAddressPageAppBarTitle' : 'Wallet Address',
      'walletAddressPageListTitle' : 'Manage wallet address name, assets display.',
      'walletAddressPageHidden' : 'Hiddened',

      'addressManagePageAppBarTitle' : 'Address Management',
      'addressManagePageEditTips' : 'input new name',
      'addressManagePageEditButton' : 'Edit',
      'addressManagePageDoneButton' : 'Done',
      'addressManagePageAddressNameTitle' : 'Address Name',
      'addressManagePageAddressDisplayTitle' : 'Switch Address Display',
      'addressManagePageAddressDisplay' : 'Address Display',
      'addressManagePageAssetsDisplay' : 'Assets Display',

      'displayedAssetsPageAppBarTitle' : 'Display Assets',
      'displayedAssetsPageTitle_1' : 'Popular Assets',
      'displayedAssetsPageTitle_2' : 'Other Assets',

      'updateNickNamePageAppBarTitle' : 'Update Nick Name',
      'updateNickNamePageEditTips' : 'input new nick name',

      'currencyPageAppBarTitle' : 'Currency Unit',

      'themePageAppBarTitle' : 'Color Theme',
      'themePageItem_1' : 'Light',
      'themePageItem_2' : 'Dark',

      'unlockPageAppBarTitle' : 'Unlock App',
      'unlockPageAppTips' : 'PIN Code is incorrect.',

      'me_about_app_upgrade_log_title' : 'Version History',
    }
  };

  // unlock page
  get unlockPageAppBarTitle => _localizedValues[locale.languageCode]['unlockPageAppBarTitle'];
  get unlockPageAppTips => _localizedValues[locale.languageCode]['unlockPageAppTips'];

  // app theme
  get themePageAppBarTitle => _localizedValues[locale.languageCode]['themePageAppBarTitle'];
  get themePageItem_1 => _localizedValues[locale.languageCode]['themePageItem_1'];
  get themePageItem_2 => _localizedValues[locale.languageCode]['themePageItem_2'];

  // currency unit
  get currencyPageAppBarTitle => _localizedValues[locale.languageCode]['currencyPageAppBarTitle'];

  // Update Nick Name
  get updateNickNamePageAppBarTitle => _localizedValues[locale.languageCode]['updateNickNamePageAppBarTitle'];
  get updateNickNamePageEditTips => _localizedValues[locale.languageCode]['updateNickNamePageEditTips'];
  
  // Displayed Assets
  get displayedAssetsPageAppBarTitle => _localizedValues[locale.languageCode]['displayedAssetsPageAppBarTitle'];
  get displayedAssetsPageTitle_1 => _localizedValues[locale.languageCode]['displayedAssetsPageTitle_1'];
  get displayedAssetsPageTitle_2 => _localizedValues[locale.languageCode]['displayedAssetsPageTitle_2'];

  // wallet address Page
  get walletAddressPageAppBarTitle => _localizedValues[locale.languageCode]['walletAddressPageAppBarTitle'];
  get walletAddressPageListTitle => _localizedValues[locale.languageCode]['walletAddressPageListTitle'];
  get walletAddressPageHidden => _localizedValues[locale.languageCode]['walletAddressPageHidden'];

  // address management Page
  get addressManagePageAppBarTitle => _localizedValues[locale.languageCode]['addressManagePageAppBarTitle'];
  get addressManagePageEditTips => _localizedValues[locale.languageCode]['addressManagePageEditTips'];
  get addressManagePageEditButton => _localizedValues[locale.languageCode]['addressManagePageEditButton'];
  get addressManagePageDoneButton => _localizedValues[locale.languageCode]['addressManagePageDoneButton'];
  get addressManagePageAddressNameTitle => _localizedValues[locale.languageCode]['addressManagePageAddressNameTitle'];
  get addressManagePageAddressDisplayTitle => _localizedValues[locale.languageCode]['addressManagePageAddressDisplayTitle'];
  get addressManagePageAddressDisplay => _localizedValues[locale.languageCode]['addressManagePageAddressDisplay'];
  get addressManagePageAssetsDisplay => _localizedValues[locale.languageCode]['addressManagePageAssetsDisplay'];

  // create account Page
  get createAccountPageAppBarTitle => _localizedValues[locale.languageCode]['createAccountPageAppBarTitle'];
  get createAccountPageTooltip_1 => _localizedValues[locale.languageCode]['createAccountPageTooltip_1'];
  get createAccountPageTooltip_2 => _localizedValues[locale.languageCode]['createAccountPageTooltip_2'];
  get createAccountPageTooltip_3 => _localizedValues[locale.languageCode]['createAccountPageTooltip_3'];
  get createAccountPageTooltip_4 => _localizedValues[locale.languageCode]['createAccountPageTooltip_4'];
  get createAccountPageButton => _localizedValues[locale.languageCode]['createAccountPageButton'];
  get createAccountPageErrMsgEmpty => _localizedValues[locale.languageCode]['createAccountPageErrMsgEmpty'];
  get createAccountPageErrMsgLength => _localizedValues[locale.languageCode]['createAccountPageErrMsgLength'];
  get createAccountPageErrMsgInconsistent => _localizedValues[locale.languageCode]['createAccountPageErrMsgInconsistent'];

  // Select Language Page
  get languagePageAppBarTitle => _localizedValues[locale.languageCode]['languagePageAppBarTitle'];
  get languagePageSaveButton => _localizedValues[locale.languageCode]['languagePageSaveButton'];

  get wallet_trade_info_detail_title => _localizedValues[locale.languageCode]['wallet_trade_info_detail_title'];
  get wallet_trade_info_detail_title2 => _localizedValues[locale.languageCode]['wallet_trade_info_detail_title2'];
  get wallet_trade_info_detail_finish_state1 => _localizedValues[locale.languageCode]['wallet_trade_info_detail_finish_state1'];
  get wallet_trade_info_detail_finish_state2 => _localizedValues[locale.languageCode]['wallet_trade_info_detail_finish_state2'];

  get wallet_trade_info_detail_item_To => _localizedValues[locale.languageCode]['wallet_trade_info_detail_item_To'];
  get wallet_trade_info_detail_item_From => _localizedValues[locale.languageCode]['wallet_trade_info_detail_item_From'];
  get wallet_trade_info_detail_item_Memo => _localizedValues[locale.languageCode]['wallet_trade_info_detail_item_Memo'];
  get wallet_trade_info_detail_item_Date => _localizedValues[locale.languageCode]['wallet_trade_info_detail_item_Date'];
  get wallet_trade_info_detail_item_txid => _localizedValues[locale.languageCode]['wallet_trade_info_detail_item_txid'];
  get wallet_trade_info_detail_item_confirmIndex => _localizedValues[locale.languageCode]['wallet_trade_info_detail_item_confirmIndex'];
  get wallet_trade_info_detail_item_confirmCount => _localizedValues[locale.languageCode]['wallet_trade_info_detail_item_confirmCount'];

  get buttom_tab1_name => _localizedValues[locale.languageCode]['buttom_tab1_name'];
  get buttom_tab2_name => _localizedValues[locale.languageCode]['buttom_tab2_name'];
  get buttom_tab3_name => _localizedValues[locale.languageCode]['buttom_tab3_name'];
  get buttom_tab4_name => _localizedValues[locale.languageCode]['buttom_tab4_name'];

  // User Information page
  get userInfoPageAppBarTitle => _localizedValues[locale.languageCode]['userInfoPageAppBarTitle'];
  get userInfoPageItem_1_Title => _localizedValues[locale.languageCode]['userInfoPageItem_1_Title'];
  get userInfoPageItem_2_Title => _localizedValues[locale.languageCode]['userInfoPageItem_2_Title'];
  get userInfoPageItem_3_Title => _localizedValues[locale.languageCode]['userInfoPageItem_3_Title'];
  get userInfoPageButton => _localizedValues[locale.languageCode]['userInfoPageButton'];
  get userInfoPageDeleteMsg => _localizedValues[locale.languageCode]['userInfoPageDeleteMsg'];


  get appVersionTitle => _localizedValues[locale.languageCode]['appVersionTitle'];
  get appVersionContent1 => _localizedValues[locale.languageCode]['appVersionContent1'];
  get appVersionBtn1 => _localizedValues[locale.languageCode]['appVersionBtn1'];
  get appVersionBtn2 => _localizedValues[locale.languageCode]['appVersionBtn2'];
  get appVersionNoNewerVersion => _localizedValues[locale.languageCode]['appVersionNoNewerVersion'];

  // Service Terms page
  get serviceTermsPageAppBarTitle => _localizedValues[locale.languageCode]['serviceTermsPageAppBarTitle'];

  // About page
  get aboutPageAppBarTitle => _localizedValues[locale.languageCode]['aboutPageAppBarTitle'];
  get aboutPageAppName => _localizedValues[locale.languageCode]['aboutPageAppName'];
  get aboutPageItem_1 => _localizedValues[locale.languageCode]['aboutPageItem_1'];
  get aboutPageItem_2 => _localizedValues[locale.languageCode]['aboutPageItem_2'];
  get aboutPageItem_3 => _localizedValues[locale.languageCode]['aboutPageItem_3'];
  get aboutPageItem_4 => _localizedValues[locale.languageCode]['aboutPageItem_4'];
  get aboutPageItem_5 => _localizedValues[locale.languageCode]['aboutPageItem_5'];
  get aboutPageButton => _localizedValues[locale.languageCode]['aboutPageButton'];

  //wallet page createNewAddress dialog
  get createNewAddress_title => _localizedValues[locale.languageCode]['createNewAddress_title'];
  get createNewAddress_hint1 => _localizedValues[locale.languageCode]['createNewAddress_hint1'];
  get createNewAddress_Add => _localizedValues[locale.languageCode]['createNewAddress_Add'];
  get createNewAddress_Cancel => _localizedValues[locale.languageCode]['createNewAddress_Cancel'];
  get createNewAddress_WrongAddress => _localizedValues[locale.languageCode]['createNewAddress_WrongAddress'];
  get address_book_title => _localizedValues[locale.languageCode]['address_book_title'];

  // Submit Feedback page
  get feedbackPageTitle => _localizedValues[locale.languageCode]['feedbackPageTitle'];
  get feedbackPageInputTitleTooltip => _localizedValues[locale.languageCode]['feedbackPageInputTitleTooltip'];
  get feedbackPageContentTooltip => _localizedValues[locale.languageCode]['feedbackPageContentTooltip'];
  get feedbackPageEmailTooltip => _localizedValues[locale.languageCode]['feedbackPageEmailTooltip'];
  get feedbackPageUploadPicTitle => _localizedValues[locale.languageCode]['feedbackPageUploadPicTitle'];
  get feedbackPageSubmitButton => _localizedValues[locale.languageCode]['feedbackPageSubmitButton'];
  get imagePickerBottomSheet_1 => _localizedValues[locale.languageCode]['imagePickerBottomSheet_1'];
  get imagePickerBottomSheet_2 => _localizedValues[locale.languageCode]['imagePickerBottomSheet_2'];


  // Help and Feedback page
  get helpPageTitle => _localizedValues[locale.languageCode]['helpPageTitle'];
  get helpPageItemTitle => _localizedValues[locale.languageCode]['helpPageItemTitle'];
  get helpPageFeedback => _localizedValues[locale.languageCode]['helpPageFeedback'];

  // Setting page
  get settingsPageTitle => _localizedValues[locale.languageCode]['settingsPageTitle'];
  get settingsPageItem_1_Title => _localizedValues[locale.languageCode]['settingsPageItem_1_Title'];
  get settingsPageItem_2_Title => _localizedValues[locale.languageCode]['settingsPageItem_2_Title'];
  get settingsPageItem_3_Title => _localizedValues[locale.languageCode]['settingsPageItem_3_Title'];

  // My profile page
  get myProfilePageMenu1 => _localizedValues[locale.languageCode]['myProfilePageMenu1'];
  get myProfilePageMenu2 => _localizedValues[locale.languageCode]['myProfilePageMenu2'];
  get myProfilePageMenu3 => _localizedValues[locale.languageCode]['myProfilePageMenu3'];
  get myProfilePageMenu4 => _localizedValues[locale.languageCode]['myProfilePageMenu4'];
  get myProfilePageMenu5 => _localizedValues[locale.languageCode]['myProfilePageMenu5'];
  get myProfilePageMenu6 => _localizedValues[locale.languageCode]['myProfilePageMenu6'];
  get myProfilePageMenu7 => _localizedValues[locale.languageCode]['myProfilePageMenu7'];

  // Market Page
  get marketPageAppBarTitle => _localizedValues[locale.languageCode]['marketPageAppBarTitle'];
  get marketPageFav => _localizedValues[locale.languageCode]['marketPageFav'];
  get marketPageAll => _localizedValues[locale.languageCode]['marketPageAll'];
  get marketPagePrice => _localizedValues[locale.languageCode]['marketPagePrice'];
  get marketPageChange => _localizedValues[locale.languageCode]['marketPageChange'];

  // Start Page.
  get startPageAppBarTitle => _localizedValues[locale.languageCode]['startPageAppBarTitle'];
  get startPageButtonFirst => _localizedValues[locale.languageCode]['startPageButtonFirst'];
  get startPageButtonSecond => _localizedValues[locale.languageCode]['startPageButtonSecond'];
  get startPageLanguageBarTitle => _localizedValues[locale.languageCode]['startPageLanguageBarTitle'];

  // Welcome Page One.
  get welcomePageOneTitle => _localizedValues[locale.languageCode]['welcomePageOneTitle'];
  get welcomePageOneContent => _localizedValues[locale.languageCode]['welcomePageOneContent'];
  get welcomePageOneButton => _localizedValues[locale.languageCode]['welcomePageOneButton'];

  // Welcome Page Two.
  get welcomePageTwoTitle => _localizedValues[locale.languageCode]['welcomePageTwoTitle'];
  get welcomePageTwoContentOne => _localizedValues[locale.languageCode]['welcomePageTwoContentOne'];
  get welcomePageTwoContentTwo => _localizedValues[locale.languageCode]['welcomePageTwoContentTwo'];
  get welcomePageTwoContentThree => _localizedValues[locale.languageCode]['welcomePageTwoContentThree'];
  get welcomePageTwoContentFour => _localizedValues[locale.languageCode]['welcomePageTwoContentFour'];
  get welcomePageTwoContentFive => _localizedValues[locale.languageCode]['welcomePageTwoContentFive'];
  get welcomePageTwoButtonBack => _localizedValues[locale.languageCode]['welcomePageTwoButtonBack'];
  get welcomePageTwoButtonNext => _localizedValues[locale.languageCode]['welcomePageTwoButtonNext'];

  // Welcome Page Three.
  get welcomePageThreeTitle => _localizedValues[locale.languageCode]['welcomePageThreeTitle'];
  get welcomePageThreeContentOne => _localizedValues[locale.languageCode]['welcomePageThreeContentOne'];
  get welcomePageThreeContentTwo => _localizedValues[locale.languageCode]['welcomePageThreeContentTwo'];
  get welcomePageThreeContentThree => _localizedValues[locale.languageCode]['welcomePageThreeContentThree'];
  get welcomePageThreeContentFour => _localizedValues[locale.languageCode]['welcomePageThreeContentFour'];
  get welcomePageThreeContentFive => _localizedValues[locale.languageCode]['welcomePageThreeContentFive'];
  get welcomePageThreeContentSix => _localizedValues[locale.languageCode]['welcomePageThreeContentSix'];
  get welcomePageThreeContentSeven => _localizedValues[locale.languageCode]['welcomePageThreeContentSeven'];
  get welcomePageThreeButtonBack => _localizedValues[locale.languageCode]['welcomePageThreeButtonBack'];
  get welcomePageThreeButtonNext => _localizedValues[locale.languageCode]['welcomePageThreeButtonNext'];

  get main_index_title => _localizedValues[locale.languageCode]['main_index_title'];

  get backup_index_title => _localizedValues[locale.languageCode]['backup_index_title'];
  get backup_index_laterbackup => _localizedValues[locale.languageCode]['backup_index_laterbackup'];
  get backup_index_tips_title => _localizedValues[locale.languageCode]['backup_index_tips_title'];
  get backup_index_tips => _localizedValues[locale.languageCode]['backup_index_tips'];
  get backup_index_btn => _localizedValues[locale.languageCode]['backup_index_btn'];
  get backup_index_prompt_title => _localizedValues[locale.languageCode]['backup_index_prompt_title'];
  get backup_index_prompt_tips => _localizedValues[locale.languageCode]['backup_index_prompt_tips'];
  get backup_index_prompt_btn => _localizedValues[locale.languageCode]['backup_index_prompt_btn'];

  get restore_account_title => _localizedValues[locale.languageCode]['restore_account_title'];
  get restore_account_tips => _localizedValues[locale.languageCode]['restore_account_tips'];
  get restore_account_phrase_title => _localizedValues[locale.languageCode]['restore_account_phrase_title'];
  get restore_account_resetPIN => _localizedValues[locale.languageCode]['restore_account_resetPIN'];
  get restore_account_tip_pin => _localizedValues[locale.languageCode]['restore_account_tip_pin'];
  get restore_account_tip_OldPin => _localizedValues[locale.languageCode]['restore_account_tip_OldPin'];
  get restore_account_tip_confirmPin => _localizedValues[locale.languageCode]['restore_account_tip_confirmPin'];
  get restore_account_btn_restore => _localizedValues[locale.languageCode]['restore_account_btn_restore'];
  get restore_account_tip_error => _localizedValues[locale.languageCode]['restore_account_tip_error'];
  get restore_account_tip_error1 => _localizedValues[locale.languageCode]['restore_account_tip_error1'];
  get restore_account_tip_error2 => _localizedValues[locale.languageCode]['restore_account_tip_error2'];
  get restore_account_tip_error3 => _localizedValues[locale.languageCode]['restore_account_tip_error3'];



  get backup_words_title => _localizedValues[locale.languageCode]['backup_words_title'];
  get backup_words_content => _localizedValues[locale.languageCode]['backup_words_content'];
  get backup_words_next => _localizedValues[locale.languageCode]['backup_words_next'];
  get backup_words_warn => _localizedValues[locale.languageCode]['backup_words_warn'];

  get backup_words_order_title => _localizedValues[locale.languageCode]['backup_words_order_title'];
  get backup_words_order_content => _localizedValues[locale.languageCode]['backup_words_order_content'];
  get backup_words_order_error => _localizedValues[locale.languageCode]['backup_words_order_error'];
  get backup_words_order_finish => _localizedValues[locale.languageCode]['backup_words_order_finish'];

  String get main_page_title => _localizedValues[locale.languageCode]['main_page_title'];

  String get common_btn_skip => _localizedValues[locale.languageCode]['common_btn_skip'];
  String get common_btn_copy => _localizedValues[locale.languageCode]['common_btn_copy'];
  String get common_btn_save => _localizedValues[locale.languageCode]['common_btn_save'];
  String get common_btn_confirm => _localizedValues[locale.languageCode]['common_btn_confirm'];
  String get common_tips_input => _localizedValues[locale.languageCode]['common_tips_input'];
  String get common_tips_finish => _localizedValues[locale.languageCode]['common_tips_finish'];
  String get common_tips_refresh => _localizedValues[locale.languageCode]['common_tips_refresh'];


  String get wallet_detail_content_send => _localizedValues[locale.languageCode]['wallet_detail_content_send'];
  String get wallet_detail_content_receive => _localizedValues[locale.languageCode]['wallet_detail_content_receive'];
  String get wallet_receive_page_copy => _localizedValues[locale.languageCode]['wallet_receive_page_copy'];
  String get wallet_receive_page_share => _localizedValues[locale.languageCode]['wallet_receive_page_share'];
  String get wallet_receive_page_tips_copy => _localizedValues[locale.languageCode]['wallet_receive_page_tips_copy'];
  String get wallet_receive_page_tips_share => _localizedValues[locale.languageCode]['wallet_receive_page_tips_share'];
  String get wallet_send_page_to => _localizedValues[locale.languageCode]['wallet_send_page_to'];
  String get wallet_send_page_input_address_hint => _localizedValues[locale.languageCode]['wallet_send_page_input_address_hint'];
  String get wallet_send_page_input_address_error => _localizedValues[locale.languageCode]['wallet_send_page_input_address_error'];
  String get wallet_send_page_title_amount => _localizedValues[locale.languageCode]['wallet_send_page_title_amount'];
  String get wallet_send_page_title_balance => _localizedValues[locale.languageCode]['wallet_send_page_title_balance'];
  String get wallet_send_page_input_amount => _localizedValues[locale.languageCode]['wallet_send_page_input_amount'];
  String get wallet_send_page_input_amount_error => _localizedValues[locale.languageCode]['wallet_send_page_input_amount_error'];
  String get wallet_send_page_title_note => _localizedValues[locale.languageCode]['wallet_send_page_title_note'];
  String get wallet_send_page_input_note => _localizedValues[locale.languageCode]['wallet_send_page_input_note'];
  String get wallet_send_page_title_minerFee => _localizedValues[locale.languageCode]['wallet_send_page_title_minerFee'];
  String get wallet_send_page_title_minerFee_input_title => _localizedValues[locale.languageCode]['wallet_send_page_title_minerFee_input_title'];

  String get me_about_app_upgrade_log_title => _localizedValues[locale.languageCode]['me_about_app_upgrade_log_title'];

  static WalletLocalizations of (BuildContext context){
    return Localizations.of(context, WalletLocalizations);
  }
}
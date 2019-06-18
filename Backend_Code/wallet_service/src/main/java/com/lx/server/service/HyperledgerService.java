package com.lx.server.service;

import java.math.BigDecimal;

import com.alibaba.fastjson.JSONObject;

public interface HyperledgerService {

	JSONObject getBaseAccount();

	JSONObject createAccount(String username);

	JSONObject accountInfo(String username);

	JSONObject balances(String username);

	JSONObject mintToken(String tkSymbol, BigDecimal amount);

	JSONObject burnToken(String tkSymbol, BigDecimal amount);

	JSONObject frozenAccount(String username);

	JSONObject unfrozenAccount(String username);

	JSONObject transferToken(String from,String to,String symbol,BigDecimal amount);

	JSONObject initToken(String tkSymbol);

}
